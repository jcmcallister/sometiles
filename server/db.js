//Mongoose + iojs

var mongoose = require('mongoose');
//console.log("args found: " + av.length);
//mongoose.connect('mongodb://' + av[0]);
mongoose.connect('mongodb://localhost:8080/sometiles');
var Schema = mongoose.Schema;

/*var gameSchema = new Schema({
  title:  String,
  author: String,
  body:   String,
  comments: [{ body: String, date: Date }],
  date: { type: Date, default: Date.now },
  hidden: Boolean,
  meta: {
    votes: Number,
    favs:  Number
  }
});*/

var pieceRuleSchema = new Schema({
  pieceType: String,
  imgpath: String,
  piecesPerPlayer: String,
  placement_symmetric: {type: Boolean, default: true},
  placement_allSameColor: {type: Boolean, default: false}, //all pieces placed on a single tile color
  placement_standoffRows: {type: Number, default: 0}, //a standoff distance, i.e. how many rows between players at start
  placement_initPositions: { type: [Schema.Types.ObjectID], default: -1 }, //array of [x,y] coords, or -1 for random positions
  mvmt_vectors: [Schema.Types.ObjectID],
  actions_capture: [Schema.Types.ObjectID]
});

var accountSchema = new Schema({
  user: String,
  pass: String,
  recentGames: [Schema.Types.ObjectID],
  savedGames: [Schema.Types.ObjectID],
  friends: [Schema.Types.ObjectID]
});

var moveSchema = new Schema({
  usableDirections: String,
  distanceOptions: [Number],
  mustGoMax: Boolean,
  noclip: {type: Boolean, default: false},
  forwardOnly: {type: Boolean, default: false}
});

var captureSchema = new Schema({
  mechanic: String,
  type: String,
  move: ObjectID
});

var coordinateSchema = new Schema({

});



//done with schema declarations

//TODO priority: refer to tiles.js in client code as a base
	//we'll cover checkers & chess in this DB for GameRuleSeeds

var CircleRuleSet = mongoose.model('CircleRuleSet',pieceRuleSchema);

var CircleMove = mongoose.model('CircleMove',moveSchema);

var c = new CircleRuleSet({
  pieceType: "circle",
  //imgpath: null,
  piecesPerPlayer: "fill",
  placement_symmetric: false,
  placement_allSameColor: true,
  placement_standoffRows: 1,
  //startingPositions: [[0,0],[3,3], [0,7],[3,4]]//mirrored piece placement = numeric xy coords, random places on half board = -1
  placement_initPositions: [[2,2], [3,5]]
  ,mvmt_vectors:[ new 
    {
      directions: "ur,ul,dl,dr"
      ,distanceOptions: [1]
      ,mustGoMax: false
      ,noclip: false //if noclip, the Piece floats through adjacent pieces from src to dest
      ,forwardOnly: true
    }
  ],
  actions_capture: {
    mechanic: "leapfrog",
    type: "special_move",
    move: {
      directions: "ur,ul,dl,dr",
      distanceOptions: [2],
      mustGoMax: true,
      forwardOnly: true
    }
  }


});