var socketio = require('socket.io');
var crypto = require('crypto');
var iv = Buffer.from('0000000000000000');

var io;
var pokerIo;

var loginUsers = {};
var count = 0;

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

	base64_decode = function (encoded) {
	  return Buffer.from(encoded || '', 'base64').toString('utf8');
	};

	aes_decrypt = function(encryptedString)
	{
		//var iv = new Buffer('');
		var iv = Buffer.from('');
	 	//var key = new Buffer('5d7956657279546f705365637265744b', 'hex');
	 	var key = Buffer.from('5d7956657279546f705365637265744b', 'hex');
	 	var decipher = crypto.createDecipheriv('aes-128-ecb', key, iv);
		var decipheredPlaintext = decipher.update(encryptedString, 'base64', 'buffer');
		decipheredPlaintext += decipher.final('buffer');

		return decipheredPlaintext;
	}

	debug('spectra mobile connection');

	var socketId = socket.id;
	socketId = socketId.split('#').length > 1 ? socketId.split('#')[1] : socketId;

	socket.emit('connection', socketId);

	socket.on('connect', function(data) {
		debug('spectra mobile connect', data);

		try
		{
			var decodedString = aes_decrypt(data.encodedUserInfo);
			console.error("decodedString : " + decodedString);

				loginUsers[socketId] = JSON.parse(decodedString);
				loginUsers[socketId].socketId = socketId;
				socket.broadcast.emit('login', loginUsers[socketId]);
		}
		catch (e)
		{
			console.error("decrypt에러발생 : " + e);
		}

	});

	socket.on('active-user', function(data) {
		debug('spectra mobile active-user', data);

		socket.emit('active-user', loginUsers);
	});

	socket.on('disconnect', function(data) {
		debug('spectra mobile disconnect', data);
		//pokerIo.emit('room-list', getAvailableRoomList());
		delete loginUsers[socketId];

		socket.broadcast.emit('logout', socketId);
	});

};
