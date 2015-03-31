//from mongoose docs @ http://mongoosejs.com/docs/index.html
//if you keep running this, our Fluffies will blot out the sun...

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017');
//for reference:
//mongoose.connect('mongodb://user:pass@localhost:port/database');


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: ') );
db.once('open',function(callback){
	//we have liftoff!
	makeNeko(mongoose);
});


function makeNeko(m){
	
	//define Schema
	var kittySchema = m.Schema({
		name: String
	});

	//add the speak function since cats can meow
	kittySchema.methods.speak = function(){
		var greeting = this.name ? "Meow name is " + this.name : "I don't have a name, nyaaa";
		console.log(greeting);
	}

	//compile into a Model
	var Kitten = m.model('Kitten',kittySchema);

	//let's make some Kittens!
	var von = new Kitten({ name: 'Von' });
	//console.log("new cat made with name: " + von.name);

	var fluffy = new Kitten({ name: 'Fluffy' });
	fluffy.speak();

	//now we save to MongoDB
	//each document can be saved to DB using the save method
	//save args: error,callback fn
		/*fluffy.save(function (err,fluffy){
			if(err) return console.error(err);

			fluffy.speak();
		});

		von.save(function (err,von){
			if(err) return console.error(err);

			von.speak();
		});*/


	//access all Kitten documents through the Model
	Kitten.find(function (err, kittens){
		if(err) return console.error(err);
		console.log("all Kittens:\t" + kittens);
	});

	//delete all Kittens
	//Kitten.find().remove().exec();	

	Kitten.find({ name: /^Vo/ }, function (err, foundCats){
		if(err) return console.error(err);
		console.log("all cats starting with Vo: \t" + foundCats);
	});


}