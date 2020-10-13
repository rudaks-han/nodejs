var http = require('http');
var https = require('https');
var express = require('express');

var path = require('path');
var fs = require('fs');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');

var favicon = require('serve-favicon');
var logger = require('morgan');
var FileStreamRotator = require('file-stream-rotator');
var bodyParser = require('body-parser');

var pokerRoutes = require('./routes/poker');
var gameWheel = require('./routes/game_wheel');

var errorHandler = require('errorhandler');
var request = require('request');
//var debug = require('debug')('app4');

//var Client = require('node-rest-client').Client;
//var httpClient = new Client({user:"test2",password:"1"});

//var timeout = require('connect-timeout');

var privateKey = fs.readFileSync('cert/private_node.key');
var certificate = fs.readFileSync('cert/2_node.spectra.co.kr.crt');
var credentials = {
	key: privateKey,
	cert: certificate,
	passphrase: "tmvprxmfk123"
};

var app = express();

//app.set('env', 'development');
//app.set('env', 'development');

//var httpServer = http.createServer(app);
//var httpsServer = https.createServer(credentials, app);

var httpServer;
if (process.platform == 'win32') // 윈도우일 경우
{
	app.set('host', 'https://127.0.0.1');
	app.set('port', 9999);

	httpServer = https.createServer(credentials, app);
}
else // 윈도우가 아닐 경우
{
	app.set('host', 'http://127.0.0.1');
	app.set('port', 9999);

	httpServer = http.createServer(app);
}

global.port = app.get('port')
global.host = app.get('host')


var server = httpServer.listen(app.get('port'), function() {
	console.error('server listening on host ' + app.get('host') + ', port ' + app.get('port'));
});

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}
//global.socket = require('socket.io').listen(httpServer);

//var io = require('socket.io').listen(server);

var pokerSocket = require('./modules/socket.js').listen(server);
//var videoSocket = require('./modules/video-socket.js').listen(httpServer);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// create a write stream (in append mode)
var accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: __dirname + '/logs' + '/access-%DATE%.log',
  frequency: 'daily',
  verbose: false
});

// setup the logger
app.use(logger('combined', {stream: accessLogStream}))
//app.use(logger('dev'));
//app.use(bodyParser.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(app.router);
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
//app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/poker/:room', pokerRoutes);
//app.use('/game-wheel', gameWheel);

//app.get('/poker/:room', pokerRoutes);

app.get('/', function(req, res) {
    res.render('index', { title: 'index' });
});

app.get('/poker/', function(req, res) {
    res.render('poker-login', { title: 'EER Planning Poker' });
});

app.get('/poker/:room', function(req, res) {
    res.render('poker', { title: 'EER Planning Poker' });
});

app.get('/video/', function(req, res) {
    res.render('video-index', { title: 'WebRTC Video' });
});

app.get('/video/:room', function(req, res) {
		var ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		ipAddress = ipAddress.replace(/^.*:/, '');
    res.render('video', { title: 'WebRTC Video', 'ipAddress' : ipAddress });
});

app.get('/screenshare/', function(req, res) {
    //res.render('screenshare-index', { title: 'WebRTC screenshare' });
		//res.writeHead(301, {Location:'/screenshare/11'});
		var num = Math.floor(Math.random() * 100000);
		res.redirect('/screenshare/' + num);
});

app.get('/screenshare/:room', function(req, res) {
		var ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		ipAddress = ipAddress.replace(/^.*:/, '');
    res.render('screenshare', { title: 'WebRTC screenshare', 'ipAddress' : ipAddress });
});

app.get('/lunch-game/:room', function(req, res) {
    res.render('lunch-game', { title: 'WebRTC Video' });
});

app.get('/mobile', function(req, res) {
    res.render('spectra-mobile-active-user', { title: 'spectra mobile' });
});


app.get('/health', function(req, res) {
  res.send(Buffer.from(JSON.stringify({
    pid: process.pid,
    memory: process.memoryUsage(),
    uptime: process.uptime()
  })));
});

app.get('/firebase-cloud-message', function(req, res) {
    res.render('firebase-cloud-message', { title: 'Firebase Cloud Message' });
});

app.post('/firebase-cloud-message-action', function(req, res) {    
	console.error('firebase-cloud-message-action called');
	//url: 'https://fcm.googleapis.com/fcm/send',
	var options = {	  
	  url: 'http://127.0.0.1:8000/mobile/fcm/send',
	  headers: {
		'Authorization': 'key=AAAAiTZgnVY:APA91bH6CMziWjztlwb_MITZq6YHP6jn-PKxGFodmmDC6e4gv9v5tH_gZZgNcOhaiL7_2ZO1prOFowfz_uzSefhCSA92lP_ozEh5PJzPgYPoBXByjOJf7_RZ7voeJXfnhfUFC2S97aol',
		'Content-Type': 'application/json'
	  },
	  body: JSON.stringify({
		"to":"cLoQICVrFyM:APA91bE6lpUG6y2C2u0-Q58B7qLOQ5paaQo-jg-HDxScTFm1oyQ94miV6ehidZtR5Wsi_aPxydV9BCph7Ht809LP9mes9UPhpRkjTkfVJlk41Cahe_H0g81fK-9LqJunEfQR648STKt2"
		,"notification":{"body":"안녕하세요...", "tag":"tag입니다", "icon":"http://coffee.spectra.co.kr/mobile/static/images/app-icon-64.png"}
	  })
	};
	
	console.error('request body : ' + req.body.token);
	
	var formData = 
	{
		token : req.body.token,
		title : req.body.title,
		message : req.body.message
	};
	
	request.post({url:'http://211.63.24.124:8000/mobile/fcm/send', formData: formData}, function optionalCallback(err, httpResponse, body) {
	  if (err) {
		return console.error('upload failed:', err);
	  }
	  console.log('Upload successful!  Server responded with:', body);
	});
	
	/*
	console.error(options.body);
	request.post(options, function(response) {
		console.error('response...' + response);
	});
	*/
});

app.get('/get-device-token', function(req, res) {
    res.render('get-device-token', { title: 'Firebase Cloud Message' });
});

/*
app.get('/firebase-cloud-message-sw.js', function(req, res) {
	res.set('Content-Type', 'application/javascript');
    res.render('firebase-cloud-message-sw', { title: 'Firebase Cloud Message' });
});
*/
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

/*
io.sockets.on('connection', function(socket) {

});
*/

module.exports = app;
