
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

		
			//START -- Move Functions

				function getMoveConditions(){
					return {
						r: function(tid, w, h){ return (tid <= ((w*h)-w)-1); },
						ur: function(tid, w, h){ return (tid <= ((w*h)-w)-1 && (tid % h) > 0); },
						up: function(tid, w, h){ return (tid % h > 0); },
						ul: function(tid, w, h){ return (tid >= h && tid % h > 0); },
						l: function(tid, w, h){ return (tid >= h); },
						dl: function(tid, w, h){ return (tid >= h && (tid % h) != (h-1)); },
						d: function(tid, w, h){ return (tid % h) != (h-1); },
						dr: function(tid, w, h){ return (tid <= ((w*h)-w)-1 && (tid % h) != (h-1)); }
					};
				}

				function getMoveLogic(){
					return {
							r: function(tid,w,h){ return tid+h; },
							ur: function(tid,w,h){ return tid + h-1; },
							up: function(tid,w,h){ return tid - 1; },
							ul: function(tid,w,h){ return (tid - h) - 1; },
							l: function(tid,w,h){ return (tid - h);},
							dl: function(tid,w,h){ return (tid - h) + 1;},
							d: function(tid,w,h){ return tid + 1;},
							dr: function(tid,w,h){ return tid + h + 1;}
						};
				}

				function drawMove(tileID, x,y){
					if(tileID === undefined && SomeTiles.debug){ console.warn("Tile ID needed for drawMove!"); console.trace(); return; }
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
					cleanCanvas(SomeTiles.c.moves);

					//then empty our sets of stored valid moves
					var pl = thePlayer();
					pl.allowedMoves = [];
					pl.captureMoves = {};
					
					if(pl.hasOwnProperty("specialMoves")){
						pl.specialMoves = [];
					}
				}

				function cleanCanvas(canvasID){
					var canvas = document.getElementById(canvasID);
					if(canvas && canvas.getContext){
						var ctx = canvas.getContext("2d");
						// Store the current transformation matrix
						ctx.save();

						// Use the identity matrix while clearing the canvas
						ctx.setTransform(1, 0, 0, 1, 0, 0);
						ctx.clearRect(0, 0, canvas.width, canvas.height);

						// Restore the transform
						ctx.restore();

					}else{
						if(SomeTiles.debug){ console.warn("cleanCanvas: element ID " + canvasID + "not found!"); }
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