const mongoose = require('mongoose'); const jwt = require('jsonwebtoken');
const express = require('express'); var bodyParser = require('body-parser');

const app = express(); app.use(bodyParser.json());

const disxt_test = {
	settings: {
		admin: {username: 'admin', password: 'password'}, secret: 'disxt_secret', port: process.env.PORT || 8000, mongo_port: 27017,
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
	createUser: async function(opts){
		if (!opts) return console.error('disxt_test.newUser', 'newUser requires at least one argument: username');
		const user = new dt.user(typeof opts === 'string' ? {username: opts} : opts);
		const result = await user.save(); console.log('new user', result); return result;
	},
	createProduct: async function(opts){
		if (!opts) return console.error('disxt_test.newProduct', 'newProduct requires at least one argument: name');
		const product = new dt.product(typeof opts === 'string' ? {name: opts} : opts);
		const result = await product.save(); console.log('new product', result); return result;
	},
	editProduct: function(){
		
	},
	removeProduct: function(){
		
	},
	start: function(){
		mongoose.connect('mongodb://mongo:'+dt.settings.mongo_port+'/disxt_test', dt.settings.mongo).then(async function(){
		
			console.log('MongoDB connected...');
			
			//check for admin and create if nonexistent
			var admin = await dt.user.findOne(u => { return u && u.username === dt.admin.username && u.password === dt.admin.password });
			//if (admin) admin = admin.hasNext() ? admin.next() : false;
			console.log('admin?', admin);
			if (!admin) admin = await dt.createUser(dt.settings.admin);
			console.log('admin??', admin);
			
			app.get('/', (req, res) => {
				require('fs').readFile('index.html', (err, data) => {
					res.send(data.toString());
				});
			});
			
			app.post('/login', (req, res) => {

				const user = dt.user.find(u => {return u && u.username === req.body.username && u.password === req.body.password});

				if (user) {
					
					const token = jwt.sign({username: user.username, role: user.role}, dt.settings.secret);
					res.json(token);
				
				} else {
					res.send('Username or password incorrect');
				}
				
			});
			
			app.post('/logout', (req, res) => {
				return console.log('logout..', req, res);
				jwt.sign({foo: 'bar'}, dt.settings.secret, {algorithm: 'RS256'}, function(err, token) {
					console.log('token', err, token);
				});
			});
			
			app.post('/product', (req, res) => {

				if (req.body.token){
					jwt.verify
				}
				else {
					res.send('no authorization');
				}
				
				if (token){
					jwt.verify(token, dt.settings.secret, (err, decoded) => {
					  if (err){
						return res.json({
						  success: false,
						  message: 'Token is not valid'
						});
					  }
					  else {
						req.decoded = decoded;
						next();
					  }
					});
				}
				else {
					return res.json({
					  success: false,
					  message: 'Auth token is not supplied'
					});
				}
				
			});
				
			app.listen(dt.settings.port, () => console.log('Application listening on...'+dt.settings.port));
			
		}).catch(err => {
			console.log('MongoDB connection attempt failed...'); setTimeout(dt.start, 5000);
		})
	}
};

const dt = disxt_test;

disxt_test.start();