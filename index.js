const mongoose = require('mongoose'); const jwt = require('jsonwebtoken');
const express = require('express'); var bodyParser = require('body-parser');

const app = express(); app.use(bodyParser.json());

//todo: https for express?

const disxt_test = {
	filter: {
		admin: {__v: 0},
		user: {__v: 0, created_by: 0}
	},
	settings: {
		admin: {username: 'admin', password: 'password', role: 'admin'}, 
		secret: 'disxt_secret', port: process.env.PORT || 8000, mongo_port: 27017,
		mongo: {autoIndex: false, poolSize: 10, bufferMaxEntries: 0, useUnifiedTopology: true, useNewUrlParser: true},
	},
	db: {
		user: mongoose.model('user', new mongoose.Schema(
			{username: String, password: String, name: String, lastname: String, age: String, role: String}
		)),
		product: mongoose.model('product', new mongoose.Schema({name: String, price: String, description: String, created_by: String})),
	},
	user: {
		create: async function(user){
			var exists = await dt.db.user.findOne(u => {return u && u.username === user.username});
			if (exists) return exists;
			else {
				var _user = new dt.db.user(typeof user === 'string' ? {username: user} : user);
				var result = await _user.save(); console.log('new user', result); return result;
			}
		}
	},
	product: {
		fetch: async function(by, admin){
			var product = await dt.db.product.findOne(by, admin ? dt.filter.admin : dt.filter.user);
			if (product) return {product: product};
			else return {error: 'not found'};
		},
		list: async function(admin){
			var list = await dt.db.product.find({}, admin ? dt.filter.admin : dt.filter.user);
			return {list: list};
		},
		create: async function(product, username){
			var newproduct = new dt.db.product(product); newproduct.created_by = username;
			var result = await newproduct.save();
			var output = Object.assign({}, result._doc);
			for (var prop in dt.filter.admin) delete output[prop];
			console.log('create product', output);
			return {product: output}; 
		},
		edit: async function(product){
			var newproduct = await dt.db.product.findOne({_id: product._id}, dt.filter.admin).catch(function(err){
				console.error('most likely a bad product _id', err); //would be nice to have these errors returning to the console...
			});
			//stop admins from changing certain fields...
			for (var prop in {created_by: true}) delete product[prop];
			for (var prop in product) newproduct[prop] = product[prop];
			var result = await newproduct.save();
			console.log('edit product', result._doc);
			return {product: result._doc};
		},
		remove: async function(product){
			var result = await dt.db.product.deleteOne({_id: product._id}).catch(function(err){
				console.error('most likely a bad product _id', err); //would be nice to have these errors returning to the console...
			});
			if (result.deletedCount){
				console.log('remove product', product); 
				return {product: product};
			}
			else return {error: 'product not found'};
		}
	},
	start: function(){
		mongoose.connect('mongodb://mongo:'+dt.settings.mongo_port+'/disxt_test', dt.settings.mongo).then(async function(){
		
			console.log('MongoDB connected...'); 
			
			//debug clear collections
			//dt.db.user.find().deleteMany().exec(); dt.db.product.find().deleteMany().exec();
			
			//check for admin/user and create if nonexistent (this should probably be synchronous in some way)
			dt.user.create(dt.settings.admin);
			dt.user.create({username: 'user1', password: 'password', role: 'user'});
			
			//REST API
			app.get('/', (req, res) => {
				require('fs').readFile('index.html', (err, data) => {
					if (err) res.send('an error occurred.'); else res.send(data.toString());
				});
			});
			
			app.post('/login', (req, res) => {
				dt.db.user.findOne({username: req.body.username}) //todo: validation on incoming entities?
					.then((user) => {
						if (user.password === req.body.password){
							res.json({token: jwt.sign({username: user.username, role: user.role}, dt.settings.secret)});
						}
						else res.json({error: 'incorrect password'});
					})
					.catch((err) => {res.json({error: 'user not found'});});
			});
			
			app.post('/product', (req, res) => { //executed by req.body of the form {list: true} or {edit: product}
				if (req.headers.authorization){
					jwt.verify(req.headers.authorization, dt.settings.secret, async function(err, decoded){
						if (!err) {
							if (decoded.role === 'admin'){ 
								//TODO: the next step I would take would here be to allow admin to
								//		make multiple transactions instead of an else-if and create a function factory
								if (req.body.fetch) res.json(await dt.product.fetch(req.body.fetch, true));
								else if (req.body.list) res.json(await dt.product.list(true));
								else if (req.body.create) res.json(await dt.product.create(req.body.create, decoded.username));
								else if (req.body.edit) res.json(await dt.product.edit(req.body.edit));
								else if (req.body.remove) res.json(await dt.product.remove(req.body.remove));
							}
							else {
								if (req.body.fetch) res.json(await dt.product.fetch(req.body.fetch, false));
								else if (req.body.list) res.json(await dt.product.list(false));
								else return res.json({error: 'no admin authorization'});
							}
						}
						else return res.json({error: 'invalid token'});
					});
				}
				else return res.json({error: 'no token supplied'});
			});
			
			app.post('/verify', (req, res) => { //for debugging jwt token
				if (req.headers.authorization){
					jwt.verify(req.headers.authorization, dt.settings.secret, async function(err, decoded){
						if (!err) res.json({verify: decoded});
						else res.json({error: 'verification error'});
					});
				}
				else res.json({error: 'no token supplied'});
			});
			
			//open http port
			app.listen(dt.settings.port, () => console.log('Application listening on...'+dt.settings.port));
			
		}).catch(err => {
			console.log('MongoDB connection attempt failed...'); setTimeout(dt.start, 5000);
		})
	}
};

const dt = disxt_test;

disxt_test.start();