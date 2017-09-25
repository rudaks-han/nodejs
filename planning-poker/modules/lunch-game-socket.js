var pokerIo;

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

	debug('video connection');

	var socketId = socket.id;
	socketId = socketId.split('#').length > 1 ? socketId.split('#')[1] : socketId;

	socket.emit('connection', socketId);

	socket.on('close-video', function(data) {
		debug('close-video', data);

		var room = data.room;
		socket.emit('close-video');
	});

	socket.on('open-video', function(data) {
		debug('open-video', data);

		var room = data.room;
		socket.emit('open-video');
	});
};
