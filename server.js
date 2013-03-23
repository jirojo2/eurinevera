var fs      = require('fs');
var express = require('express');
var debt    = require('./debt');
 
var app  = express();
var port = 3000;
var prices = [];
 
app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/public'));
});

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function readLines(file, func, callback) {
	var remaining = '';
	var input = fs.createReadStream(file);

	input.on('data', function(data) {
		remaining += data;
		var index = remaining.indexOf('\n');
		var last  = 0;
		while (index > -1) {
			var line = remaining.substring(last, index);
			last = index + 1;
			func(line);
			index = remaining.indexOf('\n', last);
		}

		remaining = remaining.substring(last);
	});

	input.on('end', function() {
		if (remaining.length > 0) {
			func(remaining);
		}
		if (callback)
			callback();
	});
}

function loadPrices() {
	prices = [];

	readLines('prices.txt', loadPrice, function(){
		console.log("Loaded %d items.", prices.length);
	});
}

function loadPrice(txt) {
	var params = txt.split(":");

	if (params.length == 2 && isNumber(params[1])) {
		prices.push({name: params[0], price: Number(params[1])});
	}
	else {
		console.log("Invalid price entry: %s", txt);
	}
}

function getPrices(req, res) {
	// Use cached version
	res.json(prices);
}

// API
app.get ('/debt', debt.total);
app.get ('/debt/:id', debt.getUser);
app.post('/add/debt', debt.addItem);
app.post('/remove/debt', debt.reset);
app.get ('/remove/debt/:id', debt.removeItem);
app.post('/remove/debtamt', debt.removeAmt);
app.get ('/prices', getPrices);

// TestCase
debt.initTest();

// Load price list
loadPrices();
 
// Start server
app.listen(port);
console.log('Listening on port %d...', port);