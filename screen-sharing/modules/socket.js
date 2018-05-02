var socketio = require('socket.io');

//var app = require('../app');
//var io = app.io;

module.exports.listen = function(app)
{
	var io = socketio.listen(app, {log: false}); // 로그를 남길것인지 여부

	var allowedOrigins = "http://127.0.0.1:8000";

	io.configure('production', function(){
	  io.set('transports', ['xhr-polling']);
	});

	var pokerIo = io.of('/poker');
	var videoIo = io.of('/video');
	var lunchGameIo = io.of('/lunch-game');
	var spectraMobileIo = io.of('/mobile');

	var pokerSocket = require("./poker-socket.js");
	var videoSocket = require("./video-socket.js");
	var lunchGameSocket = require("./lunch-game-socket.js");
	var spectraMobileSocket = require("./spectra-mobile-socket.js");

	pokerIo.on('connection', pokerSocket.ready);
	videoIo.on('connection', videoSocket.ready);
	lunchGameIo.on('connection', lunchGameSocket.ready);
	spectraMobileIo.on('connection', spectraMobileSocket.ready);

	return io;
};
