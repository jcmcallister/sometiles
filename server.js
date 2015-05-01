var express = require('express');
var app = express();
var util = require('util');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = {};

//Base Web Server
	//app.use(express.static(__dirname + '/js/'));
	//app.use(express.static(__dirname + '/css/'));
	//app.use(express.static(__dirname + '/img/'));

app.get('/', function(req, res){
	serve(req,res);
});

//guzart from StackOverflow is the man: 
	//http://stackoverflow.com/questions/9443840/basic-webserver-with-node-js-and-express-for-serving-html-file-and-assets
app.get(/^(.+)$/, function(req, res) {
	serve(req,res);
});

function serve(req,res){
	var path = req.params[0] || req.route.path;
	console.log("REQ\tGET\t" + path);
  //res.sendFile(__dirname + '/index.html');
  res.sendFile(__dirname + path);
}

app.post('/', function(req, res){
	//console.log(util.inspect(req));
	var json = {text: "yhelothar!"};
  res.sendFile(json);
});

//END -- Base Web Server


io.on('connection', function (socket) {
	var addr = socket.handshake.address;
	console.log("SOCKET\tUser Connected from " + addr.address + ":" + addr.port );

  socket.on('message', function (m) {
  	console.log("SOCKET\tMessage Recv:\t" + m); 
  	socket.emit('message','i got that thing you sent meh!');
  });
  socket.on('request game', function (m) {
  	console.log("received message:" + m);
  	socket.send("hello yourself!"); 
  });
  socket.on('disconnect', function () { });
});

/*io.on('connection',function(socket){
	console.log('a user connected!');
	//probably really bad to expose the internal id here
	socket.broadcast.emit("new conn","User Connected with id "+ socket.id);

	socket.on('set name', function(n){
		users[socket.id] = n;
		io.emit('set name', users[socket.id]);
		console.log("all users are " + util.inspect(users));
		console.log("New user:" + users[socket.id]);
		//console.log("socket data: " + util.inspect(socket));
	});

	socket.on('chat message', function(msg){
		//console.log('message: ' + msg);
		io.emit('chat message', users[socket.id] + ': ' + msg);
	});

	socket.on('disconnect', function(){
	    console.log('user disconnected');
	    delete users[socket.id];
	});

	socket.on('new game', function(){
		console.log("new game requested!");
		var json = {text: "yhelothar!"};
		io.emit('new game', json);
	});

});*/

http.listen(80, function(){
  console.log('listening on *:80');
});