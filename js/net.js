//network stuff goes here

//TODO: add AJAX functions to server, once server is set up
function requestGame(cb){
	//do stuff here
	console.log("requesting game!");
	setTimeout( function(){
		cb();
	},2000 );
}

//TODO: run demo to get Game Rules in JSON from server's Random Game Generator
function applyGame(){

}

//TODO: add UI for loading screen
function showLoading(){

}

//TODO: add UI for main menu / nav
function showMenu(){}