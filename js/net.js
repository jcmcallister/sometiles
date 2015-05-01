//network stuff goes here
function connectSocket(){
	if(!SomeTiles.hasOwnProperty('rgg')){
		SomeTiles['rgg'] = io.connect('http://localhost:3000/rgg');
		logthis("rgg socket is up");
	}

	if(!SomeTiles.hasOwnProperty('account')){
		SomeTiles['account'] = io.connect('http://localhost:3000/acct');
		logthis("account socket is up");
	}	
}


//TODO: add AJAX functions to server, once server is set up
function requestGame(cb){
	
	connectSocket();
	logthis("requesting game!");
	//do AJAX stuff here to req the game: OPTION = use ExpressJS to pipe this over?
	var s = SomeTiles.rgg;
	s.on('connect',function(){
		s.emit("request game", function(response){
			logthis("request game response: " + response);
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