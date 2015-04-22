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

			function logthis(msg){
				if(SomeTiles.debug){ console.log(msg); }
			}

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
							piecesPerPlayer: "fill",
							symmetricPlacement: false,
							sameColorPlacement: true,//TODO priority: finish placement and checkers is up!
							numEmptyRows: 1, //number of empty rows per side if you're doing a fill with sameColorPlacement
							//startingPositions: [[0,0],[3,3], [0,7],[3,4]]//mirrored piece placement = numeric xy coords, random places on half board = -1
							startingPositions: [[2,2], [3,5]]
							,moveVectors:[
								{
									directions: "ur,ul,dl,dr"
									,distanceOptions: [1] //these are options the player could make use of, see the Knight piece below
									,mustGoMax: false
									,noclip: false //if noclip, the Piece floats through adjacent pieces from src to dest
									,forwardOnly: true
								}
							],
							capture: {
								mechanic: "leapfrog",
								type: "special_move",
								move: {
									directions: "ur,ul,dl,dr",
									distanceOptions: [2],
									mustGoMax: true,
									forwardOnly: true
								}
							}
							//TODO: any other data fields to be manipulated in gameplay for Circles go here!
						}
						,square:{ //now a chess pawn
							piecesPerPlayer: 0
							,startingPositions: -1
							,moveVectors:[
								{
									directions: "r"
									,distanceOptions: [1]
									,relDirections: true
									,mirrorDirections: true
									,mustGoMax: false
									,noclip: false 
								}
							],
							capture: {
								mechanic: "collide",
								type: "special_move"
								,move: {
									directions: "ur,dr",
									distanceOptions: [1],
									mustGoMax: true
								}
							} 
							//TODO: will be read in from DB same as above, any other data fields here (UNIFORM with above PieceType rules)
						}
						,knight:{
							imgpath: "img/knight.png",
							piecesPerPlayer: 0
							,startingPositions: -1
							,moveVectors:[
								{
									directions: "r,up,l,d"
									,distanceOptions: [1,2] //move options the player could choose, "up 1 over 2" versus "up 2 over 1"
									,mustGoMax: true
									,noclip: true //if noclip, the Piece floats through adjacent pieces from src to dest & the only collision check occurs at dest.
									//if !noclip, the Piece must check if a Piece is blocking the path from currentTileID to destTileID
								},
								{
									directions: "l,r"
									,distanceOptions: [ 2,1 ] //the complement of the above distance vectors of the first move
									,mustGoMax: true
									,noclip:true
								}
							],
							capture: {
								mechanic: "collide",
								type: "normal_move"
							}
						}
						,doge:{
							imgpath: "img/doge.png",
							piecesPerPlayer: 0
							,startingPositions: -1
							,moveVectors:[
								{
									directions: "*"
									,distanceOptions: [2] //these are options the player could make use of, see the Knight piece below
									,mustGoMax: true
									,noclip: false //if noclip, the Piece floats through adjacent pieces from src to dest
								}
							],
							capture: {
								mechanic: "leapfrog",
								type: "normal_move"
							}
						}

					}
				};


			// END  -- Piece Types 

			//the active game state object in this client
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
					,GoalConditions: {
						zeroEnemies: true
					}
				};

			//our MAIN()
			function onceLoaded(){

				//TODO: basic UI

				//on new game selection,
					//makeGame();
				

			}

			//on page load
			$(function(){

				//attach menu click handlers
				$("#newgame").on("click", function(){
					makeGame();
					$("#messaging").removeClass("hidden");
					$("#ui").slideUp(400, function(){
						//TODO Priority: POLISH THE CSS SO ITS SEAMLESS
						$("#gameplay").removeClass("hidden");
					});
				});

				$("#joingame").on("click", function(){

				});

				$("#myaccount").on("click", function(){

				});

				$("#recentgames").on("click", function(){

				});

				onceLoaded();



			});


			function makeGame(){

				//create Board (constructor makes Tile set)
				//display Board
					var myboard = new Board(10,10,72,72);

					var p1 = new Player(0);
					var p2 = new Player(1, "#b00", "#d33");
					
				//dynamically create the right amount of Player Pieces from Piece Type rules
				//TODO: abstract this into a populateBoard method
					myboard.populate();


				//which Player goes first?
				SomeTiles.turn = Math.round(Math.random());
				//set the first turn
				SomeTiles.Players[SomeTiles.turn].isTurn = true;

				showDialog("Player " + (SomeTiles.turn+1) + " goes first!");

				//draw ALL pieces
					//p1.drawPieces();

				//add Mouse listener
					//must be canvas with highest z-index on page
					var topLayerCanvas = getTopLayerCanvas();
					
					var canvas = topLayerCanvas || document.getElementsByTagName("canvas")[0];
					canvas.addEventListener("click", canvasClick, false);

				//switchTurn() call inside of movePiece(), should be in any action function that consumes or finishes a turn  
				
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
				var player = thePlayer();
				var movestr = "NO piece on Tile id = " + theTile.id;

				if(thePiece === undefined && player.selectedPiece === undefined){
					//piece not found?
					if(SomeTiles.debug){
						console.log(movestr);
					}
					return;
				}

				//select or move the piece in the clicked position!

				if(thePiece && !player.selectedPiece){
					//select
					player.selectPiece(thePiece);
					movestr = "selecting piece on Tile id:" + theTile.id;
				}else{
					if(player.selectedPiece){
						if(player.selectedPiece.tileID != theTile.id){

							//check the available moves
							if(player.getAllMoves().indexOf(theTile.id) > -1 ){
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

				//switch turns until a Goal condition is met
				if(SomeTiles.hasOwnProperty('winner')){
					//remove event listener and put a big message
					e.target.removeEventListener("click", canvasClick, false);

					showDialog("Player " + (player.number+1) + " WINS!");

					//TODO: do voting stuff
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

			function thePlayer(){
				return SomeTiles.Players[SomeTiles.turn];
			}

			function theEnemy(){
				return SomeTiles.Players[Math.abs(SomeTiles.turn-1)];
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


			function switchTurns(){

				//hotseat local games only!
				thePlayer().isTurn = false;
				SomeTiles.turn = (Math.abs(SomeTiles.turn-1));
				thePlayer().isTurn = true;
				showDialog("Player " + (SomeTiles.turn+1) + "'s turn!");
			}

			function isTurnOf(pnum){
				return SomeTiles.Players[pnum].isTurn;
			}


			//START -- Tile Functions
				function Tile(id,x,y){
					
					//properties
					this.id = id;
					this.x = x;
					this.y = y;

					this.color;
					//this.width = pxWidth;
					//this.height= pxHeight;
					//this.stackable = stackable;
					//this.features = features;

					this.hasPiece = false;
					this.numPieces = 0;
					this.pieceInfo = [];

					//methods done in proto.
				}

				Tile.prototype.setColor = function(c){ this.color = c; }

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


			//START -- Capture Functions

			function Capture(mech,t,pType,capMove){
				this.mechanic = mech;
				this.type = t;
				this.pieceType = pType;
				
				if(typeof capMove !== undefined){
					this.specialmove = capMove;	
				}else{
					this.specialmove;
				}
				 
			}

			Capture.prototype.isPossible = function(p){
				//check the piece and the Capture info to see if a cap is possible right now
				var player = thePlayer();
				if( typeMap[this.type]() == true ){
					//a?
				}
			}


			Capture.prototype.checkPiece = function(p,targ){
				//p is the piece being controlled
				//targ is the target piece
				var player = thePlayer();

				if( player.allowedMoves.length == 0 ){
					//we can 
				}

				var mechMap = {
					collide : function(r){ return foo },
					landOnTop : function(r){ return foo },
					leapfrog : function(r){ return foo }
				},
				typeMap = {
					normal_move : function(r){
						//if()
					},
					special_move : function(r){ return foo },
					action : function(r){ return foo }
				},
				canCapture = false;


				if(mechMap[this.mechanic]){
					//if the mechanic is applicable right now
					//capture the target!
				}

			}

			function checkCaptureMechanic(p,targID,capMech){
				var mechMap = {
					collide : function(p,t){ return (_.indexOf(thePlayer().allowedMoves,t ) >= 0); },
					//landOnTop : function(p,t){ return foo },//this is redundant!
					leapfrog : function(p,t){ return thePlayer().checkLeapfrog(p,t); }
				}, res = false;

				return mechMap[capMech](p, targID);

			}


			function pieceTypeCanCapture(p,targID,capType){
				var typeMap = {
					normal_move : function(tid){ 
						return (_.indexOf(thePlayer().allowedMoves,tid ) >= 0); 
					},
					special_move : function(tid){
						//given that thePlayer().getValidMovesMV(); has run and put a valid path into 
						return ( _.indexOf(thePlayer().specialMoves, tid) >= 0 );
					},
					action : function(r){ return foo }//TODO: once actions are in
				}, res = false;

				return typeMap[capType](targID);

			}

			function isEnemyPiece(tid){
				var p = getPiece(tid);
				return (p !== undefined && (p.playerNum != thePlayer().number));
			}

			// END  -- Capture Functions


			function getGoals(){ return SomeTiles.GoalConditions; }