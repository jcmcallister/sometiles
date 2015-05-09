# sometiles
My senior project from Kean University

## What?
This is a JS client for my tile-based GAME of random rules and mechanics. 


## In this build...
A late-alpha Checkers demo is the default rule setting in the current build, for time-semester-crunch reasons. [Alas, no Kings & no double-jumping... yet.]
Further, a base level of netcode room-joining is in place.

Hot-seat and rough 2-player gameplay are supported now.

There may still be gameplay interaction bugs between clients using Game State objects.


##Running a server
  
 + Install with `npm i sometiles` wherever you download/extract to or pull the repo to.

 + Fire it up with `nodejs server.js` or `iojs server.js`

 + OPTIONAL: (If using a custom route, alter the `connectSocket()` function at the top of `js/net.js` to go add in your route(s).)

###Defaults
 + Port: 3000
 + Client-side JS Debug Logs: ON
 + (more to come)

##To Play

+ Just fire it up, visit your server's page in a browser, and click "New Game" on the menu.

The demo runs on Iceweasel, Chrome, and Firefox.

###2-Player mode
 + Have the host visit your server's webpage, and create a new game.
 + Direct a friend to the server's webpage, click "Join Game", and enter the host's IP address (as shown on the host's screen after the New Game is created) and click "Go!".
 + Play! 
 + //*Report bugs as Issues if you find something, please...*

##Future Work
+ Fantastic stochastic mechanics like *D20 saving throws*, **swordplay**, environmental effects (e.g. trap tiles) and more! Gotta start with gameplay basics first though!

+ More efficient Web Socketry to increase scalability.