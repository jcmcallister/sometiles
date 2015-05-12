
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
					this.tileSet.push(new Tile(tileObj.id, tileObj.x, tileObj.y ));
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

				Board.prototype.getTilesWithColor = function(c){
					return _.where(this.tileSet, {color:c});
				}

				Board.prototype.populate = function(){
					var pcTypes = getAllPieceTypes(), pcInfo, pcLoc, pcMin, pcMax, tidList = [];

					for(var pl=0;pl<SomeTiles.Players.length;pl++){
						for(var i=0; i<pcTypes.length;i++){
							pcInfo = getPieceTypeInfo(pcTypes[i]);
							//TODO: begin method chunk for getNumPiecesPerPlayer
							var ppp = pcInfo.piecesPerPlayer;

							if(typeof ppp == "string"){
								switch(ppp){
									case "fill":
										ppp = this.tileCount / 2;
										if(pcInfo.hasOwnProperty("sameColorPlacement") && pcInfo.sameColorPlacement == true){
											ppp /= 2;
											var tiles = this.getTilesWithColor(SomeTiles.boardColors[0]);
											var numEmptyRows = _.has(pcInfo,"numEmptyRows") ? pcInfo.numEmptyRows : 0;
											for(var tile in tiles ){
												//add pieces since we're filling up by color
												if(pl==0){
													pcMin = 0;
													pcMax = (this.tileCount/2)-(this.numTilesX*numEmptyRows);
												}else{
													pcMin = (this.tileCount/2)+(this.numTilesX*numEmptyRows);
													pcMax = this.tileCount;
												}
												if(pcMin <= tiles[tile].id && tiles[tile].id < pcMax){
													SomeTiles.Players[pl].addPiece(tiles[tile].id,pcTypes[i]);
													//getPiece(tiles[tile].id).assignDirections();
													tidList.push(tiles[tile].id);
												}
											}

										}
										break;
								}
							}else{
								//TODO: end of method chunk
								//add pieces until you run out of spaces to put them
								for(var k=0;k<ppp && (tidList.length <= this.tileCount/2);k++){

									if(typeof pcInfo.startingPositions === "number"){
										//it's random!
										if(pl==0){
											pcMin = 0;
											pcMax = (this.tileCount/2)-1;
										}else{
											pcMin = (this.tileCount/2);
											pcMax = this.tileCount -1;
										}
										pcLoc = Math.floor(Math.random() * (pcMax - pcMin)) + pcMin ;
										while(_.indexOf(tidList,pcLoc) >= 0 && tidList.length < (pcMax-pcMin) ){
											//no duplicate pieces overlaid!
											pcLoc = Math.floor(Math.random() * (pcMax - pcMin)) + pcMin ;
										}
										
										SomeTiles.Players[pl].addPiece(pcLoc,pcTypes[i]);
										tidList.push(pcLoc);
									}else{
										//the startingPositions are structured in a 2d array!
										//apply the simple coordinates to the player, and transpose them for p2's side of the board
										//for(var j=0;j<pcInfo.startingPositions.length;j++){
											//pcInfo.startingPositions[j]: x,y coord pair
										if(pcInfo.startingPositions.length == ppp){
											//0: x-coord, 1: y-coord
											var myx = pcInfo.startingPositions[k][0];
											var myy = pcInfo.startingPositions[k][1];
											var bx = this.numTilesX;
											var by = this.numTilesY;

											if(pl==0){
												pcLoc = (myx*by) + myy;// x + y
											}else{
												pcLoc = ((bx-1)-myx)*by+myy;//n-1-x + y
											}
											SomeTiles.Players[pl].addPiece(pcLoc,pcTypes[i]);
											tidList.push(pcLoc);
										}
										
									}
								
									
								}//end loop amount of this piece type per player
							}
						}//end loop for this piece type
						SomeTiles.Players[pl].drawPieces();
					}//end loop for each Player
				}


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
						hasColors = color && offcolor, 
						wmax, hmax;

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

									//update the tile with the right color
									if(stagger){
										ctx.fillStyle = color;
										this.tileSet[i].setColor(color);
									}else{
										ctx.fillStyle = offcolor;
										this.tileSet[i].setColor(offcolor);
									}

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
						showDialog("<h3>This requires browser support for HTML Canvas elements. Consider installing Chrome or Firefox.</h3>");
					}

					//alter the CSS width of container
					$("#"+SomeTiles.c.pieces).parent().css({
						"width" : this.tileWidth * this.numTilesX,
						"height": this.tileHeight * this.numTilesY
					});

				}//end drawBoard fn

				
				Board.prototype.getTile = function(tid){
					//returns a tile's info from just a tid
					return this.tileSet[tid];
				}

			// END  -- Board Functions