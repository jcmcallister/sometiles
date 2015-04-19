
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
	//this.directions;//added in certain cases

	//TODO: put DB backend to this
	if(getAllPieceTypes().indexOf(type) >= 0){
		this.type = type;
	}else{
		this.type = 'square';
		console.error(type + " not in PieceType object!\n" + SomeTiles.PieceTypes);
	}

	this.typeRules = this.getTypeRules();

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

Piece.prototype.setProp = function(prop,val){
	if(prop !== undefined){
		this[prop] = val;
	}else{ logthis("can't set Piece prop of " + prop); }
}

Piece.prototype.getLegalDirections = function(){
	//single vector moves only
	var mv = this.getMoves()[0], dirs = mv.directions.split(","), fwdirs=[];

	if( _.has(mv , "forwardOnly") && mv.forwardOnly == true){
		//uses player number to determine the direction of "forward"
		for(var i=0; i<dirs.length;i++){
			if(this.playerNum == 0 && ["ur","dr","r"].indexOf(dirs[i]) >=0 ){
				fwdirs.push(dirs[i]);
			}else{ 
				if(this.playerNum == 1 && ["ul","dl","l"].indexOf(dirs[i])>=0){
					fwdirs.push(dirs[i]);
				}
			}
		}
	}else{
		//all dirs are fair game
		//fwdirs = dirs;
	}
	return fwdirs;
}

Piece.prototype.assignDirections = function(){
	//really not for use by multi-vector pieces right now
	var legals = this.getLegalDirections().join();
	if(legals.length != this.getAllDirections().length){
		this.setProp("directions",legals);
	}
	
}

Piece.prototype.getAllDirections = function(i){
	return i === undefined ? this.getMoves()[0].directions : this.getMoves()[i].directions;
}


Piece.prototype.getSpecialMove = function(){
	return this.getTypeRules().capture.move;
}

Piece.prototype.getMoves = function(){
	return this.getTypeRules().moveVectors;
}


Piece.prototype.setMoveProp = function(prop, val, i){
	if(prop !== undefined){
		if(i === undefined){
			for(var j = 0; j<this.getTypeRules().moveVectors.length;j++){
				this.getTypeRules().moveVectors[j][prop] = val;
			}
		}else{
			this.getTypeRules().moveVectors[i][prop] = val;
		}
		
	}
}

Piece.prototype.getTypeRules = function(){
	return SomeTiles.PieceTypes.rules[this.type];
}

Piece.prototype.getCapMechanic = function(){
	return this.getTypeRules().capture.mechanic;
}

Piece.prototype.getCapType = function(){
	return this.getTypeRules().capture.type;
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