//Mongoose + iojs

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gameSchema = new Schema({
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
});

var pieceRuleSchema = new Schema({

});

//TODO priority: refer to tiles.js in client code as a base
	//we'll cover checkers & chess in this DB for GameRuleSeeds