var socketio = require('socket.io');
var io;
var pokerIo;
var videoIo;

var pokerModule = require("./poker-module.js");

var pokerRooms = {};
/**
 * room에 있는 사용자 목록
 * pokerUsers[room][socketId] 형식의 값
 */
var pokerUsers = {};
/**
 * room에 선택된 카드목록
 */
var selectedCards = {};

var gameMemory = {};
/**
 * 전체 사용자
 */
var count = 0;
/**
 * 현재 방에서 진행중인 게임
 */
var currentGame = {};
var showUsername = {};

//var app = require('../app');
//var io = app.io;

module.exports.ready = function(socket)
{
	var pokerIo = this;

	function debug(str, data)
	{
		var val = '[' + str + ']';
		if (typeof data != 'undefined')
			val += ', data --> ' + JSON.stringify(data);
		console.error(val);
	}

	debug('poker connection');
	var socketId = socket.id;
	socketId = socketId.split('#').length > 1 ? socketId.split('#')[1] : socketId;

	socket.emit('connection', socketId);

	socket.on('room-list', function(data) {
		pokerIo.emit('room-list', getAvailableRoomList());
	});

	function getAvailableRoomList()
	{
		var roomList = {};
		for (var key in pokerRooms)
		{
			// 방이 있고 1명 이상일때
			if (pokerRooms[key].length > 0)
			{
				//console.error('key : ' + key);
				roomList[key] = pokerRooms[key].length;
			}
				//roomList[room].name = room;
			//console.error('roomList : ' + pokerRooms[key].length)

		}
		return roomList;
	}

	socket.on('login', function(data) {
			debug('login', data);
			var room = data.room;

			if (!currentGame[room] || currentGame[room] == '')
			{
					currentGame[room] = 'planning-poker';
			}

			if (room == '__login__')
			{
				return;
			}

			// 방이 없다면 새로 만든다.
			if (!pokerUsers[room])
			{
				pokerRooms = {};
				pokerUsers[room] = {};
				selectedCards[room] = {};
				gameMemory[room] = {};
				showUsername[room] = "Y";

				// 방목록을 전달한다.
				//pokerIo.emit('room-list', pokerUsers);
			}

			//socket.set('username', data.username);
			socket.username = data.username;
			socket.role = data.role;


			pokerModule.getUserAvata(socket, data);

			socket.join(room);

			socket.emit('userlist', pokerUsers[room]);

			if (currentGame[room] == 'planning-poker')
			{
					socket.emit('selected-card-list', selectedCards[room]);
			}

			pokerUsers[room][socketId] = {};
			pokerUsers[room][socketId].uid = socketId;
			pokerUsers[room][socketId].username = data.username;
			pokerUsers[room][socketId].role = data.role;
			pokerUsers[room][socketId].currentGame = currentGame[room];
			pokerUsers[room][socketId].showUsername = showUsername[room];
			pokerUsers[room][socketId].room = room;

			//console.error('_________length : ' + Object.keys(pokerRooms).length);
			if (typeof pokerRooms[room] == 'undefined')
			{
					pokerRooms[room] = [];
			}

			pokerRooms[room].push(socketId);

			for (var key in pokerRooms)
			{
					console.error('login');
					console.error('=======================================');
					console.error('name : ' + key);
					console.error('socketId : ' + socketId);
					console.error('user count : ' + pokerRooms[key].length);
					console.error('=======================================');
			}

			// room에 있는 사람들에게 보내기
			//pokerIo.in(room).emit('test');

			socket.emit('login-result', pokerUsers[room][socketId]);

			//pokerIo.emit('userlist', pokerUsers);
			pokerIo.in(room).emit('join-room', pokerUsers[room][socketId]);
			//pokerIo.in(room).emit('join-room', pokerUsers[socketId]);
			pokerModule.getUserAvata(socket, pokerUsers[socketId]);

			pokerIo.emit('room-list', getAvailableRoomList());
			count++;

	});

	socket.on('logout', function(data) {
			debug('logout', data);
			if (socketId != undefined)
			{
					var room = data.room;
					pokerIo.in(room).emit('logout', pokerUsers[room][socketId]);

					socket.broadcast.emit('leave-room', pokerUsers[room][socketId]);

					delete pokerUsers[room][socketId];
					delete selectedCards[room][socketId];


					for (var key in pokerRooms)
					{
						for (var i=0; i<pokerRooms[key].length; i++)
						{
							if (socketId == pokerRooms[key][i])
							{
								pokerRooms[key].splice(i, 1); // 삭제
							}
						}
					}
			}

			for (var key in pokerRooms)
			{
					console.error('logout');
					console.error('=======================================');
					console.error('name : ' + key);
					console.error('user count : ' + pokerRooms[key].length);
					console.error('=======================================');
			}

	});

	socket.on('rename-user', function(data) {
			debug('rename-user', data);

			var room = data.room;

			if (typeof selectedCards[room][socketId] != 'undefined')
			{
					selectedCards[room][socketId].username = data.username;
			}

			if (typeof pokerUsers[room][socketId] != 'undefined')
			{
				pokerUsers[room][socketId].username = data.username;
			}


			pokerIo.in(room).emit('rename-user', pokerUsers[room][socketId]);

			pokerModule.getUserAvata(socket, data);

	});

	socket.on('leave-room', function(data) {
			debug('leave-room', data);
			var room = data.room;
			pokerIo.in(room).emit('leave-room', data);
			count--;
	});

	socket.on('game.start', function(data) {
			debug('game.start', data);
			var room = data.room;

			currentGame[room] = data.game;
			pokerUsers[room][socketId].currentGame = currentGame[room];


			pokerIo.in(room).emit('game.start', pokerUsers[room][socketId]);
			pokerIo.in(room).emit('reset-card');
	});


	socket.on('planning-poker.start', function(data) {
			debug('planning-poker.start', data);
			var room = data.room;
			pokerIo.in(room).emit('planning-poker.start');
	});

	socket.on('search-issue', function(data) {
			debug('search-issue', data);
			pokerModule.searchIssue(socket, data.issueId);
	});

	socket.on('update-story', function(data) {
			pokerModule.updateStory(socket, data);
	});

	socket.on('userlist', function(data) {
			var room = data.room;
			pokerIo.in(room).emit('userlist', pokerUsers[room]);
	});

	socket.on('select-card', function(data) {
			debug('select-card', data);
			var room = data.room;
			if (!selectedCards[room][socketId])
			{
					selectedCards[room][socketId] = {};
					selectedCards[room][socketId].count = 0;
			}
			//selectedCardList[data.username] = {uid: data.uid, value: data.value};
			selectedCards[room][socketId].uid = data.uid;
			selectedCards[room][socketId].username = data.username;
			selectedCards[room][socketId].value = data.value;
			selectedCards[room][socketId].count = selectedCards[room][socketId].count+1;
			selectedCards[room][socketId].showUsername = showUsername[room];

//pokerIo.in(room).emit('select-card', selectedCardList[socketId]);
			pokerIo.in(room).emit('select-card', selectedCards[room][socketId]);

			//socket.emit('select-card', selectedCardList[socketId]);
	});

	socket.on('show-username', function(data) {
			var room = data.room;
			showUsername[room] = data.value;
			//pokerIo.emit('show-username', data);
	});

	socket.on('cancel-card', function(data) {
			debug('cancel-card', data);
			var room = data.room;
			delete selectedCards[room][socketId];
			data.showUsername = showUsername[room];

			pokerIo.in(room).emit('cancel-card', data);
	});

	socket.on('open-card', function(data) {
			debug('open-card', data);
			var room = data.room;
			pokerIo.in(room).emit('open-card');
	});

	socket.on('close-card', function(data) {
			debug('close-card', data);
			var room = data.room;
			pokerIo.in(room).emit('close-card');
	});

	socket.on('reset-card', function(data) {
			debug('reset-card', data);
			var room = data.room;
			selectedCards[room] = {};
			pokerIo.in(room).emit('reset-card');
	});

	socket.on('disconnect', function(data) {
			debug('disconnect', data);

			if (socketId != undefined)
			{
				for (var key in pokerUsers)
				{
					if (pokerUsers[key][socketId])
					{
						pokerIo.emit('leave-room', pokerUsers[key][socketId]);
						delete pokerUsers[key][socketId];
					}

					//console.error('key : ' + key);
					//console.error('key : ' + JSON.stringify(pokerUsers[key]));


					if (!pokerUsers[key] || pokerUsers[key].length == 0)
					{
						for (var room in pokerUsers)
						{
							/*
							if (key == room.name)
							{
									pokerUsers[key];
							}
							*/
						}

					}
				}

				for (var key in selectedCards)
				{
					if (selectedCards[key][socketId])
					{
						delete selectedCards[key][socketId];
					}
				}

				for (var key in pokerRooms)
				{
					for (var i=0; i<pokerRooms[key].length; i++)
					{
						if (socketId == pokerRooms[key][i])
						{
							console.error('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
							console.error('key : ' + key);
							console.error('i : ' + i);
							pokerRooms[key].splice(i, 1); // 삭제
							console.error(key + ' >> ' + pokerRooms[key]);
						}
					}
				}

				for (var key in pokerRooms)
				{
						console.error('disconnect');
						console.error('=======================================');
						console.error('name : ' + key);
						console.error('user count : ' + pokerRooms[key].length);
						console.error('=======================================');
				}
					//var room = data.room;
					//pokerIo.emit('leave-room', pokerUsers[room][socketId]);
					//delete pokerUsers[room][socketId];

					//pokerIo.emit('selected-card-list', selectedCardList);
					//delete selectedCards[room][socketId];
			}
	});


	socket.on('memory.start', function(data) {
			var room = data.room;

			var row = parseInt(data.row);
			var target = parseInt(data.target);
			var cards = [];

			for (var i=0; i<row; i++)
			{
					cards[i]= [];
					for (var j=0; j<row; j++)
					{
						 cards[i][j] = 0;
					}
			}

			var affected = 0;

			if (row*row >= target)
			{
					while (true)
					{
							var randomX = pokerModule.getRandom(row);
							var randomY = pokerModule.getRandom(row);

							if (!cards[randomX][randomY])
							{
									cards[randomX][randomY] = 1;
									affected++;
							}

							if (affected >= target)
							{
									break;
							}
					}
			}

			gameMemory[room] = cards;

			data.cards = cards;
			pokerIo.in(room).emit('memory.start', data);
	});

	socket.on('memory.select', function(data) {
			console.error(">>" + JSON.stringify(data))
			var room = data.room;

			data.flag = gameMemory[room][data.x][data.y];

			pokerIo.in(room).emit('memory.select', data);
	});

	socket.on('memory.changeRow', function(data) {
			socket.broadcast.emit('memory.changeRow', data);
	});

	socket.on('memory.changeTarget', function(data) {
			socket.broadcast.emit('memory.changeTarget', data);
	});
};
