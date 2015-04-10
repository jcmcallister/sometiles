			//Proof of Concept Reqs: 	A displayed Board <- Tiles, Player able to move 1 Piece across the Board
			//Next steps: 				Multiple pieces, tile feature triggers, 2 players hotseat, Rules


			//Board is made up of Tiles
			//Game Pieces occupy Tiles, based on moves from the Player
			//In this sketch, Main() will test the Player moving GamePieces onto Tiles

			//a Game is a set of rules, Objects describing those rules, a RuleChecker, and an otherPlayer Object
			function Game(ServerResponse){
				//args: the AJAX response from server

				//ServerResponse will be parsed into these things

				//TODO: polish this idea up
				this.rules = [],
				this.ruleObjs =[],
				this.ruleChecker = null,
				this.otherPlayer = null
			};

			function showDialog(msg){
				var btn = '<br><button onclick="hideDialog();">OK!</button>';
				$("#dialog").html(msg+btn).removeClass("hidden");
			}

			function hideDialog(){
				$("#dialog").addClass("hidden");
			}

			//START -- Piece Types

				//define movement, actions, shape, etc for this piece type
				//TODO: read all this info in from the server's RGG response data
				var pcTypes = {
					types: ["circle","square", "knight", "doge"],
					rules:{
						circle:{
							directions: "r,up,l,d",
							numSpacesPerMove: 1,
							piecesPerPlayer: 4,
							startingPositions: [[0,0],[2,3], [0,7],[2,4]]//structured order = numeric xy coords, random places on half board = -1
							//TODO: any other data fields to be manipulated in gameplay go here!
						},
						square:{
							directions: "ur,ul,dl,dr",
							numSpacesPerMove: -1,//-1 or '*' to codify max() spaces
							piecesPerPlayer: 1
							,startingPositions: -1
							//TODO: will be read in from DB same as above, any other data fields here (UNIFORM with above PieceType rules)
						},
						knight:{
							imgpath: "img/knight.png",
							directions: "*",
							numSpacesPerMove: 3
							,piecesPerPlayer: 2
							,startingPositions: -1
						},
						doge:{
							imgpath: "img/doge.png",
							directions: "*",
							numSpacesPerMove: 1
							,piecesPerPlayer: 2
							,startingPositions: -1
						}

					}
				};


			// END  -- Piece Types 

			var SomeTiles = { 
					Boards: [],
					Players: [],
					debug: true
					//,Game: theGame //TODO: add this once Game is done coming back from server
					,PieceTypes: pcTypes
					,c: {
						board: "board",
						pieces: "pieces",
						moves: "moves"
					}
					,boardColors: ["#7c5236","#111"]
					,turn : null
					//,Goal: //TODO PRIORITY: get a simple goal mechanic working
				};

			//our MAIN()
			function onceLoaded(){

				//create Board (constructor makes Tile set)
				//display Board
					var myboard = new Board(8,8,80,80);

					var p1 = new Player(0);
					var p2 = new Player(1, "#b00", "#d33");
					
				//dynamically create the right amount of Player Pieces from Piece Type rules
					var pcTypes = getAllPieceTypes(), pcInfo, pcLoc, pcMin, pcMax;
					for(var pl=0;pl<SomeTiles.Players.length;pl++){
						for(var i=0; i<pcTypes.length;i++){
							pcInfo = getPieceTypeInfo(pcTypes[i]);
							for(var k=0;k<pcInfo.piecesPerPlayer;k++){

								if(typeof pcInfo.startingPositions === "number"){
									//it's random!
									if(pl==0){
										pcMin = 0;
										pcMax = ((myboard.numTilesX*myboard.numTilesY)/2)-1;
									}else{
										pcMin = ((myboard.numTilesX*myboard.numTilesY)/2);
										pcMax = (myboard.numTilesX*myboard.numTilesY) -1;
									}
									pcLoc = Math.floor(Math.random() * (pcMax - pcMin)) + pcMin ;
									SomeTiles.Players[pl].addPiece(pcLoc,pcTypes[i]);
								}else{
									//the startingPositions are structured in a 2d array!
									//apply the simple coordinates to the player, and transpose them for p2's side of the board
									//for(var j=0;j<pcInfo.startingPositions.length;j++){
										//pcInfo.startingPositions[j]: x,y coord pair
									if(pcInfo.startingPositions.length == pcInfo.piecesPerPlayer){
										//0: x-coord, 1: y-coord
										var myx = pcInfo.startingPositions[k][0];
										var myy = pcInfo.startingPositions[k][1];
										var bx = myboard.numTilesX;
										var by = myboard.numTilesY;

										if(pl==0){
											pcLoc = (myx*by) + myy;// x + y
										}else{
											pcLoc = ((bx-1)-myx)*by+myy;//n-1-x + y
										}
										SomeTiles.Players[pl].addPiece(pcLoc,pcTypes[i]);
									}
									
								}
							
								
							}//end loop amount of this piece type per player
						}//end loop for this piece type
						SomeTiles.Players[pl].drawPieces();
					}//end loop for each Player


				//which Player goes first?
				SomeTiles.turn = Math.round(Math.random());
				showDialog("Player " + SomeTiles.turn + " goes first!")

				//TODO: confirm that player number SomeTiles.turn is going first

				//draw ALL pieces
					//p1.drawPieces();

				//add Mouse listener
					//must be canvas with highest z-index on page
					var topLayerCanvas = getTopLayerCanvas();
					
					var canvas = topLayerCanvas || document.getElementsByTagName("canvas")[0];
					canvas.addEventListener("click", canvasClick, false);

				//TODO: write switchTurn() and switch turns until a Goal condition is met
					//hotseat local games only!

			}

			function getTopLayerCanvas(){
				var c = document.getElementsByTagName("canvas");
				var elem = c[0], zi, maxz = getStyle(c[0].id,"zIndex") || getStyle(c[0].id,"z-index");
				if(c.length > 1){
					for(var i=1;i<c.length;i++){
						zi = getStyle(c[i].id,"zIndex") || getStyle(c[i].id,"z-index");
						if(zi > maxz){
							elem = c[i];
							maxz = zi;
						}
					}
				}
				return elem;
			}

			//props to rahul at stackoverflow here: http://stackoverflow.com/questions/1388007/getting-the-z-index-of-a-div-in-javascript
			function getStyle(el,styleProp){
			    var x = document.getElementById(el);

			    if (window.getComputedStyle)
			    {
			        var y = document.defaultView.getComputedStyle(x,null).getPropertyValue(styleProp); 
			    }  
			    else if (x.currentStyle)
			    {
			        var y = x.currentStyle[styleProp];
			    }
			    return y;
			}

			function resizeCanvases(w,h){
				var c = document.getElementsByTagName("canvas");

				for(var i=0;i<c.length;i++){
					c[i].width = w;
					c[i].height = h;
				}

				$("#dialog").css("marginTop",h);
			}

			function canvasClick(e){
				//get cursor position
				var x, y, thePiece, b=getBoard(), usingOffset = false;
				if(e.offsetX != undefined && e.offsetY != undefined){
					x = e.offsetX;
					y = e.offsetY;
					usingOffset = true;
				}else if(e.pageX  != undefined && e.pageY != undefined){
					x = e.pageX;
					y = e.pageY;
				}else{
					x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
					y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
				}

				if(!usingOffset){
					//some variables to check in the browser
					var offsetVarsX = [e.offsetX, e.target.offsetLeft, e.target.offsetParent.offsetLeft];
					var offsetVarsY = [e.offsetY, e.target.offsetTop, e.target.offsetParent.offsetTop];
					var offX, offY;
					for(var k=0;k<offsetVarsX.length;k++){
						if(offsetVarsX[k] == 0 && offsetVarsY[k]==0){
							continue;
						}else{
							offX = offsetVarsX[k];
							offY = offsetVarsY[k] 
						}
					}
					
					x -= offX;
					y -= offY;
				}
				x = Math.min(x, b.numTilesX*b.tileWidth);
				y = Math.min(y, b.numTilesY*b.tileHeight);

				console.log('clicked at [' + x + ', ' + y + ']' );

				//find the Tile // Piece related to the 
					//using the Math involved in Tile creation, we get an easy rect
				var theTile = getTileFromXY(x,y), thePiece = getPiece(theTile.id), p;
				var player = SomeTiles.Players[0];
				var movestr = "NO piece on Tile id = " + theTile.id;

				if(thePiece === undefined && player.selectedPiece === undefined){
					//piece not found?
					if(SomeTiles.debug){
						console.log(movestr);
					}
					return;
				}

				//TODO: FIX THIS FOR MULTIPLE PLAYERS ONCE CODE IS IN PLACE
				
					//select or move the piece in the clicked position!

					if(thePiece && !player.selectedPiece){
						//select
						player.selectPiece(thePiece);
						movestr = "selecting piece on Tile id:" + theTile.id;
					}else{
						if(player.selectedPiece){
							if(player.selectedPiece.tileID != theTile.id){

								//check the available moves
								if(player.allowedMoves.indexOf(theTile.id) > -1 ){
									//move is legit, move the piece!
									hideDialog();//hide error message if still visible
									movestr = "moving piece from Tile id:" + player.selectedPiece.tileID + "\tto Tile id: " + theTile.id;
									player.movePiece(player.selectedPiece,theTile);
								}else{
									//move is outside allowed move set! NO MOVE FOR YOU
									movestr = "tile " + theTile.id + "\tis outside the allowed move set!";
									showDialog("You can't move that way! Try again!");
								}
							}else{ 
								hideDialog();//hide user messaging
								player.deselectPiece(thePiece);
								thePiece.drawPiece(false);
								movestr = "deselecting! (can't move piece to same Tile)"; 
							}
						}
					}

					if(SomeTiles.debug){
						console.log(movestr);
					}

				
			}

			function getPiece(tid){
				//select ONE Piece from all Players with Tile ID tid
				var players = SomeTiles.Players, p;
				for(var pidx =0; pidx < players.length; pidx++){
					for(var i = 0; i< players[pidx].Pieces.length;i++){
						p = players[pidx].Pieces[i];
						if(p.hasOwnProperty("tileID") && p.tileID == tid){
							return p;
						}
					}
				}
				return;
			}

			function getPieces(tid){
				//select all Pieces from all Players with the given Tile ID
				var players = SomeTiles.Players, p, pieces = [];
				for(var pidx =0; pidx < players.length; pidx++){
					for(var i = 0; i< players[pidx].Pieces.length;i++){
						p = players[pidx].Pieces[i];
						if(p.hasOwnProperty("tileID") && p.tileID == tid){
							pieces.push(p);
						}
					}
				}
				return pieces;
			}

			function getTileFromXY(x,y){
				var b = getBoard(), t;

				for(var i=0;i< b.tileSet.length;i++){
					t = b.tileSet[i];
					if(t.hasOwnProperty("x") && t.hasOwnProperty("y") && 
						x >= t.x && x < (t.x + b.tileWidth) && y >= t.y && y < (t.y + b.tileHeight) ){
						//we got it! don't reset Tile t now
						break;
					}
				}
				return t; //just in case its still null or undef
			}

			function getAllPieceTypes(){
				return SomeTiles.PieceTypes.types;
			}

			function getPieceTypeInfo(t){
				//searches the types for t. if it exists, returns an Object with that piece type's rule info, else undefined
				if(typeof t != "string"){t="";}
				return SomeTiles.PieceTypes.rules[t];
			}

			//START -- Player Functions
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

						SomeTiles.Players.push(this);
					}

					Player.prototype.selectPiece = function(p){
						this.selectedPiece = p;
						p.drawPiece(true);//redraw in same position

						//get valid moves for the now-selected Piece p
						this.getValidMoves(p);
						this.showValidMoves();
						

						//MOVES -- moves are defined as adjacent spaces a player can go to with this newly-selected Piece!
						//8 moves are classified in counter-clockwise quadrants like cartesian plane
							//'r' space directly to the right
							//'ur': space 45 deg upper-right
							//'up': space directly above
							//'ul': space 135 deg from 0 aka upper-left
							//'l': space directly left
							//'dl': space lower-left
							//'d': space directly below this one
							//'dr': space lower-right
						
					}

					Player.prototype.deselectPiece = function(p){
						this.selectedPiece = undefined;
						this.allowedMoves = [];
						p.drawPiece(true);//redraw in same position

						//CLEAR the valid moves away
						clearMoves();
					}

					Player.prototype.showValidMoves = function(){
						var t, b = getBoard();
						for(var i=0;i<this.allowedMoves.length;i++){
							t = this.allowedMoves[i];
							drawMove(t,b.getTile(t).x,b.getTile(t).y);
						}
					}

					Player.prototype.getValidMoves = function(p){
						var pieceRules = getPieceTypeInfo(p.type);
						var mydirs = pieceRules.directions;
						if(mydirs == "*"){
							mydirs = "r,ur,up,ul,l,dl,d,dr";
						}
						var dirs = mydirs.split(",");
						var destTileID, b= getBoard(), x=b.numTilesX, y=b.numTilesY, mvlen = pieceRules.numSpacesPerMove;

						if(mvlen == "*" || mvlen == -1){
							mvlen = Math.max(x,y);
						}

						for(var i=0;i<dirs.length;i++){
							//TODO? do moves need a class/object to handle all these Move fns
							//draw each move on the moves canvas
								//check if valid move using Board.numTilesX/Y and p.tileID for proximity
								//movement in simple vectors using pieceRules.numSpacesPerMove
								switch(dirs[i]){
									case "r":
										if(p.tileID <= ((x*y)-x)-1){
											var j = 0, tid = p.tileID;

											while(j < mvlen){
												if(tid <= ((x*y)-x)-1){
													destTileID = tid + b.numTilesY;//set allowable move
													tid = destTileID;
													this.allowedMoves.push(destTileID);
													//drawMove(destTileID,b.getTile(destTileID).x,b.getTile(destTileID).y);
												}else{ j = mvlen; }
												j++;
											}

										}
										break;
									case "ur":
										if(p.tileID <= ((x*y)-x)-1 && (p.tileID % y) > 0 ){
											
											var j = 0, tid = p.tileID;
											while(j < mvlen){
												if(tid <= ((x*y)-x)-1 && (tid % y) > 0 ){
													destTileID = tid + b.numTilesY-1;//set allowable move
													tid = destTileID;
													this.allowedMoves.push(destTileID);
												}else{ j = mvlen; }
												j++;
											}


										}
										break;
									case "up":
										if(p.tileID % y > 0){
											var j = 0, tid = p.tileID;
											while(j < mvlen){
												if(tid % y > 0){
													destTileID = j==0 ? tid - 1 : destTileID - 1;//set allowable move
													tid = destTileID;
													this.allowedMoves.push(destTileID);
												}else{ j = mvlen; }
												j++;
											}
										}
										break;
									case "ul":
										if(p.tileID >= y && p.tileID % y > 0){


											var j = 0, tid = p.tileID;
											while(j < mvlen){
												if(tid >= y && tid % y > 0){
													destTileID = (tid - y) - 1;//set allowable move
													tid = destTileID;
													this.allowedMoves.push(destTileID);
												}else{ j = mvlen; }
												j++;
											}


										}
										break;
									case "l":
										if(p.tileID >= y){

											var j = 0, tid = p.tileID;
											while(j < mvlen){
												if(tid >= y){
													destTileID = tid - y;//set allowable move
													tid = destTileID;
													this.allowedMoves.push(destTileID);
												}else{ j = mvlen; }
												j++;
											}

										}
										break;
									case "dl":
										if(p.tileID >= y && (p.tileID % y) != (y-1)){
											


											var j = 0, tid = p.tileID;
											while(j < mvlen){
												if(tid >= y && (tid % y) != (y-1)){
													destTileID = (tid - y) + 1;//set allowable move
													tid = destTileID;
													this.allowedMoves.push(destTileID);
												}else{ j = mvlen; }
												j++;
											}

										}
										break;
									case "d":
										if((p.tileID % y) != (y-1)){
											

											var j = 0, tid = p.tileID;
											while(j < mvlen){
												if((tid % y) != (y-1)){
													destTileID = tid + 1;//set allowable move
													tid = destTileID;
													this.allowedMoves.push(destTileID);
												}else{ j = mvlen; }
												j++;
											}

										}
										break;
									case "dr":
										if(p.tileID <= ((x*y)-x)-1 && (p.tileID % y) != (y-1)){


											var j = 0, tid = p.tileID;
											while(j < mvlen){
												if(tid <= ((x*y)-x)-1 && (tid % y) != (y-1)){
													destTileID = tid + y + 1;//set allowable move
													tid = destTileID;
													this.allowedMoves.push(destTileID);
												}else{ j = mvlen; }
												j++;
											}

										}
										break;
									default:
										console.error("unknown move direction found! tried: " + dirs[i]);
										//throw new Problem("bad move detected");
									
								}

								//reset destTileID for next loop pass
								destTileID = undefined;

						}//end loop
					}
					
					Player.prototype.movePiece = function(p,destTile){
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

					}

					Player.prototype.addPiece = function(tileID, pieceType){
						var me= this;
						me.Pieces.push(new Piece(me.number, tileID, pieceType));
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

			// END  -- Player Functions


			//START -- Move Functions

				function drawMove(tileID, x,y){
					if(tileID === undefined && SomeTiles.debug){ console.warn("Tile ID needed for drawMove!"); return; }
					var board = getBoard();
					var canvas = document.getElementById(SomeTiles.c.moves) || document.getElementsByTagName("canvas")[0];

					if(canvas && canvas.getContext){
						var ctx = canvas.getContext("2d");
						var offcolor = SomeTiles.boardColors[1];
						var color = SomeTiles.boardColors[0];

						//use inverted colors of Board tile for better UI coloring of potential moves
							//var rgb = tileID %2 == 1 ? getRGBFromHexColor(invertHexColor(color)) : getRGBFromHexColor(invertHexColor(offcolor));
							//ctx.fillStyle = "rgba("+rgb[0]+","+rgb[1]+","+rgb[2]+","+0.3+")";

						ctx.fillStyle = "rgba(255,255,255,0.5)";
						//intuitive x value: (tileID / board.numTilesY>>0)*board.tileWidth
						//intuitive y value: (tileID / board.numTilesX>>0)*board.tileHeight
						ctx.fillRect(x,y,board.tileWidth,board.tileHeight);

					}

				}


				function clearMoves(){
					var canvas = document.getElementById(SomeTiles.c.moves);
					if(canvas && canvas.getContext){
						var ctx = canvas.getContext("2d");
						// Store the current transformation matrix
						ctx.save();

						// Use the identity matrix while clearing the canvas
						ctx.setTransform(1, 0, 0, 1, 0, 0);
						ctx.clearRect(0, 0, canvas.width, canvas.height);

						// Restore the transform
						ctx.restore();

					}
				}


				function invertHexColor(str){
					//length could be 4 or 7
					var hex = parseInt("0x"+str.substring(1));
					if(str.length == 4){
						hex = hex ^ 0xfff;
					}else if(str.length == 7){
						hex = hex ^ 0xffffff;
					}else{
						console.warn("invertHexColor:: input not length 4 or 7!");
					}
					return "#"+hex.toString(16);
				}


			// END  -- Move Functions



			//START -- PIECE Functions

				function generateUUID(){
				    var d = new Date().getTime();
				    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				        var r = (d + Math.random()*16)%16 | 0;
				        d = Math.floor(d/16);
				        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
				    });
				    return uuid;
				};

				function Piece(pnum, tileID, type){
					//this.id = (SomeTiles.Players[pnum].Pieces.length)+1;//the Piece ID!
					this.id = generateUUID();
					this.tileID = tileID;//which tile it is attached to! Piece is on Tile <i>
					this.selected = false;
					this.playerNum = pnum;
					this.imgpath;

					//TODO: put DB backend to this
					if(getAllPieceTypes().indexOf(type) >= 0){
						this.type = type;
					}else{
						this.type = 'square';
						console.error(type + " not in PieceType object!\n" + SomeTiles.PieceTypes);
					}

					this.typeRules = this.getTypeRules(this.type);

					//assign image if it exists
					if(this.typeRules !== undefined){ this.imgpath = this.typeRules.imgpath; }

					//type determines this Piece's shape, behaviors like movement/weapon actions/etc

					//this.behaviors?
					//this.actions
					//this.moveset
				}

				Piece.prototype.getTileInfo = function(){
					return SomeTiles.Boards[0].tileSet[this.tileID];
				}

				Piece.prototype.getTypeRules = function(type){
					return SomeTiles.PieceTypes.rules[type];
				}

				Piece.prototype.drawPiece = function(selected){
					var info = this.getTileInfo();

					if(!info && SomeTiles.debug){ console.warn("Tile info not found for Piece " + this.id); return; }
					var board = getBoard();
					var canvas = document.getElementById(SomeTiles.c.pieces) || document.getElementsByTagName("canvas")[0];

					if(canvas && canvas.getContext){
						var ctx = canvas.getContext("2d");
						var selColor = SomeTiles.Players[this.playerNum].PieceColorSelect;
						var color = SomeTiles.Players[this.playerNum].PieceColor;
						

						var drawType = this.imgpath !== undefined ? "img" : this.type;

						switch(drawType){
							case 'circle':
								var radius = Math.min(board.tileWidth, board.tileHeight) * 0.45;
								var centerX = info.x + (board.tileWidth/2);
								var centerY = info.y + (board.tileHeight/2);

								ctx.beginPath();
							    ctx.arc(centerX, centerY, radius, 0, Math.PI*2, false);
							    ctx.closePath();
							    ctx.strokeStyle = selColor;
							    ctx.stroke();
							    if (selected) {
									ctx.fillStyle = selColor;
									ctx.fill();
								}else{
									ctx.fillStyle = color;
									ctx.fill();
								}

								break;
							case 'square':
								var offset = 0.3;
								var bw = board.tileWidth, bh = board.tileHeight;


								var initx = info.x + (offset/2 * bw);
								var inity = info.y + (offset/2 * bh);


							    if (selected) {
									ctx.fillStyle = selColor;
								}else{
									ctx.fillStyle = color;
								}

								ctx.fillRect(initx,inity,bw - 2*((offset/2)*bw),bh -2*(offset/2)*bh);

								break;
							case 'img':
								//handle types that require drawn images!
								//load image
								var img = new Image();
								img.onload = function(){
									//thanks to Joe @ PlayMyCode.com for this tint trick! source: http://www.playmycode.com/blog/2011/06/realtime-image-tinting-on-html5-canvas/
									var rgbks = generateRGBKs(img);

									var rgbFromHex = selected ? getRGBFromHexColor(selColor) : getRGBFromHexColor(color);

									var tintImg = generateTintImage(img, rgbks, rgbFromHex[0], rgbFromHex[1], rgbFromHex[2]);

									//draw image
									ctx.drawImage(tintImg, info.x, info.y, board.tileWidth, board.tileHeight);

								}
								img.src = this.imgpath;
							
								break;
							default:
								console.error("invalid Piece type specified! not drawing!")
						}
					}//canvas & context
				}//end fn


				Piece.prototype.clearPiece = function(){
					var info = this.getTileInfo();

					if(!info && SomeTiles.debug){ console.warn("Tile info not found for Piece " + this.id); return; }
					var board = getBoard();
					var canvas = document.getElementById(SomeTiles.c.pieces) || document.getElementsByTagName("canvas")[0];

					if(canvas && canvas.getContext){
						var ctx = canvas.getContext("2d");
						//clear the tile-sized space where the piece would normally be drawn
						ctx.clearRect(info.x,info.y,board.tileWidth,board.tileHeight);

						//check for other pieces that might be on the same Tile, and redraw them
							var allPcsHere = getPieces(info.id);
							if( allPcsHere.length > 1 ){
								for(var i=0;i<allPcsHere.length;i++){
									if(this.id != allPcsHere[i].id){
										//redraw this one piece, unselected
										allPcsHere[i].drawPiece(false);
									}
								}
							}
					}
				}//end clearPiece fn

			// END  -- PIECE Functions


			//START -- Tile Functions
				function Tile(id,x,y){
					
					//properties
					this.id = id;
					this.x = x;
					this.y = y;

					//this.width = pxWidth;
					//this.height= pxHeight;
					//this.stackable = stackable;
					//this.features = features;

					this.hasPiece = false;
					this.numPieces = 0;
					this.pieceInfo = [];

					//methods done in proto.
				}

				/* //THESE ARE NOT IN USE RIGHT NOW
				Tile.prototype.setPiece = function(player_id){
					this.hasPiece = true;
					this.numPieces++;
					this.pieceInfo = {player: player_id};
				}

				Tile.prototype.getPieces = function(id){
					//do we even need the id here? the object will have the id inbuilt?
					//this fn seems redundant in JS, because it's not Java-scope strict
					return this.pieceInfo;
				}
				*/

			// END  -- Tile Functions


			//START -- Board Functions
	
				function getBoard(){
					//BAD: I'm in the global scope. :(
					//life-preserver if you need to get at the Board on the page
					return SomeTiles.Boards[0];
				}

				function Board(numTilesX, numTilesY, tileWidth, tileHeight, features, tileCount){
					//the Game Board now consists of 2 canvas layers: 1 for the underlying Board and 1 for all the Pieces

					//properties from args
					this.tileWidth = tileWidth;
					this.tileHeight = tileHeight;
					this.numTilesX = numTilesX;
					this.numTilesY = numTilesY;
					this.tileCount = tileCount || (numTilesX*numTilesY);
					this.features = features;
					this.tileSet = [];

					if(this.tileCount <= 100){
						this.makeTiles();
					}else{
						if(window.confirm("This Board is going to be large, a total of " + this.tileCount + " pieces!\nContinue?")){
							this.makeTiles();
						}else{
							return;
						}
					}

					this.drawBoard();

					SomeTiles.Boards.push(this);
					//methods
						//attaching methods with Board.prototype.func_name(){} eats less memory!

				}

				Board.prototype.addTile = function(tileObj){
					//adds a Tile object to this.tileSet
					this.tileSet.push({id: tileObj.id, x: tileObj.x, y:tileObj.y });
				};

				Board.prototype.makeTiles = function(tileWidth, tileHeight, features){
					//makes the set of Tile objects
					//TODO: special tile environmental features distribution
					var w = tileWidth || this.tileWidth,
						h = tileHeight || this.tileHeight,
						tileIndex = 0;

					if( this.numTilesX && this.numTilesY && w && h ){
						for(var i =0; i < this.numTilesX*w; i+=w){
							for(var j =0; j < this.numTilesY*h; j+=h){
								this.addTile( new Tile(tileIndex,i,j) );
								tileIndex++;
							}
						}
					}
				};


				//rotate Board
				//jumble the Board

				//the Board == Tile[]

				//draw Board with n-by-n tiles
				//Board will create all tiles needed
				//Board will display the Tiles
				Board.prototype.drawBoard = function(canvasID,colorarg,altcolorarg){
					var canvas = document.getElementById(SomeTiles.c.board) || document.getElementsByTagName("canvas")[0],
						color = colorarg || SomeTiles.boardColors[0],
						offcolor = altcolorarg || SomeTiles.boardColors[1],
						hasColors = color && offcolor;

					if(canvas && canvas.getContext){
						//fix the canvas bounds to fit the tiles before getting context!
						resizeCanvases(this.tileWidth*this.numTilesX, this.tileHeight*this.numTilesY);

						var ctx = canvas.getContext('2d');

						//UNEXPECTED FANFARE DISPLAY!!!
						//ctx.lineTo(ctx.canvas.width, ctx.canvas.width);
						//ctx.lineTo(ctx.canvas.height, ctx.canvas.height);

						//draw the grid
						var lineWidth = 1, 
						wmax = this.numTilesX*this.tileWidth, 
						hmax= this.numTilesY*this.tileHeight;
						//var gridIncrements = (ctx.canvas.width/n);
						for (var x = 0.5 + (lineWidth/2); x < wmax; x += this.tileWidth) {
						  ctx.moveTo(x, 0);
						  ctx.lineTo(x, Math.max(wmax,hmax));
						}
						for (var y = 0.5 + (lineWidth/2); y < hmax; y += this.tileHeight) {
						  ctx.moveTo(0, y);
						  ctx.lineTo(Math.max(hmax,wmax), y);
						}
						ctx.strokeStyle = color;
						ctx.lineWidth = lineWidth;
						ctx.stroke();

						//color the squares
							if(hasColors){
								var drawCount = 1, stagger = false;
								for(var i=0; i<this.tileSet.length;i++,drawCount++){
									
									var tile = this.tileSet[i];

									ctx.fillStyle = stagger ? color : offcolor;
									stagger = !stagger;
									//ctx.fillStyle = (drawCount % 2 == 1 || stagger) ? color : offcolor;

									if(drawCount == this.numTilesY && this.numTilesY % 2 == 0){ 
										drawCount = 0;
										stagger = !stagger; 
									}

									ctx.fillRect(tile.x,tile.y,this.tileWidth,this.tileHeight);
								}
								/*for (t in this.tileSet){
									var myobj = 
									drawCount++;
									
								}*/
							}

						/*ctx.fillStyle = "#bb0000";
						ctx.fillRect (10,10,350,355);

						ctx.fillStyle = "rgba(0,150,0,.4)";
						ctx.fillRect (30,30,365,380);*/

					}else{
						//canvas not supported! D:
					}

					//alter the CSS width of container
					$("#"+SomeTiles.c.piece).parent().css("width",this.tileWidth * this.numTilesX);

				}//end drawBoard fn

				
				Board.prototype.getTile = function(tid){
					//returns a tile's info from just a tid
					return this.tileSet[tid];
				}

			// END  -- Board Functions

			//START -- Image Functions
			function getRGBFromHexColor(hex){
				//input: #111 or #112233 hex string
				//confirm input length to see which case we're dealing with
				var result;
				if(hex.length == 4){
					var result =[parseInt(hex.substring(1,2),16)*16,parseInt(hex.substring(2,3),16)*16,parseInt(hex.substring(3,4),16)*16];
				}else if(hex.length == 7){
					var result =[parseInt(hex.substring(1,3),16)*16,parseInt(hex.substring(3,5),16)*16,parseInt(hex.substring(5,7),16)*16];
				}
				return result;
			}

			function generateRGBKs( img ) {
		        var w = img.width;
		        var h = img.height;
		        var rgbks = [];

		        var canvas = document.createElement("canvas");
		        canvas.width = w;
		        canvas.height = h;
		        
		        var ctx = canvas.getContext("2d");
		        ctx.drawImage( img, 0, 0 );
		        
		        var pixels = ctx.getImageData( 0, 0, w, h ).data;

		        // 4 is used to ask for 3 images: red, green, blue and
		        // black in that order.
		        for ( var rgbI = 0; rgbI < 4; rgbI++ ) {
		            var canvas = document.createElement("canvas");
		            canvas.width  = w;
		            canvas.height = h;
		            
		            var ctx = canvas.getContext('2d');
		            ctx.drawImage( img, 0, 0 );
		            var to = ctx.getImageData( 0, 0, w, h );
		            var toData = to.data;
		            
		            for (
		                    var i = 0, len = pixels.length;
		                    i < len;
		                    i += 4
		            ) {
		                toData[i  ] = (rgbI === 0) ? pixels[i  ] : 0;
		                toData[i+1] = (rgbI === 1) ? pixels[i+1] : 0;
		                toData[i+2] = (rgbI === 2) ? pixels[i+2] : 0;
		                toData[i+3] =                pixels[i+3]    ;
		            }
		            
		            ctx.putImageData( to, 0, 0 );
		            
		            // image is _slightly_ faster then canvas for this, so convert
		            var imgComp = new Image();
		            imgComp.src = canvas.toDataURL();
		            
		            rgbks.push( imgComp );
		        }

		        return rgbks;
		    }

		      function generateTintImage( img, rgbks, red, green, blue ) {
		        var buff = document.createElement( "canvas" );
		        buff.width  = img.width;
		        buff.height = img.height;
		        
		        var ctx  = buff.getContext("2d");

		        ctx.globalAlpha = 1;
		        ctx.globalCompositeOperation = 'copy';
		        ctx.drawImage( rgbks[3], 0, 0 );

		        ctx.globalCompositeOperation = 'lighter';
		        if ( red > 0 ) {
		            ctx.globalAlpha = red   / 255.0;
		            ctx.drawImage( rgbks[0], 0, 0 );
		        }
		        if ( green > 0 ) {
		            ctx.globalAlpha = green / 255.0;
		            ctx.drawImage( rgbks[1], 0, 0 );
		        }
		        if ( blue > 0 ) {
		            ctx.globalAlpha = blue  / 255.0;
		            ctx.drawImage( rgbks[2], 0, 0 );
		        }

		        return buff;
		    }


			// END  -- Image Functions
