// https://github.com/felixge/node-mysql

// DATABASE STRUCTURE
//
// users
// - id
// - name
// - debt ??
//
// debt
// - id
// - user
// - amt
// - name
//

// DataBase

var mysql = require('mysql');

var db = mysql.createConnection({
	host     : 'localhost',
	user     : 'eurielec',
	password : 'rsNpwHGprub5ww8W',
	database : 'eurinevera'
});

db.connect();

// Methods

exports.total = function(req, res) {

	var total = 0;

	db.query('SELECT amt FROM debt', function(err, rows, fields) {
		if (err) throw err;

		rows.forEach(function(i) {
			total += Number(i.amt);
		});

		res.json(total);
	});
}

exports.getUser = function(req, res) {

	var id = req.params.id;
	var user = {};

	user.name = id;
	user.debtTotal = 0;
	user.debtItems = [];

	db.query('SELECT * FROM debt WHERE user = ?', [id], function(err, rows, fields) {
		if (err) throw err;

		rows.forEach(function(i) {
			user.debtTotal += Number(i.amt);
			user.debtItems.push({id: i.id, name: i.name, amt: Number(i.amt), date: i.date});
		});

		res.json(user);
	});
}

exports.addItem = function(req, res) {

	// TODO
	var user = req.body.user;
	var name = req.body.name;
	var amt  = req.body.amt;

	db.query("INSERT INTO debt (user, amt, name, date) VALUES ('"+user+"', '"+amt+"', '"+name+"', '"+new Date()+"')", function(err, rows, fields) {
		if (err) throw err;

		res.json({});
	});

}

exports.reset = function(req, res) {	
	
	db.query('DELETE FROM debt', function(err, rows, fields) {
		if (err) throw err;

		res.json({});
	});
}

exports.removeItem = function(req, res) {
	
	var id = req.params.id;
	db.query('DELETE FROM debt WHERE id = ?', [id], function(err, rows, fields) {
		if (err) throw err;

		res.json({});
	});
}

exports.removeAmt = function(req, res) {

	// TODO
}

// TEST UNIT

exports.initTest = function() {

	db.query('SELECT * FROM debt', function(err, rows, fields) {
		if (err) throw err;

		if (rows.length == 0) {
			db.query("INSERT INTO debt (user, amt, name, date) VALUES ('test', '1.50', 'Item #1', '"+new Date()+"')");
			db.query("INSERT INTO debt (user, amt, name, date) VALUES ('test', '3.50', 'Item #2', '"+new Date()+"')");
			db.query("INSERT INTO debt (user, amt, name, date) VALUES ('test', '1',    'Item #3', '"+new Date()+"')");
			db.query("INSERT INTO debt (user, amt, name, date) VALUES ('test', '0.50', 'Item #4', '"+new Date()+"')");

			for (var i = 5; i < 70; i++)
				db.query("INSERT INTO debt (user, amt, name, date) VALUES ('test', '0.15', 'Item #"+i+"', '"+new Date()+"')");
		}
	});

}