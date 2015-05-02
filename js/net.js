//Network Code for SomeTiles, by Jeremy McAllister (> ' . ' >)
function connectSocket(){
	if(!SomeTiles.hasOwnProperty('sock')){
		SomeTiles['sock'] = io('http://localhost/');
		logthis("socket is up");
	}
}


function requestGame(cb){
	connectSocket();
	logthis("requesting game!");
	
	var net = SomeTiles.sock;

	net.on('connect',function(){

		//net.send("hello from a client!");//same as net.emit('message', 'hello...')

		net.emit("request game", "");

		net.on("message", function(response){
			logthis("server message response: " + response);
		});

		net.on("request game",function(res){
			logthis("request game response:\t" + res.length);
			applyGame(res);

			cb();
		});
	});
	
}

//Parse Game Rules out of returned JSON from server's Random Game Generator
function applyGame(obj){
	var keys = Object.keys(obj);
	logthis(keys.length + " obj keys to make game from: " + Object.keys(obj));

	for(var i=0;i<keys.length;i++){
		SomeTiles[keys[i]] = obj[keys[i]];
	}

}

//TODO: 2 player MP
function friendJoin(){

}

function friendEvent(){

}