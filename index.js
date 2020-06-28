const mongoose = require('mongoose'); const jwt = require('jsonwebtoken');
const express = require('express'); var bodyParser = require('body-parser');

const app = express(); app.use(bodyParser.json());

//todo: https for express?

const disxt_test = {
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
		filter: function(product, blacklist){ //filter item properties out for non-admin users
			var _item = {}; blacklist = blacklist || ['__v']; //if (product._doc) product = product._doc;
			for (var prop in product) if (!blacklist.includes(prop)) _item[prop] = product[prop];
			return _item;
		},
		list: async function(admin){
			var output = []; var blacklist = ['__v']; if (!admin) blacklist.push('created_by');
			var list = await dt.db.product.find();
			list.forEach(function(item){
				output.push(dt.product.filter(item._doc, blacklist));
			});
			return {list: output};
		},
		create: async function(product, username){
			var _product = new dt.db.product(product); _product.created_by = username;
			var result = await _product.save();
			console.log('create product', result);
			return {success: true, product: dt.product.filter(result)};
		},
		edit: async function(product){
			var _product = await dt.db.product.findOne({_id: product._id});
			for (var i in product) _product[i] = product[i];
			var result = await _product.save();
			console.log('edit product', result);
			return {success: true, product: dt.product.filter(result)};
		},
		remove: async function(product){
			var result = await dt.db.product.deleteOne({_id: product._id}); 
			console.log('remove product', result); 
			return {success: true, product: dt.product.filter(result)};
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
				dt.db.user.findOne(req.body) //todo: validation on incoming entities?
					.then((user) => {
						var token = jwt.sign({username: user.username, role: user.role}, dt.settings.secret);
						res.json({token: token});
					})
					.catch((err) => {res.json({error: 'user not found'});});
			});
			
			app.post('/product', (req, res) => {
				if (req.headers.authorization){
					jwt.verify(req.headers.authorization, dt.settings.secret, async function(err, decoded){
						if (!err) {
							if (decoded.role === 'admin'){
								if (req.body.list) res.json(await dt.product.list(true));
								else if (req.body.create) res.json(await dt.product.create(req.body.create, decoded.username));
								else if (req.body.edit) res.json(await dt.product.edit(req.body.edit));
								else if (req.body.remove) res.json(await dt.product.remove(req.body.remove));
							}
							else {
								if (req.body.list) res.json(await dt.product.list(false));
								else return res.json({error: 'no admin authorization'});
							}
						}
						else return res.json({error: 'invalid token'});
					});
				}
				else return res.json({error: 'no token supplied'});
			});
			
			app.post('/verify', (req, res) => {
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