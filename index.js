const mongoose = require('mongoose'); const jwt = require('jsonwebtoken');
const express = require('express'); var bodyParser = require('body-parser');

const app = express(); app.use(bodyParser.json());

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
		product: mongoose.model('product', new mongoose.Schema({name: String, price: String, description: String})),
	},
	user: {
		create: async function(user){
			var user = new dt.db.user(typeof user === 'string' ? {username: user} : user);
			var result = await user.save(); console.log('new user', result); return result;
		}
	},
	product: {
		list: async function(admin){
			if (admin) return await dt.db.product.find();
		},
		create: async function(product){
			var product = new dt.db.product(product);
			var result = await product.save(); 
			console.log('new product', result); 
			return result;
		},
		edit: async function(product){
			var product = await dt.db.product.find({_id: product._id});
			var result = false;
			if (product) result = await product.save(); 
			console.log('edit product', result); 
			return result;
		},
		remove: async function(product){
			var result = await dt.db.product.deleteOne(product._id); 
			console.log('remove product', result); 
			return result;
		}
	},
	start: function(){
		mongoose.connect('mongodb://mongo:'+dt.settings.mongo_port+'/disxt_test', dt.settings.mongo).then(async function(){
		
			console.log('MongoDB connected...'); 
			
			//debug clear collections
			dt.db.user.find().deleteMany().exec(); dt.db.product.find().deleteMany().exec();
			
			//check for admin and create if nonexistent
			var admin = await dt.db.user.findOne(u => { return u && u.username === dt.settings.admin.username && u.password === dt.settings.admin.password });
			if (!admin) admin = await dt.user.create(dt.settings.admin);
			
			//REST API
			app.get('/', (req, res) => {
				require('fs').readFile('index.html', (err, data) => {
					if (err) res.send('an error occurred.'); else res.send(data.toString());
				});
			});
			
			app.post('/login', (req, res) => {
				dt.db.user.findOne(u => {return u && u.username === req.body.username && u.password === req.body.password})
					.then((user) => {
						var token = jwt.sign({username: user.username, role: user.role}, dt.settings.secret);
						res.json({success: true, token: token});
					})
					.catch((err) => {res.json({success: false});});
			});
			
			app.post('/product', (req, res) => {
				if (req.headers.authorization){
					jwt.verify(req.headers.authorization, dt.settings.secret, async function(err, decoded){
						if (!err) {console.log('decoded', decoded);
							if (decoded.role === 'admin'){
								if (req.body.list) res.json(await dt.product.list(true));
								else if (req.body.create) res.json(await dt.product.create(req.body.create));
								else if (req.body.edit) res.json(await dt.product.edit(req.body.edit));
								else if (req.body.remove) res.json(await dt.product.remove(req.body.remove));
							}
							else {
								if (req.body.list) res.json(await dt.product.list(false));
								else return res.json({success: false});
							}
						}
						else return res.send('invalid token');
					});
				}
				else return res.send('no token supplied');
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