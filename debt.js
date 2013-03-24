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

	// Check if user exists... else create it
	db.query('SELECT * FROM users WHERE name = ?', [id], function(err, rows, fields) {
		if (rows.length == 0) {
			db.query("INSERT INTO users (name, debt) VALUES (?, '0')", [id]);
		}
	});

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

		// Recalculate debt total for user
		recalculate(user);

		res.json({});
	});

}

exports.reset = function(req, res) {	
	
	db.query('DELETE FROM debt', function(err, rows, fields) {
		if (err) throw err;

		// Recalculate debt total for all users (0)
		db.query("UPDATE user SET debt = '0'");

		res.json({});
	});
}

exports.removeItem = function(req, res) {
	
	var user = req.body.user;
	var id = req.params.id;
	db.query('DELETE FROM debt WHERE id = ?', [id], function(err, rows, fields) {
		if (err) throw err;

		// Recalculate debt total for user
		recalculate(user);

		res.json({});
	});
}

exports.removeAmt = function(req, res) {

	// remove the little ones first, then modify the next one with the difference
	var user = req.body.user;
	var rem = req.body.amt;
	db.query('SELECT * FROM debt WHERE user = ? ORDER BY amt', [user], function(err, rows, fields) {
		if (err) throw err;

		rows.forEach(function (i) {
			if (rem > 0) {
				if (i.amt > rem)
				{
					// edit this entry
					var date = new Date().getTime();
					db.query("UPDATE debt SET amt = ? WHERE id = ?", [i.amt-rem, i.id]);
					rem = 0;
					return;
				}

				db.query("DELETE FROM debt WHERE id = ?", [i.id]);
				rem -= i.amt;
			}
		});

		// Recalculate debt total for user
		recalculate(user);
	});

	res.json({});
}

exports.getUsers = function(req, res) {

	var list = [];

	db.query('SELECT * FROM users ORDER BY debt DESC', function(err, rows, fields) {
		if (err) throw err;

		rows.forEach(function(i) {
			list.push({id: i.id, debt: Number(i.debt), name: i.name});
		});

		res.json(list);
	});
}

function recalculate(user) {
	var total = 0;
	db.query('SELECT * FROM debt WHERE user = ?', [user], function(err, rows, fields) {
		rows.forEach(function(i){
			total += Number(i.amt);
		});

		db.query('UPDATE users SET debt = ? WHERE name = ?', [total, user]);
	});
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