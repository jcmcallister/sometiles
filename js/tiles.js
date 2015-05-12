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
				var oldText = "<p class=\"faded\">" + $("#dialog:visible").text() + "</p>";
				var btn = '<br><button onclick="hideDialog();">OK!</button>';
				$("#dialog").html(msg+oldText+btn).removeClass("hidden");
			}

			function hideDialog(){
				$("#dialog").addClass("hidden");
			}

			function getRandomTagline(){
				var coolstuff = ["A Game of Random Proportions", "Stochastic & Fantastic", "Prepare for Random Fandom", "Incidentally Incredible", "Fortuitously Fun!", "Made for Adventitious Gamers", "Chance of Fun : Hit-or-miss", "Slapdash Haberdashery!", "Tiled Tomfoolery", "Shenanigus Maximus", "Just the Funny Business"];
				$("#randomtag").text( coolstuff[Math.floor(Math.random() * (coolstuff.length)) ] );

			}

			


			//the active game state object in this client
			var SomeTiles = { 
				Boards: []
				,Players: []
				,debug: true
				,PieceTypes: null//define movement, actions, shape, etc for this piece type
				,c: {
					board: "board",//canvas element IDs for each layer
					pieces: "pieces",
					moves: "moves"
				}
				,boardColors: null
				,turn : null
				,GoalConditions: null
				,animSpeed: 250
				,mode: "hotseat"
				,myPlayerIndex: null
				,moveHistory: {}
			};

			//our MAIN()
			function onceLoaded(){

				//TODO: basic UI

				//on new game selection,
					//makeGame();
				

			}

			function controlsOn(){
				//must be canvas with highest z-index on page
				var topLayerCanvas = getTopLayerCanvas();
					
				var canvas = topLayerCanvas || document.getElementsByTagName("canvas")[0];
				canvas.addEventListener("click", canvasClick, false);
			}

			function controlsOff(){
				//must be canvas with highest z-index on page
				var topLayerCanvas = getTopLayerCanvas();
					
				var canvas = topLayerCanvas || document.getElementsByTagName("canvas")[0];
				canvas.removeEventListener("click", canvasClick, false);	
			}

			function showModalMessage(msg,location,styleclass){
				$('<div id="modal"></div>').addClass(styleclass).text(msg).insertAfter(location);
			}

			function hideModalMessage(){
				$("#modal").remove();
			}

			function showMenu(){
				$("#messaging").addClass("hidden");
				$("#gameplay").fadeOut(SomeTiles.animSpeed,function(){ 
					$("#ui").slideDown(SomeTiles.animSpeed, function(){});
				});
			}

			function resumeGame(){
				$("#ui").slideUp(SomeTiles.animSpeed, function(){
					//show the game!
					$("#messaging").removeClass("hidden");
					$("#gameplay").fadeIn(SomeTiles.animSpeed,function(){  });
				});
			}

			function resetMenu(){
				$("#messaging").text("");
				$("#newgame").text("New Game");
				$("#joingame").text("Join Game");
			}

			//on page load
			$(function(){

				var gameInProgress = false;
				var joinIP_OK = false;
				var joinIP = null;
				getRandomTagline();

				//attach menu click handlers
				$("#newgame").on("click", function(){
					var ng = $(this);

					if(!gameInProgress){
						//no game running, make one!
						$("#ui").slideUp(SomeTiles.animSpeed, function(){

							//show loading
							showModalMessage("Loading...","#gameplay","halfdown");

							//get net game rules
							requestGame(function(){
								//game rules received & parsed into SomeTiles master object
								makeGame();
								
								hideModalMessage();
								//show the game!
								$("#messaging").removeClass("hidden");
								$("#gameplay").fadeIn(SomeTiles.animSpeed,function(){
									gameInProgress=true; 
									ng.text('Resume Game');
									mp_getIP(function(ip){
										showDialog("Hi! Before you start...<br>One Friend can join game NOW with this IP address:<br>" + ip + "<br>");
									});
									
								});
							});

						});
					}else{
						resumeGame();
					}
				});

				$("#joingame").on("click", function(){

					$("#joinform").slideDown(SomeTiles.animSpeed, function(){  });
				});

				$("#myaccount").on("click", function(){

				});

				$("#recentgames").on("click", function(){

				});

				$("#joinform button").on("click",function(){
					var me = $(this);
					if(me.hasClass("go")){
						//run socket hit
						if(!joinIP_OK){
							hideModalMessage();
							showModalMessage("Fix the IP address and try again.","#joinform","error");
							return;
						}

						logthis("calling socket connect and joining room " + joinIP);
						hideModalMessage();
						showModalMessage("Joining Game at " + joinIP + "...","#joinform");
						
						mp_requestJoinGame(joinIP, function(){
							//game rules received & parsed into SomeTiles master object

							$("#ui").slideUp(SomeTiles.animSpeed, function(){
								hideModalMessage();
								showModalMessage("Loading...","#gameplay","halfdown");
								makeGame();
								$("#messaging").removeClass("hidden");
								$("#gameplay").fadeIn(SomeTiles.animSpeed,function(){
									gameInProgress=true; 
									me.text('Resume Game');
								});
							});
						});
						
					}else if(me.hasClass("x")){
						//close joinform
						hideModalMessage();
						$("#joinform").slideUp(SomeTiles.animSpeed, function(){  });
					}
				});

				$("#joinform").submit(function(){
					$("#joinform button.go").trigger("click");
					return false;
				});

				$("#joinid").on("keyup", function(){
					var me = $(this);

					//ipv4: Big Thanks to Pyrocat101 @ https://gist.github.com/pyrocat101/7568655
					//IPv6: jteeuwen @ http://regexlib.com/REDetails.aspx?regexp_id=2690
					var ipv4_check =  /^(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})){3}$/,
						//ipv6_check = /^([0-9a-f]){1,4}(:([0-9a-f]){1,4}){7}$/i,
						ipv6_check = /(::|(([a-fA-F0-9]{1,4}):){7}(([a-fA-F0-9]{1,4}))|(:(:([a-fA-F0-9]{1,4})){1,6})|((([a-fA-F0-9]{1,4}):){1,6}:)|((([a-fA-F0-9]{1,4}):)(:([a-fA-F0-9]{1,4})){1,6})|((([a-fA-F0-9]{1,4}):){2}(:([a-fA-F0-9]{1,4})){1,5})|((([a-fA-F0-9]{1,4}):){3}(:([a-fA-F0-9]{1,4})){1,4})|((([a-fA-F0-9]{1,4}):){4}(:([a-fA-F0-9]{1,4})){1,3})|((([a-fA-F0-9]{1,4}):){5}(:([a-fA-F0-9]{1,4})){1,2}))/,
						specialCases = ["::1"];

					if(ipv4_check.test(me.val()) || ipv6_check.test( me.val()) || _.indexOf(specialCases, me.val()) >= 0 ){
						me.css("color","#0b0");
						joinIP_OK = true;
						joinIP = me.val();
					}else{
						me.css("color","#b00");
						joinIP_OK = false;
					}
				});

				$(document).on('keydown',function(event){
					if(event.which == 27 && gameInProgress){
						if($("#dialog:visible").length > 0){
							hideDialog();
						}else if(thePlayer().selectedPiece !== undefined){
							thePlayer().deselectPiece(thePlayer().selectedPiece);
						}else{
							showMenu();
						}
					}
					if(event.which == 13 && gameInProgress){
						if($("#dialog:visible").length > 0)
							hideDialog();
					}
					if(event.which == 32 && gameInProgress){
						if($("#dialog:visible").length > 0)
							hideDialog();
					}
					//logthis("key " + event.which  + " pressed!");
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
				myboard.populate();


				//which Player goes first?
				if(SomeTiles.mode == "hotseat"){
					setFirstTurn(Math.round(Math.random()));
				}else{
					setFirstTurn(SomeTiles.turn);
				}
				

				//draw ALL pieces
					//p1.drawPieces();

				//add Mouse listeners
				controlsOn();
					

				//switchTurn() call inside of movePiece(), should be in any action function that consumes or finishes a turn  
				
			}

			function setFirstTurn(i){
				//input: i must be 0 or 1, no excuses!

				//TODO priority BUGFIX: sometimes SomeTiles.turn and SomeTiles.myPlayerIndex are the same, but I can't move!!!
				SomeTiles.turn = i;

				if(SomeTiles.mode == "hotseat"){
					showDialog('<span id="player' + (SomeTiles.turn+1) +'">Player ' + (SomeTiles.turn+1) + "</span> goes first! Check the border to see whose turn it is!");
				}

				indicateTurn();

			}

			function showTextColors(){
				$("#player1").css("color",SomeTiles.Players[0].PieceColor);
				$("#player2").css("color",SomeTiles.Players[1].PieceColor);
			}

			function indicateTurn(){
				//switch the border color
				$("#" + SomeTiles.c.pieces).parent().css("border-color", SomeTiles.Players[SomeTiles.turn].PieceColor);
				showTextColors();
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

			/* Huge thanks to Ryan Artecona for this, from http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element */
			function relMouseCoords(event){
			    var totalOffsetX = 0;
			    var totalOffsetY = 0;
			    var canvasX = 0;
			    var canvasY = 0;
			    var currentElement = this;

			    do{
			        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
			        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
			    }
			    while(currentElement = currentElement.offsetParent)

			    canvasX = event.pageX - totalOffsetX;
			    canvasY = event.pageY - totalOffsetY;

			    return {x:canvasX, y:canvasY}
			}
			HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;
			// END -- Arcetona's function

			//start-- some other func
			function getPosition(canvas, event){
			  var rx = event.x;
			  var ry = event.y;

			  var canvas = document.getElementById("canvas");

			  rx -= canvas.offsetLeft;
			  ry -= canvas.offsetTop;

			  console.log("x:" + rx + " y:" + ry);
			  return {x:rx, y:ry};
			} 
			//end -- other func


			function canvasClick(e){

				//get cursor position
				var x, y, thePiece, b=getBoard(), usingOffset = false;
				//var coords = relMouseCoords(this, e);

				if(e.offsetX != undefined && e.offsetY != undefined){
					//good for Chrome, IE9+
					x = e.offsetX;
					y = e.offsetY;
					usingOffset = true;
				}else if(e.layerX != undefined && e.layerY != undefined){
					//good in Firefox
					x = e.layerX;
					y = e.layerY;
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
								player.movePiece(player.selectedPiece,theTile, function(){
									mp_updateGameState();
								});
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

					resetMenu();
					//TODO: do voting stuff
				}

				logthis(movestr);
				
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


			function findPiece(propName, propValue){
				//select ONE Piece from all Players with Tile UUID tid
				//used for pieces that may have moved in netcode
				var players = SomeTiles.Players, p;
				for(var pidx =0; pidx < players.length; pidx++){
					for(var i = 0; i< players[pidx].Pieces.length;i++){
						p = players[pidx].Pieces[i];
						if(p.hasOwnProperty(propName) && p[propName] == propValue){
							return p;
						}
					}
				}
				return;
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


			function switchTurns(cb){

				
				//hotseat local games only!
				SomeTiles.turn = (Math.abs(SomeTiles.turn-1));
				//showDialog("Player " + (SomeTiles.turn+1) + "'s turn!");

				if(SomeTiles.mode == "mp"){
					controlsOff();//switched back on upon enemy move @ net.js :: mp_updateGameState()
					cb();
				}

				indicateTurn();

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