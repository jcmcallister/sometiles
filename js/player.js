//Player
function Player(num, color, colorSelect){
	this.number = num;
	this.Pieces = [];
	//this.PieceImage = '';
	//this.PieceShape = "circle"; //set of shapes: (circle, triangle)
	this.PieceColor = color || "#ddd";//hex or rgba for canvas contexts
	this.PieceColorSelect = colorSelect || "#777";//hex or rgba for canvas contexts

	this.selectedPiece;//normally a piece ID
	this.allowedMoves = [];//a set of Tile IDs for moves allowed for selected pieces
	this.captureMoves = {};//set of TIDs for moves that will result in a capture!

	this.isTurn = false;
	this.scoreCount = 0;

	SomeTiles.Players.push(this);
}

//TODO: put in legend for Player colors
Player.prototype.showLegend = function(){}

Player.prototype.selectPiece = function(p){
	//HOTSEAT: check turns!
	if(isTurnOf(p.playerNum) == false){
		showDialog("It's not Player " + (p.playerNum+1) + "'s turn! Give Player " + (Math.abs(p.playerNum-1)+1) + " the controls!");
		return;
	}



	this.selectedPiece = p;
	p.drawPiece(true);//redraw in same position

	//get valid moves for the now-selected Piece p
	this.getValidMovesMV(p, p.getMoves(), "allowedMoves");
	
	//if there are any applicable special moves, add them to Player's specialMoves
	if(p.getCapType() == "special_move"){
		this.getValidMovesMV(p,[p.getSpecialMove()],"specialMoves");
		this.showMoves(this.specialMoves);
	}

	this.showMoves(this.allowedMoves);
	
}

Player.prototype.getAllMoves = function(){
	return _.union(this.allowedMoves,this.specialMoves);
}

Player.prototype.deselectPiece = function(p){
	this.selectedPiece = undefined;
	//this.allowedMoves = [];
	//this.captureMoves = {};
	p.drawPiece(true);//redraw in same position

	//CLEAR the valid moves away
	clearMoves();
}

Player.prototype.showMoves = function(moveArray){
	var t, b = getBoard();
	for(var i=0;i<moveArray.length;i++){
		t = moveArray[i];
		drawMove(t,b.getTile(t).x,b.getTile(t).y);
	}
}

//this function could be renamed getValidMovePath()
	//given the Move object, currentPieceLocation, max move length, desired direction, and where to store valid tileIDs
Player.prototype.validateMovePath = function(theMove, currTID, maxMoveLen, direction){
	//we do hashes, thanks to dave calhoun @ http://davidbcalhoun.com/2010/is-hash-faster-than-switch-in-javascript/
	var destTileID,
	conditionMap = getMoveConditions(),
	tilePathMap = getMoveLogic(), b = getBoard(), okcount = 0, tmp = [], storage= [], tid = currTID;
	try{
		//check for every spot on the path to maxMoveLen

		for(var i = 0; i <maxMoveLen; i++){
			if(conditionMap[direction](tid,b.numTilesX, b.numTilesY)){
				//put tilePathMap value into temp storage
				okcount++;
				destTileID = tilePathMap[direction](tid,b.numTilesX,b.numTilesY);
				tmp.push( destTileID );
				tid = destTileID;
			}
		}

		if(theMove !== undefined && theMove.mustGoMax){
			//necessary because our approach is iterative
			if(okcount == maxMoveLen){
				//add the one max tid if we reached it
				storage.push( tmp.pop() );
			}
		}else{
			//add all tid to storage with no duplicates
			storage = _.union(storage, tmp );
		}

		return (storage.length == 0 ? undefined : storage);

	}catch(e){
		if(SomeTiles.debug){
			console.error("PROBLEM validatingMovePath" + e + "\ngiven args: " + _.values(arguments) );
			console.trace();
		}
	}

}

Player.prototype.getFullMovePath = function(currTID, maxMoveLen, direction){
	var conditionMap = getMoveConditions(),
	tilePathMap = getMoveLogic(), 
	storage = [],
	tid = currTID, destID, b = getBoard();

	for(var i = 0; i <maxMoveLen; i++){
		if(conditionMap[direction](tid,b.numTilesX, b.numTilesY)){
			//put tilePathMap value into temp storage
			destID = tilePathMap[direction](tid,b.numTilesX,b.numTilesY);
			storage.push( destID );
			tid = destID;
		}
	}

	return (storage.length == 0 ? undefined : storage);
}

