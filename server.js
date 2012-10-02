var nconf = require('nconf');
nconf.argv()
	.env()
	.file('config.json')
	.defaults({
		appName: 'sample-app',
		port: 80
	});

var express = require('express');
var app = express();
var path = require('path');
var request = require('request');

var engines = require('consolidate');

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'html');
	app.engine('html', engines.hogan);
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.errorHandler());
});

app.get('/', function(req, res){
	app.render('index', {
		appName: nconf.get('appName')
	}, function(err, html){
		res.send(html);
	});
});

var headers = {
	Authorization: new Buffer(':' + nconf.get('apiKey')).toString('base64'),
	json: true
};

app.get('/api/ps', function(req, res){
	var url = 'https://api.heroku.com/apps/' + nconf.get('appName') + '/ps';
	console.log('Requesting ' + url);
	var r = request({
		url: url,
		headers: headers
	});
	r.on('error', function(e){
		console.error(e);
		res.send('');
		return;
	});
	r.pipe(res);
});

app.post('/api/ps/restart', function(req, res){
	var nPasscode = nconf.get('passcode');
	var passcode = req.body.passcode;
	if (passcode != nPasscode){
		console.error('Wrong passcode: ' + passcode);
		res.send('');
		return;
	}
	var url = 'https://api.heroku.com/apps/' + nconf.get('appName') + '/ps/restart';
	console.log('POSTing ' + url);
	var r = request.post({
		url: url,
		headers: headers
	});
	r.on('error', function(e){
		console.error(e);
		res.send('');
		return;
	});
	r.pipe(res);
});

app.get('/api/logs', function(req, res){
	res.type('text/plain; charset=utf-8');
	var url = 'https://api.heroku.com/apps/' + nconf.get('appName') + '/logs?logplex=true';
	console.log('Requesting ' + url);
	request({
		url: url,
		headers: headers
	}, function(error, response, body){
		if (error){
			console.error(error);
			res.send('');
			return;
		}
		console.log('Requesting log file: ' + body);
		var r = request(body);
		var wholeChunk = '';
		r.on('data', function(chunk){
			wholeChunk += chunk;
			res.write(chunk);
			var count = (wholeChunk.match(/[\n\r]/gi) || []).length;
			console.log('Log entries count: ' + count);
			if (count >= 100){
				res.end();
			}
		});
		r.on('error', function(e){
			console.error(e);
			res.send('');
		});
		r.on('end', function(){
			res.end();
		});
	});
});

app.listen(nconf.get('app_port') || nconf.get('port'));