//Network Code for SomeTiles, by Jeremy McAllister (> ' . ' >)
function connectSocket(){
	if(!SomeTiles.hasOwnProperty('sock')){
		SomeTiles['sock'] = io('http://localhost/');
		logthis("socket is up");
	}
}


function requestGame(cb){
	if(!SomeTiles.hasOwnProperty('sock')){
		connectSocket();
		logthis("socket not found @ New Game request, creating + connecting!");
		var net = SomeTiles.sock;	

		net.on('connect',function(){
			getNewGame(net, cb);
		});
	}else{
		getNewGame(SomeTiles.sock, cb);
	}
	
	
}
function getNewGame(sock, cb){
	logthis("connected to server!");
	//net.send("hello from a client!");//same as net.emit('message', 'hello...')

	sock.emit("request game", "");

	sock.on("message", function(response){
		logthis("server message response: " + response);
	});

	sock.on("request game",function(res){
		logthis("request game response:\t" + res.length);
		applyGame(res);

		cb();
	});
}


//Parse Game Rules out of returned JSON from server's Random Game Generator
function applyGame(obj){
	var keys = Object.keys(obj);
	logthis(keys.length + " obj keys to make game from: " + Object.keys(obj));

	for(var i=0;i<keys.length;i++){
		SomeTiles[keys[i]] = obj[keys[i]];
	}

}

//2 player MP
function mp_requestJoinGame(ip,cb){
	if(!SomeTiles.hasOwnProperty('sock')){
		connectSocket();
		logthis("socket not found @ Join Game request, creating + connecting!");
		var net = SomeTiles.sock;

		net.on('connect',function(){
			mp_joinGame(net,ip,cb);
			//cb();
		});
	}else{
		mp_joinGame(SomeTiles.sock,ip,cb);
	}
	
	
}

function mp_joinGame(sock, ip, cb){
	sock.emit("join game", ip);

	sock.on("game joined", function(res){
		logthis("successfully joined game at IP " + ip);
		hideModalMessage();
		showModalMessage("Success!", "#joinform");
		applyGame(res);
		cb();
	});

	sock.on("join error",function(res){
		logthis("error joining game!\n" + res);
		hideModalMessage();
		showModalMessage(res, "#joinform","error");
		return;
	})
}

function mp_sendEvent(){

}

function mp_getGameState(){
	var gs = {
		turn: SomeTiles.turn,
		Players: [
			{
				Pieces: SomeTiles.Players[0].Pieces,
				scoreCount: SomeTiles.Players[0].scoreCount,
				isTurn: SomeTiles.Players[0].isTurn
			},
			{
				Pieces: SomeTiles.Players[1].Pieces,
				scoreCount: SomeTiles.Players[1].scoreCount,
				isTurn: SomeTiles.Players[1].isTurn
			}
		]
	};

	//logthis("game state: " + gs);
}