Player.prototype.getMoveFromRelMove = function(initHeading, relDir){
	//context: you just moved initHeading and want to move relDir. 
	//ex: if you just moved 'r' and you want to make a 'r', on the board you'll move down (this fn returns 'd')
	if(initHeading === undefined || relDir === undefined || typeof initHeading != "string" || typeof relDir != "string"){
		if(SomeTiles.debug){ console.warn("args are wrong!"); console.trace(); }
		return;
	}
	var dirMap = {
		r: 0,
		ur: 45,
		up: 90,
		ul: 135,
		l: 180,
		dl: 225,
		d: 270,
		dr: 315
	},relDirMap = {
		r: -90,
		ur:-45,
		up:0,
		ul:45,
		l:90,
		dl:135,
		d:180,
		dr:-135
	}, res=(dirMap[initHeading] + relDirMap[relDir]);

	if(res >= 360){
		res-=360;
	}else if(res < 0){
		res+= 360;
	}
	return (_.invert(dirMap))[res];//returns 'r' if res is 0

}

Player.prototype.getValidMovesMV = function(p, moveset, playerStorage){
	var pieceRules = getPieceTypeInfo(p.type),
	moves = moveset,
	mydirs, waypoints = {}, goodTiles = [],
	destTileID, b= getBoard(), x=b.numTilesX, y=b.numTilesY;
	
	//for(var mi=0;mi<moves.length;mi++ ){
		var mi = 0;//only get first step of vector
		//START -- get valid destination tiles for the FIRST vector
		mydirs = _.has(p,"directions") ? p.directions : moves[mi].directions;
		if(mydirs == "*"){
			mydirs = "r,ur,up,ul,l,dl,d,dr";
		}
		var dirs = mydirs.split(",");

		for(var d = 0;d<dirs.length;d++){
			var mvOptions = moves[mi].distanceOptions, mvLen;

			for(var opti = 0;opti<mvOptions.length;opti++){
				mvLen = mvOptions[opti];//how far we want to go
				if(mvLen == "*" || mvLen == -1){
					mvLen = Math.max(x,y);
				}

				//given the Move currentPieceLocation, desired move length, desired direction, and where to store valid tileIDs
				var paths = this.validateMovePath(moves[mi], p.tileID, mvLen, dirs[d]);
				if(paths !== undefined && paths.length > 0){

					//this path is substantial!
					//check capture logic for leapfrog & collide here ONLY if type =='normal_move'
					//this is all to populate captureMoves to make captures happen
					var cap = _.property('capture')(pieceRules);
					if(_.property('type')(cap) == "normal_move"){

						switch(_.property('mechanic')(cap)){
							case 'leapfrog':
								var fullPath = this.getFullMovePath(p.tileID, mvLen, dirs[d]);
								//console.log("checking leapfrog captures, path len: " + paths.length + "\tenemy Piece on tile " + fullPath[0] + "? " + isEnemyPiece(fullPath[0]));
								if(mvLen == 2 && isEnemyPiece(fullPath[0])){
									console.log("leapfrog detected for TID. trigger piece " + paths[0] + " and piece to cap is " + fullPath[0]);
									this.captureMoves[paths[0]] = fullPath[0];
								}
								break;
							/*case 'collide': //handled in checkDestMove() fn!
								console.log("checking collide captures");
								break;
							default: console.warn("unknown capture mechanic: " + _.property('mechanic')(cap));
								break;*/
						}
					}else if(_.property('type')(cap) == "special_move"){
						switch(_.property('mechanic')(cap)){
							case 'leapfrog':
								var fullPath = this.getFullMovePath(p.tileID, mvLen, dirs[d]);
								//console.log("checking leapfrog captures, path len: " + paths.length + "\tenemy Piece on tile " + fullPath[0] + "? " + isEnemyPiece(fullPath[0]));
								if(mvLen ==2){
									if( isEnemyPiece(fullPath[0]) ){
										console.log("leapfrog detected for TID. trigger piece " + paths[0] + " and piece to cap is " + fullPath[0]);
										this.captureMoves[paths[0]] = fullPath[0];
									}else{
										//if this is a special move being checked, remove all invalid special moves from path
										paths.splice(0, 1);//always results in [] for a leapfrog, i think
										logthis("getValidMovesMV: removing irrelevant special_move leapfrog path!");
										//for instance, we don't highlight a pawn's attack diagonal moves if there are no enemies in range
											//this might be a good idea for later OR a special version for the game's UI Legend (aka "how to play" blurb)
									}
								}
								break;
							case 'collide':
								
									var loopPaths = paths;
									for(var pid =0;pid<loopPaths.length;pid++){
										logthis("checking for collide captures between " + p.type + " at tile " + p.tileID + " and target tile " + loopPaths[pid]);
										

										//TODO PRIORITY: fix bug with this re: all non-capture moves being removed. 
										//		the normal piece move gets eaten for a Chess pawn!
										if( isEnemyPiece(loopPaths[pid]) ){
											console.log("collision detected for TID. trigger & capture piece found on TID: " + loopPaths[pid] );
											this.captureMoves[loopPaths[pid]]= loopPaths[pid];
										}else{
											//if this is a special move being checked, remove all invalid special moves from path
											paths = _.without(_.flatten(paths), loopPaths[pid]);
											logthis("getValidMovesMV: removing irrelevant special_move collide path!");
											//for instance, we don't highlight a pawn's attack diagonal moves if there are no enemies in range
												//this might be a good idea for later OR a special version for the game's UI Legend (aka "how to play" blurb)
										}
									}
								
								break;
							default: 
							if(SomeTiles.debug){ console.warn("unknown capture mechanic: " + _.property('mechanic')(cap)); }
								break;
						}
					}


					waypoints[dirs[d]+","+mvLen] = paths;
				}

				//waypoints contains all valid tile IDs for this move vector
				//console.log("waypoints after validateMovePath():\t" + waypoints);

			}
			
		}
		// END  -- get valid destination tiles for the FIRST vector

	//}//loop for each moveVector

		var keys = _.keys(waypoints);
		if(keys.length > 0 && moves.length > 1){
			//if legit moves exist, look at the next move
			var nextMove = moves[mi+1], nextDir, l;
			for(var k=0;k<keys.length;k++){
				var spl = keys[k].split(",");//spl[0] is direction, spl[1] is distance
				var newdirs = nextMove.directions;
				if(newdirs == "*"){
					newdirs = "r,ur,up,ul,l,dl,d,dr";
				}
				var dirs = newdirs.split(",");
				for(l=0;l<dirs.length;l++){
					nextDir = this.getMoveFromRelMove(spl[0],dirs[l]);
					//for(var moo=0;moo<nextMove.distanceOptions.length;moo++){
				
						//finally, we want to just check the next hop for the complementary distance hops from vector 1
						//find indexOf current distanceOption in original move
						var optionIndex = _.indexOf(moves[mi].distanceOptions,parseInt(spl[1]));

						var mvLen = nextMove.distanceOptions[optionIndex];
						logthis("\tjust went " + spl[0] + " for "+ spl[1] +", now going " + nextDir + " for " + mvLen);
						for(var goo=0;goo<waypoints[keys[k]].length;goo++){
							
							var okPath = this.validateMovePath(nextMove, waypoints[keys[k]][goo], mvLen, nextDir);
							logthis("\tis " + dirs[l] + "," + mvLen + " a goodTile? : " + (okPath !== undefined ? okPath.toString() : "nope, undefined"));
							if(okPath !== undefined && okPath.length > 0){
								goodTiles = _.union(goodTiles, okPath );
							}
						}

					//}

				}
				
			}

			//clean up the outermost waypoints and put the tileID values into allowedMoves
			this[playerStorage] = _.union(_.uniq( _.flatten(_.values(goodTiles)) ), this[playerStorage]);

		}else{
			//clean up the outermost waypoints and put the tileID values into allowedMoves
			this[playerStorage] = _.union(_.uniq( _.flatten(_.values(waypoints)) ), this[playerStorage]);
		}
		
	

	

}

