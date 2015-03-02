			//Proof of Concept Reqs: 	A displayed Board <- Tiles, Player able to move 1 Piece across the Board
			//Next steps: 				Multiple pieces, tile feature triggers, 2 players hotseat, Rules


			//TODO ASAP: clean this spaghetti up with some Prototypal Inheritance of my Objects!!!


			//Board is made up of Tiles
			//Game Pieces occupy Tiles, based on moves from the Player
			//In this sketch, Main() will test the Player moving GamePieces onto Tiles
			//var canvasID = "drawhere";

			var SomeTiles = { Boards: [], canvasID: "drawhere" };

			//our MAIN()
			function onceLoaded(){

				//create Board (constructor makes Tile set)
				//display Board
					var myboard = new Board(3,3,100,100,"drawhere");

					var p1 = new Player(0);
					

				//create Pieces(playerID?)
				//attach Pieces to Tiles
				//assign Pieces to Tiles
					p1.Pieces.push(new Piece(1,0));

				//check for info 
					//TODO: clean this up, it's damn near spaghetti!
					p1.Pieces[0].getTileInfo();


				//display Pieces
					p1.Pieces[0].drawPiece();
			}

			//START -- Player Functions
				//Player
					function Player(num){
						this.number = num;
						this.Pieces = [];
						//this.PieceImage = '';
						this.PieceShape = "circle"; //set of shapes: (circle, triangle)
						this.PieceColor = "#0b0";//hex or rgba for canvas contexts

					}
			// END  -- Player Functions


			//START -- PIECE Functions
				function Piece(id, tileID){
					this.id = id;
					this.tileID = tileID;//which tile it is attached to! Piece is on Tile <i>
					this.selected = false;
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
					var info = this.getTileInfo(),
					 canvas = document.getElementById(SomeTiles.canvasID) || document.getElementsByTagName("canvas")[0],
					 radius = Math.min(getBoard().tileWidth, getBoard().tileHeight) * 0.45,
					 centerX = info.x + (getBoard().tileWidth/2),
					 centerY = info.y + (getBoard().tileHeight/2);

					if(canvas && canvas.getContext){
						var ctx = canvas.getContext("2d");
						ctx.beginPath();
					    ctx.arc(centerX, centerY, radius, 0, Math.PI*2, false);
					    ctx.closePath();
					    ctx.strokeStyle = "#000";
					    ctx.stroke();
					    if (selected) {
							ctx.fillStyle = "#000";
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
						hasColors = false && color && offcolor;

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
								var drawCount = 1;
								for (t in this.tileSet){
									var myobj = this.tileSet[t];
									drawCount++;
									ctx.fillStyle = (drawCount % 2 == 1) ? color : offcolor;
									ctx.fillRect (myobj.x,myobj.y,this.tileWidth,this.tileHeight);
								}
								
							}

						/*ctx.fillStyle = "#bb0000";
						ctx.fillRect (10,10,350,355);

						ctx.fillStyle = "rgba(0,150,0,.4)";
						ctx.fillRect (30,30,365,380);*/

					}else{
						//canvas not supported! D:
					}
				}//end drawBoard fn

			// END  -- Board Functions
