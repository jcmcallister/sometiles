			//Proof of Concept Reqs: 	A displayed Board <- Tiles, Player able to move 1 Piece across the Board
			//Next steps: 				Multiple pieces, tile feature triggers, 2 players hotseat, Rules

			//Board is made up of Tiles
			//Game Pieces occupy Tiles, based on moves from the Player
			//In this sketch, Main() will test the Player moving GamePieces onto Tiles
			//var canvasID = "drawhere";

			//BOARD FUNCTIONS

			//the Board == Tile[]

			//draw Board with n-by-n tiles
			function drawBoard(canvasID){
				var n = 5,
					canvas = document.getElementById(canvasID),
					color = "#a00",
					offcolor = "#222",
					hasColors = true;

				if(canvas.getContext){
					var ctx = canvas.getContext('2d');

					//UNEXPECTED FANFARE DISPLAY!!!
					//ctx.lineTo(ctx.canvas.width, ctx.canvas.width);
					//ctx.lineTo(ctx.canvas.height, ctx.canvas.height);

					//draw the grid
					var lineWidth = 1;
					var gridIncrements = (ctx.canvas.width/n);
					for (var x = 0.5 + (lineWidth/2); x < ctx.canvas.width; x += gridIncrements) {
					  ctx.moveTo(x, 0);
					  ctx.lineTo(x, ctx.canvas.width);
					}
					for (var y = 0.5 + (lineWidth/2); y < ctx.canvas.height; y += gridIncrements) {
					  ctx.moveTo(0, y);
					  ctx.lineTo(ctx.canvas.height, y);
					}
					ctx.strokeStyle = color;
					ctx.lineWidth = lineWidth;
					ctx.stroke();

					//color the squares
					if(hasColors){
						var drawCount = 1;
						for (var x = 0; x < ctx.canvas.width; x += gridIncrements) {
							for(var y=0; y<ctx.canvas.width; y+= gridIncrements){
								drawCount++;
								//if(){ continue; }
								ctx.fillStyle = (drawCount % 2 == 1) ? color : offcolor;
								ctx.fillRect (x,y,gridIncrements,gridIncrements);
								
							}
						}
					}

					/*ctx.fillStyle = "#bb0000";
					ctx.fillRect (10,10,350,355);

					ctx.fillStyle = "rgba(0,150,0,.4)";
					ctx.fillRect (30,30,365,380);*/

				}else{
					//canvas not supported! D:
				}


			}


			//rotate Board
			//jumble the Board


			function getPieces(){
				return this.hasPiece;
			}

			function getPieceInfo(){
				return this.pieceInfo;
			}

			/*function getPieces(tileIndex){
				//code this in as needed!
			}*/

			function Tile(pxWidth, pxHeight, stackable, features){
				
				//properties
				this.width = pxWidth;
				this.height= pxHeight;
				this.stackable = stackable;
				this.features = features;

				this.hasPiece = false;
				this.numPieces = 0;
				this.pieceInfo = null;

				//methods
				this.getPieces = getPieces;
				this.setPiece = function(player_id){
					this.hasPiece = true;
					this.numPieces++;
					this.pieceInfo = {player: player_id};
				}

				this.displayTile = function(){
					//canvas?

					//html divs?


				}
			}

			//plain old tile, 60x100px, stackable, no special features
			var demotile = new Tile(60,100,true, {} );

			console.log("do you have a piece on top of you, tile?\t" + demotile.hasPiece);

			demotile.setPiece(2);

			console.log("do you have a piece on top of you, tile?\t" + demotile.hasPiece);
			console.log(demotile);
/*
			function Board(tileWidth, tileHeight, features){
				//properties
				this.tileWidth = tileWidth;
				this.tileHeight = tileHeight;
				this.features = features;

				this.tileSet = makeTiles;
				//methods
				this.display = displayBoard;




				//this.getPiecePositions = 
			}

			var theBoard = new Board(4,4,{});

			function makeTiles(){

			}
*/
