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
		mp_assignGSHandlers(sock);

		cb();
	});

	sock.on("player joined", function(res){
		logthis("a player joined your game from\t" + res.ip);

		SomeTiles.mode = "mp";//changed from hotseat!
		SomeTiles.myPlayerIndex = res.myPlayerNum;

		var msg = "A Player Joined Your Game from " + res.ip + "!<br>You're Player " + (SomeTiles.myPlayerIndex+1) + "<br>";
		//set first turn with res.firstturn
		SomeTiles.turn = res.firstturn;
		if(SomeTiles.myPlayerIndex == res.firstturn){
			controlsOn();
			msg = msg + "You go first!";
		}else{
			controlsOff();
			msg = msg + "They go first!";
		}
		hideDialog();
		showDialog(msg);
		
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

function applyGSUpdate(gsupdate){
	logthis("applying GameState update!");
	/* HALF BAKED
	//one idea for this solution
	var currPath;
	if(gsupdate !== undefined){
		for(var i in _.keys(gsupdate)){
			currPath = getPath("SomeTiles",SomeTiles,i);
			SomeTiles[currPath] = gsupdate[currPath];
		}
	}*/
	if(_.has(gsupdate, "turn"))
		SomeTiles["turn"] = gsupdate.turn;

	for(var i =0; i < gsupdate.Players.length;i++){
		if(_.has(gsupdate, ["Players",i,"Pieces"]))
			SomeTiles.Players[i].Pieces = gsupdate.Players[i].Pieces;

		if(_.has(gsupdate, ["Players",i,"scoreCount"]))
			SomeTiles.Players[i].scoreCount = gsupdate.Players[i].scoreCount;

		if(_.has(gsupdate, ["Players",i,"isTurn"]))
			SomeTiles.Players[i].isTurn = gsupdate.Players[i].isTurn;


		//now update the displays 
		//redraw the pieces
		SomeTiles.Players[i].drawPieces();
		SomeTiles.Players[i].updateScore();
	}



}

//Thanks to Adam Rackis & Rodik @ http://stackoverflow.com/questions/8790607/javascript-json-get-path-to-given-subnode
function getPath(path, obj, target){
	for(var k in obj){
		if(obj.hasOwnProperty(k)){
			if(obj[k] === target){
				return path + "['" + k + "']";
			}else if(typeof obj[k] === "object"){
				var result = getPath(path + "['" + k + "']", obj[k], target);
				if(result){
					return result;
				}
			}
		}
	}
	return false;
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
		applyGame(res.rules);

		mp_assignGSHandlers(sock);

		var msg = "Welcome to the Game @ " + ip + "!<br>You're Player " + (res.myPlayerNum+1) + "<br>";

		SomeTiles.mode = "mp";
		SomeTiles.myPlayerIndex = res.myPlayerNum;
		SomeTiles.turn = res.firstturn;
		//setFirstTurn(res.firstturn);
		if(SomeTiles.myPlayerIndex == res.firstturn){
			controlsOn();
			msg = msg + "You go first!";
		}else{
			controlsOff();
			msg = msg + "They go first!";
		}

		showDialog(msg);

		cb();
	});

	sock.on("join error",function(res){
		logthis("error joining game!\n" + res);
		hideModalMessage();
		showModalMessage(res, "#joinform","error");
		return;
	})
}

function mp_updateGameState(){
	//update your opponent!
	var conn = SomeTiles.sock, gs = mp_getGameState();

	mp_assignGSHandlers(conn);
	conn.emit("gamestate update", gs);
	
}

function mp_assignGSHandlers(sock){
	sock.on("gamestate update", function(res){
		logthis("gamestate update success!\n" + res);
		applyGSUpdate(res);
		controlsOn();
	});

	sock.on("gs error", function(res){
		logthis("server error while updating gamestate!\n" + res);
		hideModalMessage();
		showModalMessage(res, "#gameplay","halfdown");
		return;
	});
}

function mp_getGameState(){
	return {
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
		],
		updatePaths: ["turn","Players[0].Pieces", "Players[0].scoreCount", "Players[0].isTurn", "Players[1].Pieces", "Players[1].scoreCount", "Players[1].isTurn" ]
	};

	//logthis("game state: " + gs);
}

function mp_getIP(cb){
	var net = SomeTiles.sock;

	net.send("ip req");

	net.on("ip req", function(str){
		logthis("server ip req. gave us : " + str);
		cb(str);
	});
}

/*function mp_setFirstTurn(cb){
	var net = SomeTiles.sock;

	net.send("turn req");

	net.on("turn req", function(pnum){
		//remake the first turn to be fair
		setFirstTurn(pnum);

	});
}*/