Player.prototype.tryCapture = function(p,destTile){
	//purpose: do any captures if applicable, return a bool indicating success
	var res = false, pcType = p.getTypeRules();
	if(pcType.hasOwnProperty('capture') && pcType.capture !== undefined){
		
		var cmech = checkCaptureMechanic(p, destTile.id, pcType.capture.mechanic);
		//does the capture type work here?
		if( pieceTypeCanCapture(p,destTile.id,pcType.capture.type) ){
			//does the capture mechanic work here?
			if( typeof cmech == 'boolean' && cmech == true ){
				this.capturePiece(p,destTile);//GOTEM!
				res = true;
			}else if( typeof cmech == 'number'){
				this.capturePiece(p,cmech);
				res = true;
			}
		}
	}
	return res;
}

Player.prototype.checkMoveDest = function(p, destTile){
	//checks destTile to see if there are pieces on top of it, e.g. is it clear?
	var res = false, destPieces = getPieces(destTile.id);

	if(destPieces.length > 0){
		//check whose pieces they are
		var piece;
		for(var i=0;i<destPieces.length;i++){
			piece = destPieces[i];
			if(piece.playerNum != this.number){
				//enemy piece detected!
				var pcType = p.getTypeRules();

				if(p.getCapMechanic() == 'collide'){
					this.tryCapture(p, destTile);
				}else{
					res = true;
				}
				/*//do collide captures if applicable
				//if(this.captureMoves.length > 0){
					if(pcType.hasOwnProperty('capture') && pcType.capture !== undefined){
						
						var cmech = checkCaptureMechanic(piece, destTile.id, pcType.capture.mechanic);
						//does the capture type work here?
						if( pieceTypeCanCapture(piece,destTile.id,pcType.capture.type) ){
							//does the capture mechanic work here?
							if( typeof cmech == 'boolean' && cmech == true ){
								this.capturePiece(piece,destTile);//GOTEM!
							}else if( typeof cmech == 'number'){
								this.capturePiece(piece,cmech);
							}else{
								res = true;//you're blocked, brah
							}
						}else{
							res = true;//this isn't a cap move, should be treated as an obstacle
						}
					}
				//}else{ res = true; }*/

				
			}else{
				//friendly piece detected!
				res = true;
			}
		}

		//check move.noclip
			//noclip means you can move through (or over) pieces, but not land on them
			//if landing on top of a piece, check whose pieces they are, and this piece's capture type

		//check move.mustGoMax
	}
	
	return res;
}

