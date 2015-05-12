//Network Code for SomeTiles, by Jeremy McAllister (> ' . ' >)
function connectSocket(){
	if(!SomeTiles.hasOwnProperty('sock')){
		SomeTiles['sock'] = io(window.location.host);
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

	var j =0;
	for(var i =0; i < gsupdate.Players.length;i++){
		if(_.has(gsupdate, ["Players",i,"Pieces"])){
			/*for(j=0; j<gsupdate.Players[i].Pieces.length;j++){
				if(_.findIndex(SomeTiles.Players[i].Pieces,function(p){
					return p.tileID == gsupdate.Players[i].Pieces[j].tileID;
				}) > -1){
					SomeTiles.Players[i].Pieces[j].clearPiece();
					SomeTiles.Players[i].Pieces[j] = _.cloneDeep( gsupdate.Players[i].Pieces[j] );
					SomeTiles.Players[i].Pieces[j].__proto__ = Piece.prototype;
					SomeTiles.Players[i].Pieces[j].drawPiece(false);
				
				}else{
					//logthis("ERROR : ArrayIndex OOB in applyGSUpdate, length of " + SomeTiles.Players[i].Pieces.length + "\telem ref == " + j);
					logthis("FOUND BAD GSUPDATE PIECE: " + j);
				}
			}*/
		}

		//SomeTiles.Players[i].__proto__ = Player.prototype;

		if(_.has(gsupdate, ["Players",i,"scoreCount"]))
			SomeTiles.Players[i].scoreCount = gsupdate.Players[i].scoreCount;

		//now update the displays 
		//redraw the pieces
		//SomeTiles.Players[i].drawPieces();
		SomeTiles.Players[i].updateScore();
	}

	//loop over gsupdate.moveHistory
	if(_.has(gsupdate, "moveHistory")){
		var p;
		for(var pieceID in gsupdate.moveHistory){
			logthis("moveHistory RECV// Piece " + pieceID + " is subject to a " + gsupdate.moveHistory[pieceID].action + "!");
			//get the piece affected by the move
			p = getPiece(pieceID);

			if(p){
				//update the current gamestate to match the moveHistory
				switch(gsupdate.moveHistory[pieceID].action){
					case 'move':
						SomeTiles.Players[p.playerNum].addPiece( gsupdate.moveHistory[pieceID].dest, p.type );
						SomeTiles.Players[p.playerNum].Pieces[SomeTiles.Players[p.playerNum].Pieces.length-1].drawPiece(false);
						SomeTiles.Players[p.playerNum].removePiece(p.tileID);
						break;

					case 'capture':
						SomeTiles.Players[p.playerNum].removePiece(p.tileID);
						break;
				}
			}
		}
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
	mp_showWaiting();
	conn.emit("gamestate update", gs);
	mp_resetMoveHistory();
}

function mp_showWaiting(){
	//todo: showDialog("waiting!")
	showDialog("Waiting on opponent...");
	//todo: an idle animation?
}

function mp_hideWaiting(){
	hideDialog();
}

function mp_showTurnNotifier(){
	//todo: an eye-catching notification when it's your turn!
}

function mp_hideTurnNotifier(){
	//todo: turn off the notification!
}

function mp_assignGSHandlers(sock){
	sock.on("gamestate update", function(res){
		logthis("gamestate update success!\n" + res);
		applyGSUpdate(res);
		controlsOn();
		mp_resetMoveHistory();
	});

	sock.on("gs error", function(res){
		logthis("server error while updating gamestate!\n" + res);
		hideModalMessage();
		showModalMessage(res, "#gameplay","halfdown");
		return;
	});
}

function mp_resetMoveHistory(){
	//logthis("moveHistory reset!");
	SomeTiles.moveHistory = {};
}

function mp_getGameState(){
	var gs = {
		turn: SomeTiles.turn
		,Players: _.cloneDeep(SomeTiles.Players)
		,moveHistory: _.cloneDeep(SomeTiles.moveHistory)
	};

	/*var j=0;
	for(var i =0;i<gs.Players.length;i++){
		gs.Players[i].__proto__ = Player.prototype;
		gs.Players[i].Pieces = _.cloneDeep(SomeTiles.Players[i].Pieces);
	}*/

	//new gamestate piece coverage & actions
	for(var pieceID in SomeTiles.moveHistory){
		logthis("moveHistory SEND// Piece " + pieceID + " is doing a " + SomeTiles.moveHistory[pieceID].action + "!");
	}
	
	//logthis("game state: " + gs);
	return gs;
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