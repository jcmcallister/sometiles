//dbsetup for SequelizeJS & MySQL

var Sequelize = require('sequelize');

//connection setup. (we abbreviate 'connection'-> 'cx')
var sequelize = new Sequelize('sometiles', 'root', 'password', {
	host: 'localhost',
	dialect: 'mysql',

	pool: {
		max: 5,
		min: 0,
		idle: 10000
	}

});

//alernatively
//var s = Sequelize('postgres://user:pass@example.com:5432/dbname');

//Demo Model, from Sequelize Tutorial
var User = sequelize.define('user',{
	firstname: {
		type: Sequelize.STRING,
		field: 'first_name' //user facing name is firstname, DB column first_name
	},
	lastname:{
		type: Sequelize.STRING
	}
}, {
	freezeTableName: true //Model tableName will be same as Model name
});

//sync creates any missing tables, based on the above Model def'n. If force:true, tables are dropped and re-created.
User.sync({force: true}).then(function(){
	//Table created
	return User.create({
		firstname: 'John',
		lastname: 'Derp'
	});
});

