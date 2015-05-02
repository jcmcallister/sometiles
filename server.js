var express = require('express');
var app = express();
var util = require('util');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var clc = require('cli-color');
//var mdb = require('./server/db.js');

var users = {};
var portNum = 3000;

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

	app.post('/', function(req, res){
		//console.log(util.inspect(req));
		var json = {text: "yhelothar!"};
	  res.sendFile(json);
	});

	function serve(req,res){
		var path = req.params[0] || req.route.path;
		console.log(clc.yellow("HTTP\t") + "GET\t" + path);
		res.sendFile(__dirname + path);
	}

//END -- Base Web Server


io.on('connection', function (socket) {
	var hs = socket.handshake;
	var remoteAddr = hs.address + ":" + (hs.headers.host).substr(hs.headers.host.indexOf(":")+1);
	dashes();
	console.log(clc.blue("SOCKET\t") + "User Connected from " + remoteAddr + "\tsocketid: " + socket.id);

	//console.log("\t"+util.inspect(socket.handshake));

  socket.on('message', function (m) {
  	console.log(clc.blue("SOCKET\t") + "Message Recv:\t" + m); 
  	socket.emit('message','i got that thing you sent meh!');
  });
  socket.on('request game', function (m) {
  	var msg = m.length > 0 ? m : "(empty)";
  	console.log(clc.blue("SOCKET\t") + "Game Request Recv:\t" + msg);
  	socket.send("hello yourself!");

	var json = getRandomGame();
  	socket.emit("request game", json);

  	//put userIP:port -> socketID into users object
  	users[socket.id] = remoteAddr;
  	displayAllUsers();
  });
  socket.on('disconnect', function () {
  	console.log(clc.blue("SOCKET\t") + "User Disconnect:\t" + remoteAddr + "\tsocketid: " + socket.id);
  	delete users[socket.id];
  	displayAllUsers();
  });
});

function dashes(){
	var str = "";
	for(var i=0;i<80;i++){
		str = str + "-";
	}
	console.log(str);
}

function displayAllUsers(){
	dashes();
	console.log(clc.green("USERS\t") + Object.keys(users).length + "\n" + util.inspect(users));
	dashes();
}

function getRandomGame(){
	//game gen code here
	var res = {
		boardColors: ["#7c5236","#111"],
		GoalConditions: {
			zeroEnemies: true
		},
		PieceTypes: {
			types: ["circle","square", "knight", "doge"],
			rules:{
				circle:{
					piecesPerPlayer: "fill",
					symmetricPlacement: false,
					sameColorPlacement: true,
					numEmptyRows: 1, //number of empty rows per side if you're doing a fill with sameColorPlacement
					//startingPositions: [[0,0],[3,3], [0,7],[3,4]]//mirrored piece placement = numeric xy coords, random places on half board = -1
					startingPositions: [[2,2], [3,5]]
					,moveVectors:[
						{
							directions: "ur,ul,dl,dr"
							,distanceOptions: [1] //these are options the player could make use of, see the Knight piece below
							,mustGoMax: false
							,noclip: false //if noclip, the Piece floats through adjacent pieces from src to dest
							,forwardOnly: true
						}
					],
					capture: {
						mechanic: "leapfrog",
						type: "special_move",
						move: {
							directions: "ur,ul,dl,dr",
							distanceOptions: [2],
							mustGoMax: true,
							forwardOnly: true
						}
					}
				}
				,square:{
					piecesPerPlayer: 0
					,startingPositions: -1
					,moveVectors:[
						{
							directions: "r"
							,distanceOptions: [1]
							,relDirections: true
							,mirrorDirections: true
							,mustGoMax: false
							,noclip: false 
						}
					],
					capture: {
						mechanic: "collide",
						type: "special_move"
						,move: {
							directions: "ur,dr",
							distanceOptions: [1],
							mustGoMax: true
						}
					} 
				}
				,knight:{
					imgpath: "img/knight.png",
					piecesPerPlayer: 0
					,startingPositions: -1
					,moveVectors:[
						{
							directions: "r,up,l,d"
							,distanceOptions: [1,2] //move options the player could choose, "up 1 over 2" versus "up 2 over 1"
							,mustGoMax: true
							,noclip: true 
							//if !noclip, the Piece must check if a Piece is blocking the path from currentTileID to destTileID
						},
						{
							directions: "l,r"
							,distanceOptions: [ 2,1 ] //the complement of the above distance vectors of the first move
							,mustGoMax: true
							,noclip:true
						}
					],
					capture: {
						mechanic: "collide",
						type: "normal_move"
					}
				}
				,doge:{
					imgpath: "img/doge.png",
					piecesPerPlayer: 0
					,startingPositions: -1
					,moveVectors:[
						{
							directions: "*"
							,distanceOptions: [2]
							,mustGoMax: true
							,noclip: false
						}
					],
					capture: {
						mechanic: "leapfrog",
						type: "normal_move"
					}
				}

			}
		}//end piece types WHEW

	};//end HUGE JS object

	return res;
}//END -- makeRandomGameJSON fn

http.listen(portNum, function(){
  console.log('listening on *:' + portNum);
});