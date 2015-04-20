//dbsetup for rethinkDB

r = require('rethinkdb');

var cx = null;

r.connect({
	host: 'localhost',
	port: 28015
}, function(err, conn){
	if(err){ throw err; }
	cx = conn;
	

	r.db('test').tableCreate('tv_shows').run(conn, function(err, res){
		if(err){throw err;}
		console.log(res);
		r.table('tv_shows').insert({name: "hello world, ReQL"}).run(conn, function(err, res){
			if(err){throw err;}
			console.log(res);
		});
	});

	
});