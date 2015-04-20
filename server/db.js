//dbsetup

r = require('rethinkdb');
r.connect({
	host: 'localhost',
	port: 17171
}, function(err, conn){
	if(err){ throw err; }
	r.db('test').tableCreate('tv_shows').run(conn, function(err, res){
		if(err){throw err;}
		console.log(res);
		r.table('tv_shows').insert({name: "hello world, ReQL"}).run(conn, function(err, res){
			if(err){throw err;}
			console.log(res);
		});
	});
});