Player.prototype.checkLeapfrog = function(p, destID){
	return (typeof this.captureMoves == 'object' && this.captureMoves.hasOwnProperty(destID)) ? this.captureMoves[destID] : false;
}

Player.prototype.capturePiece = function(p,destTile,cap){
	if(typeof destTile == 'number'){
		var tmp = destTile;
		destTile = { id: tmp};
	}
	console.log("piece " + p.id + " just captured the piece at " + destTile.id + "!!!");
	
	if(_.has(SomeTiles,"mp") && SomeTiles.mp == true){
		//TODO priority SERVER: push to socket to check if move is valid with your friend. 
			//just like playing against a friend and the friend calls out any wrong moves
	}

	//remove the piece at destTile.id
	var victim = this.removePiece(destTile.id);

	//add to count
	var pl = thePlayer();
	pl.scoreCount++;
	
	//update the scoreboard
	pl.updateScore();
	//TODO: update of UI elements to show the HOARD

	//showDialog("Player " + (SomeTiles.turn+1) + " just captured a " + victim.type + "!");

}

Player.prototype.goalCheck = function(){
	//get the goal conditions
	var g = getGoals(), keys = _.keys(g), res=false;

	//check to see if any are met
	for(var i=0; i<keys.length;i++){
		switch( keys[i] ){
			case 'zeroEnemies':
				res = (g.zeroEnemies == true && theEnemy().Pieces.length == 0);
				break;
			default:
				logthis("goalCheck: unknown goal condition " + keys[i]);
				break;
		}
	}
	return res;
}

Player.prototype.movePiece = function(p,destTile){

	//check for potential blocks

	if(this.checkMoveDest(p,destTile)){
		showDialog("You're blocked! Try another way or another Piece!");
		return;
	}

	if(p.getCapMechanic() == 'leapfrog'){
		this.tryCapture(p,destTile);//for leapfrogs or other special cases
	}
	

	//move the given Piece p to the given destination Tile 
	
	//validating the piece's move is in canvasClick!

	//clearPiece of old tileID
	p.clearPiece(p.tileID);

	//change id
	p.tileID = destTile.id;
	
	//The Player deselects the now-moved piece
	this.deselectPiece(p);

	p.drawPiece(false);

	//an old impl'n of this re-drew the whole board + pieces on every pass. this is WORTH IT!

	//check if Goal is met
	if(this.goalCheck() == true){
		//declare winner
		SomeTiles['winner'] = this.number;
		//do voting stuff

	}else{
		//if goal not met, keep going
		//on successful Move, change player turn!
		switchTurns();
	}

}

Player.prototype.addPiece = function(tileID, pieceType){
	var me= this;
	me.Pieces.push(new Piece(me.number, tileID, pieceType));
	me.Pieces[me.Pieces.length-1].assignDirections();
}


Player.prototype.removePiece = function(tileID){
	//grab piece at given Tile ID, remove it from the Player's piece array and return it
	var rmPiece = getPiece(tileID);

	if(!rmPiece){ console.error("piece not found at tile " + tileID); return; }

	var pieceArr = SomeTiles.Players[rmPiece.playerNum].Pieces;

	//splice it off
	for(var i=0;i<pieceArr.length;i++){
		if(pieceArr[i].id == rmPiece.id){
			pieceArr.splice(i,1);
		}
	}

	//clear away ONLY this tileID
	rmPiece.clearPiece(tileID);

	return rmPiece;
}

Player.prototype.drawPieces = function(){
	for(var i=0;i<this.Pieces.length;i++){
		this.Pieces[i].drawPiece();
	}
}

Player.prototype.updateScore = function(){
	$("#p"+(this.number+1)+"score").text(this.scoreCount);
}