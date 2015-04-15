//Moves describe

function Move(pnum,dist,special){
	this.isSpecial: special || false,
	this.heading: []//an array of directions, e.g ["r","r"], or ['up']
	this.length: dist,
	this.player: pnum,
	this.piece: null, //piece will be set when a move command is issued
	this.src : null,
	this.dest: null,
	this.mustGoMax: false //by default

	SomeTiles.Players[thePlayer()].push(this);
}

Move.prototype.getFullPath = function(){

}

Move.prototype.getValidPath = function(){
	//we do hashes, thanks to dave calhoun @ http://davidbcalhoun.com/2010/is-hash-faster-than-switch-in-javascript/
	var destTileID,
	conditionMap = getMoveConditions(),
	tilePathMap = getMoveLogic(), b = getBoard(), okcount = 0, tmp = [], storage= [], tid = currTID;
	try{
		//check for every spot on the path to maxMoveLen

		for(var i = 0; i <maxMoveLen; i++){
			if(conditionMap[direction](tid,b.numTilesX, b.numTilesY)){
				//put tilePathMap value into temp storage
				okcount++;
				destTileID = tilePathMap[direction](tid,b.numTilesX,b.numTilesY);
				tmp.push( destTileID );
				tid = destTileID;
			}
		}

		if(theMove !== undefined && theMove.mustGoMax){
			//necessary because our approach is iterative
			if(okcount == maxMoveLen){
				//add the one max tid if we reached it
				storage.push( tmp.pop() );
			}
		}else{
			//add all tid to storage with no duplicates
			storage = _.union(storage, tmp );
		}

		return (storage.length == 0 ? undefined : storage);

	}catch(e){
		if(SomeTiles.debug){
			console.error("PROBLEM validatingMovePath" + e + "\ngiven args: " + _.values(arguments) );
			console.trace();
		}
	}
}

Move.prototype.setPiece = function(){

}

Move.prototype.remove = function(){

}

Move.prototype.add = function(){

}

Move.prototype.getHeading = function(){
	//context: you just moved initHeading and want to move relDir. 
	//ex: if you just moved 'r' and you want to make a 'r', on the board you'll move down (this fn returns 'd')
	if(initHeading === undefined || relDir === undefined || typeof initHeading != "string" || typeof relDir != "string"){
		if(SomeTiles.debug){ console.warn("args are wrong!"); console.trace(); }
		return;
	}
	var dirMap = {
		r: 0,
		ur: 45,
		up: 90,
		ul: 135,
		l: 180,
		dl: 225,
		d: 270,
		dr: 315
	},relDirMap = {
		r: -90,
		ur:-45,
		up:0,
		ul:45,
		l:90,
		dl:135,
		d:180,
		dr:-135
	}, res=(dirMap[initHeading] + relDirMap[relDir]);

	if(res >= 360){
		res-=360;
	}else if(res < 0){
		res+= 360;
	}
	return (_.invert(dirMap))[res];//returns 'r' if res is 0

}