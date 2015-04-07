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


			//START -- Piece Types

				//define movement, actions, shape, etc for this piece type
				//TODO: read all this info in from the server's RGG response data
				var pcTypes = {
					types: ["circle","square", "knight", "doge"],
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
							directions: "*",
							numSpacesPerMove: 3
						},
						doge:{
							imgpath: "img/doge.png",
							directions: "*",
							numSpacesPerMove: 1
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
				};

			//our MAIN()
			function onceLoaded(){

				//create Board (constructor makes Tile set)
				//display Board
					var myboard = new Board(7,7,50,50);

					var p1 = new Player(0);
					

				//create Pieces(playerID?)
				//attach Pieces to Tiles
				//assign Pieces to Tiles
					p1.addPiece(0,2,"doge");

				//make set of Pieces for given player
					p1.addPiece(0,10,"circle");
					p1.addPiece(0,34,"circle");

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
					//must be canvas with highest z-index on page
					var topLayerCanvas = getTopLayerCanvas();

					
					var canvas = topLayerCanvas || document.getElementById(SomeTiles.canvasID) || document.getElementsByTagName("canvas")[0];
					canvas.addEventListener("click", canvasClick, false);
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

				//TODO: minor cleanup of vars?
				if(e.target.offsetLeft == 0 && e.target.offsetTop ==0){
					x-= e.target.offsetParent.offsetLeft;
					y-= e.target.offsetParent.offsetTop;
				}else{
					x -= e.target.offsetLeft;
					y -= e.target.offsetTop;
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
								//move
								movestr = "moving piece from Tile id:" + player.selectedPiece.tileID + "\tto Tile id: " + theTile.id;
								player.movePiece(player.selectedPiece,theTile);
							}else{ 
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

			function getPieceTypeInfo(t){
				//searches the types for t. if it exists, returns an Object with that piece type's rule info, else undefined
				if(typeof t != "string"){t="";}
				return SomeTiles.PieceTypes.rules[t];
			}

			//START -- Player Functions
				//Player
					function Player(num){
						this.number = num;
						this.Pieces = [];
						//this.PieceImage = '';
						//this.PieceShape = "circle"; //set of shapes: (circle, triangle)
						this.PieceColor = "#ddd";//hex or rgba for canvas contexts
						this.PieceColorSelect = "#777";//hex or rgba for canvas contexts

						this.selectedPiece;//normally a piece ID

						SomeTiles.Players.push(this);
					}

					Player.prototype.selectPiece = function(p){
						this.selectedPiece = p;
						p.drawPiece(true);//redraw in same position

						//TODO: PRIORITY get valid moves for the now-selected Piece p
						var pieceRules = getPieceTypeInfo(p.type);
						var dirs = pieceRules.directions.split(",");
						for(var i=0;i<dirs.length;i++){
							//TODO: moves need a class/object to handle all these Move fns
						}

						//MOVES -- moves are defined as adjacent spaces a player can go to with this newly-selected Piece!
						//8 moves are classified in counter-clockwise quadrants like cartesian plane
							//0: space directly to the right
							//1: space 45 deg upper-right
							//2: space directly above
							//3: space 135 deg from 0 aka upper-left
							//4: space directly left
							//5: space lower-left
							//6: space directly below this one
							//7: space lower-right
						

						//TODO: SHOW the valid moves for p on the Moves canvas!

					}

					Player.prototype.deselectPiece = function(p){
						this.selectedPiece = undefined;
						p.drawPiece(true);//redraw in same position

						//TODO: CLEAR the valid moves away
					}

					
					Player.prototype.movePiece = function(p,destTile){
						//move the given Piece p to the given destination Tile 
						
						//clearPiece of old tileID
						p.clearPiece(p.tileID);

						//change id
						p.tileID = destTile.id;
						
						//The Player deselects the now-moved piece
						this.deselectPiece(p);

						p.drawPiece(false);

						//an old impl'n of this re-drew the whole board + pieces on every pass. this is WORTH IT!

					}

					Player.prototype.addPiece = function(playernum, tileID, pieceType){
						this.Pieces.push(new Piece(playernum, tileID, pieceType));
					}

					Player.prototype.addPieceThenDraw = function(playernum, tileID, pieceType){
						var newp = new Piece(playernum, tileID, pieceType);
						this.Pieces.push(newp);
						newp.drawPiece(false);

					}

					Player.prototype.addPieceSet = function(playernum, set, pieceType){

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

						//TODO: implement and call the function to redraw this tileID
						rmPiece.clearPiece(tileID);

						return rmPiece;
					}

					Player.prototype.drawPieces = function(){
						for(var i=0;i<this.Pieces.length;i++){
							this.Pieces[i].drawPiece();
						}
					}

			// END  -- Player Functions



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
								//TODO: handle types that require drawn images!
								//load image
								var img = new Image();
								img.onload = function(){
									//thanks to Joe @ PlayMyCode.com for this tint trick! source: http://www.playmycode.com/blog/2011/06/realtime-image-tinting-on-html5-canvas/
									var rgbks = generateRGBKs(img);

									//var rgbFromHex = getRGBFromHexColor(color);

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



						//TODO: check for other pieces that might be on the same Tile too!
						//is this even important?


					}

				}//end clearPiece fn


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
					var canvas = document.getElementById(SomeTiles.c.board) || document.getElementsByTagName("canvas")[0],
						color = color || "#a00",
						offcolor = offcolor || "#222",
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

				
				Board.prototype.drawTile = function(tileID){
					//TODO: to help make the Player.movePiece function more efficient!

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
