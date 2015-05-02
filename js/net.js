//network stuff goes here
function connectSocket(){
	if(!SomeTiles.hasOwnProperty('sock')){
		net = io('http://localhost/');
		//SomeTiles['sock'] = io('http://localhost:3000/');
		logthis("socket is up");
	}
}


//TODO: add AJAX functions to server, once server is set up
function requestGame(cb){
	
	connectSocket();
	logthis("requesting game!");
	//do AJAX stuff here to req the game: OPTION = use ExpressJS to pipe this over?
	net.on('connect',function(){

		net.send("hello from a client!");//this is just like saying net.emit('message', 'foo')

		net.emit("request game", "foo");

		net.on("message", function(response){
			logthis("server message response: " + response);
		});

		net.on("request game",function(res){
			logthis("request game response:\t" + res);
		});
	});
	
	cb();
}

//TODO: parse Game Rules from JSON from server's Random Game Generator
function applyGame(){

}

//TODO: add UI for loading screen
function showLoading(){

}

//TODO: add UI for main menu / nav
function showMenu(){}