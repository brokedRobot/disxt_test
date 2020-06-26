const mongoose = require('mongoose'); const jwt = require('jsonwebtoken'); const express = require('express'); const app = express();

const disxt_test = {
	settings: {
		secret: 'disxt_secret', port: process.env.PORT || 8000, mongo_port: 27017,
		mongo: {autoIndex: false, poolSize: 10, bufferMaxEntries: 0, useUnifiedTopology: true, useNewUrlParser: true},
	},
	login: function(req, res){
		jwt.sign({foo: 'bar'}, dt.settings.secret, {algorithm: 'RS256'}, function(err, token) {
			console.log('token', err, token);
		});
	},
	logout: function(req){
		
	},
	user: mongoose.model('user', new mongoose.Schema(
		{username: String, password: String, name: String, lastname: String, age: String, role: String}
	)),
	product: mongoose.model('product', new mongoose.Schema({name: String, price: String, description: String})),
	newUser: async function(opts){
		if (!opts) return console.error('disxt_test.newUser', 'newUser requires at least one argument: username');
		const user = new dt.user(typeof opts === 'string' ? {username: opts} : opts);
		const result = await user.save(); console.log(result); return result;
	},
	newProduct: async function(opts){
		if (!opts) return console.error('disxt_test.newProduct', 'newProduct requires at least one argument: name');
		const product = new dt.product(typeof opts === 'string' ? {name: opts} : opts);
		const result = await product.save(); console.log(result); return result;
	},
	editProduct: function(){
		
	},
	deleteProduct: function(){
		
	},
	start: function(){
		mongoose.connect('mongodb://mongo:'+dt.settings.mongo_port+'/disxt_test', dt.settings.mongo).then(async function(){
		
			console.log('MongoDB connected...');
			
			app.get('/', (req, res) => {
				require('fs').readFile('index.html', (err, data) => {
					console.log('sending...', data.toString());
					res.send(data.toString());
				});
			});
			
			app.post('/login', (req, res) => {
				return console.log('login..', req, res);
				jwt.sign({foo: 'bar'}, dt.settings.secret, {algorithm: 'RS256'}, function(err, token) {
					console.log('token', err, token);
				});
			});
			
			app.post('/logout', (req, res) => {
				return console.log('logout..', req, res);
				jwt.sign({foo: 'bar'}, dt.settings.secret, {algorithm: 'RS256'}, function(err, token) {
					console.log('token', err, token);
				});
			});
				
			app.listen(dt.settings.port, () => console.log('Application listening on...'+dt.settings.port));
			
		}).catch(err => {
			console.log('MongoDB connection attempt failed...'); setTimeout(dt.start, 5000);
		})
	}
};

const dt = disxt_test;

disxt_test.start();