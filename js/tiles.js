			//Proof of Concept Reqs: 	A displayed Board <- Tiles, Player able to move 1 Piece across the Board
			//Next steps: 				Multiple pieces, tile feature triggers, 2 players hotseat, Rules


			//TODO ASAP: clean this spaghetti up with some Prototypal Inheritance of my Objects!!!


			//Board is made up of Tiles
			//Game Pieces occupy Tiles, based on moves from the Player
			//In this sketch, Main() will test the Player moving GamePieces onto Tiles
			//var canvasID = "drawhere";

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


			//START -- Piece Types DEMO!!!

				//define movement, actions, shape, etc for this piece type
				//TODO: read all this info in from the server's RGG response data
				var pcTypes = {
					types: ["circle","square", "knight"],
					rules:{
						circle:{
							directions: "0,2,4,6",
							numSpacesPerMove: "1"
							//TODO: any other data fields to be manipulated in gameplay go here!
						},
						square:{
							directions: "1,3,5,7",
							numSpacesPerMove: "-1"//-1 to codify N spaces? any # of spaces allowable
							//TODO: will be read in from DB same as above, any other data fields here (UNIFORM with above PieceType rules)
						},
						knight:{
							imgpath: "img/knight.png",
							directions: "1,2,3,4,5,6,7,8",
							numSpacesPerMove: 3
						}
					}
				};

			// END  -- Piece Types DEMO!!!

			var SomeTiles = { 
					Boards: [],
					canvasID: "drawhere",
					Players: [],
					debug: true
					//,Game: theGame //TODO: add this once Game is done coming back from server
					,PieceTypes: pcTypes
				};

			//our MAIN()
			function onceLoaded(){

				//create Board (constructor makes Tile set)
				//display Board
					var myboard = new Board(7,7,50,50,"drawhere");

					var p1 = new Player(0);
					

				//create Pieces(playerID?)
				//attach Pieces to Tiles
				//assign Pieces to Tiles
					p1.addPiece(0,2,"foo");

				//make set of Pieces for given player
					p1.addPiece(0,10,"circle");

				//a piece from an image
					p1.addPiece(0,20,"knight");

				//check for info 
					//TODO: clean this up, it's damn near spaghetti!
					p1.Pieces[0].getTileInfo();

				//display Pieces
				//draw ALL pieces
					p1.drawPieces();

				//DEMO ONLY: remove a piece
					//p1.removePiece(20);

				//add Mouse listener
					var canvas = document.getElementById(SomeTiles.canvasID) || document.getElementsByTagName("canvas")[0];
					canvas.addEventListener("click", canvasClick, false);
			}

			function canvasClick(e){
				//get cursor position
				var x, y, thePiece, b=getBoard();
				if(e.pageX  != undefined && e.pageY != undefined){
					x = e.pageX;
					y = e.pageY;
				}else{
					x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
					y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
				}
				x -= e.target.offsetLeft;
				y -= e.target.offsetTop;

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

					//TODO: FIX THIS ONCE PLAYER CODE IN PLACE
					
					//select or move the piece in the clicked position!

					if(thePiece && !player.selectedPiece){
						//select
						player.selectPiece(thePiece);
						movestr = "selecting piece on Tile id:" + theTile.id;
					}else{
						if(player.selectedPiece){
							if(player.selectedPiece.tileID != theTile.id){
								//move
								movestr = "moving piece from Tile id:" + player.selectedPiece.tileID + "\tto Tile id: " + theTile.id;
								player.movePiece(player.selectedPiece,theTile);
							}else{ movestr = "can't move from Tile to same Tile!"; }
						}
					}

					if(SomeTiles.debug){
						console.log(movestr);
					}

				
			}

			function getPiece(tid){
				//select the Piece from all Players & their sets of Pieces
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

			//START -- Player Functions
				//Player
					function Player(num){
						this.number = num;
						this.Pieces = [];
						//this.PieceImage = '';
						this.PieceShape = "circle"; //set of shapes: (circle, triangle)
						this.PieceColor = "#0b0";//hex or rgba for canvas contexts

						this.selectedPiece;//normally a piece ID

						SomeTiles.Players.push(this);
					}

					Player.prototype.selectPiece = function(p){
						this.selectedPiece = p;
						p.drawPiece(true);//redraw in same position
					}

					Player.prototype.deselectPiece = function(p){
						this.selectedPiece = undefined;
						//p.drawPiece(true);//redraw in same position
					}

					Player.prototype.movePiece = function(p,destTile){
						//move the given Piece p to the given destination Tile 

						//step 1: change tile ID of p to destTile
						p.tileID = destTile.id;

						//deselect piece
						this.selectedPiece = undefined;

						//step 1.5 : redraw the Board
						getBoard().drawBoard(SomeTiles.canvasID);

						//step 2: redraw pieces
							this.drawPieces();

						//step 2.5 redraw the moved piece!
							p.drawPiece(false);//redraw in same position
					}

					Player.prototype.addPiece = function(pnum, tileID, pieceType){
						this.Pieces.push(new Piece(pnum, tileID, pieceType));
					}

					Player.prototype.addPieceSet = function(pnum, set, pieceType){

						var curPiece;

						for(var i=0;i<set.length;i++){
							//curPiece = set[i]; //TODO: finish this method!!!
						}
					}

					Player.prototype.removePiece = function(tileID){
						//TODO: grab piece at given Tile ID, remove it from the Player's piece array and return it
						var rmPiece = getPiece(tileID);

						if(!rmPiece){ console.error("piece not found at tile " + tileID); return; }

						var pieceArr = SomeTiles.Players[rmPiece.playerNum].Pieces;

						//splice it off
						for(var i=0;i<pieceArr.length;i++){
							if(pieceArr[i].id == rmPiece.id){
								pieceArr.splice(i,1);
							}
						}

						return rmPiece;
					}

					Player.prototype.drawPieces = function(){
						for(var i=0;i<this.Pieces.length;i++){
							this.Pieces[i].drawPiece();
						}
					}

			// END  -- Player Functions



			//START -- PIECE Functions
				function Piece(pnum, tileID, type){
					this.id = (SomeTiles.Players[pnum].Pieces.length)+1;
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

				/*function getPlayerPieces(playerid){
					return this.hasPiece;
				}*/

				Piece.prototype.getTileInfo = function(){
					return SomeTiles.Boards[0].tileSet[this.tileID];
				}

				Piece.prototype.getTypeRules = function(type){
					return SomeTiles.PieceTypes.rules[type];
				}

				Piece.prototype.drawPiece = function(selected){
					var info = this.getTileInfo();

					if(!info && SomeTiles.debug){ console.warn("Tile info not found for Piece " + this.id); return; }
					var canvas = document.getElementById(SomeTiles.canvasID) || document.getElementsByTagName("canvas")[0];

					if(canvas && canvas.getContext){
						var ctx = canvas.getContext("2d");
						var selColor = "#777";//TODO: color & selectedColor should come from Piece object
						var color = "#ddd";
						var board = getBoard();

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
								//TODO: handle types that require drawn images!
								//load image
								var img = new Image();
								img.src = this.imgpath;
								//img.width = board.tileWidth;
								//img.height = board.tileHeight;
								


								//TODO: alter image data to tint it towards the player's colors
								//var data = ctz.getImageData
								//var oldcrap = ctx.globalCompositeOperation;
								//ctx.globalCompositeOperation = 'lighter';


								//draw image
								ctx.drawImage(img, info.x, info.y, board.tileWidth, board.tileHeight);


								//TODO: remove once tint is in 
								//set the op back?
								//ctx.globalCompositeOperation = oldcrap;
								break;
							default:
								//TODO: decide on a default piece to be drawn?
								console.error("invalid Piece type specified! not drawing!")
						}
					 


					}//canvas & context
					
				}//end fn


				/*function getPieces(tileIndex){
					//code this in as needed!
				}*/
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
					//TODO: cleanup
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

				function Board(numTilesX, numTilesY, tileWidth, tileHeight, canvasID, features, tileCount){
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

					this.drawBoard(canvasID);

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
					//TODO: ensure that generated tile IDs do not conflict
					//TODO: special tile features distribution
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
				Board.prototype.drawBoard = function(canvasID,color,offcolor){
					var canvas = document.getElementById(canvasID) || document.getElementsByTagName("canvas")[0],
						color = color || "#a00",
						offcolor = offcolor || "#222",
						hasColors = color && offcolor;

					if(canvas && canvas.getContext){
						//fix the canvas bounds to fit the tiles before getting context!
						//if(canvas.width < this.tileWidth*this.numTilesX){
							canvas.width = this.tileWidth*this.numTilesX;
						//}
						//if(canvas.height < this.tileHeight*this.numTilesY){
							canvas.height = this.tileHeight*this.numTilesY;
						//}

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
					$("#container").css("width",this.tileWidth * this.numTilesX);

				}//end drawBoard fn

			// END  -- Board Functions
