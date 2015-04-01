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

			var SomeTiles = { 
				Boards: [],
				canvasID: "drawhere",
				Players: [],
				debug: true
				//,Game: theGame //TODO: add this once Game is done coming back from server
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
					p1.Pieces.push(new Piece(1,20));

				//make set of Pieces for given player
					p1.addPiece(1,10,"circle");

				//check for info 
					//TODO: clean this up, it's damn near spaghetti!
					p1.Pieces[0].getTileInfo();

				//display Pieces
					//p1.Pieces[0].drawPiece();

				//draw ALL pieces
					p1.drawPieces();

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

					Player.prototype.addPiece = function(pieceID, tileID, pieceType){
						var newPiece = new Piece(pieceID, tileID, pieceType);
						this.Pieces.push(newPiece);
					}

					Player.prototype.drawPieces = function(){
						for(var i=0;i<this.Pieces.length;i++){
							this.Pieces[i].drawPiece();
						}
					}

			// END  -- Player Functions

			//START -- Piece Types

				//define movement, actions, shape, etc for this piece type

			// END  -- Piece Types


			//START -- PIECE Functions
				function Piece(id, tileID, type){
					this.id = id;
					this.tileID = tileID;//which tile it is attached to! Piece is on Tile <i>
					this.selected = false;

					//type determines this Piece's shape, behaviors like movement/weapon actions/etc
					//TODO: put DB backend to this
					if(type == 'circle'){
						this.type = type;
					}else{
						this.type = 'square';
					}

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

				Piece.prototype.drawPiece = function(selected){
					var info = this.getTileInfo();

					if(!info && SomeTiles.debug){ console.warn("Tile info not found for Piece " + this.id); return; }
					var canvas = document.getElementById(SomeTiles.canvasID) || document.getElementsByTagName("canvas")[0],
					 radius = Math.min(getBoard().tileWidth, getBoard().tileHeight) * 0.45,
					 centerX = info.x + (getBoard().tileWidth/2),
					 centerY = info.y + (getBoard().tileHeight/2),
					 selColor = "rgba(221,221,221,0.65)",
					 color = "rgb(221,221,221)";

					if(canvas && canvas.getContext){
						var ctx = canvas.getContext("2d");
						ctx.beginPath();
					    ctx.arc(centerX, centerY, radius, 0, Math.PI*2, false);
					    ctx.closePath();
					    ctx.strokeStyle = "#777";
					    ctx.stroke();
					    if (selected) {
							ctx.fillStyle = "#777";
							ctx.fill();
						}else{
							ctx.fillStyle = "#ddd";
							ctx.fill();
						}


					}
					
				}


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
					this.pieceInfo = null;

					//methods done in proto.
				}

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
