const mongoose = require('mongoose'); const jwt = require('jsonwebtoken'); const express = require('express'); const app = express();

const disxt_test = {
	settings: {
		port: process.env.PORT || 8000,
		mongo: {autoIndex: false, reconnectTries: 30, reconnectInterval: 500, poolSize: 10, bufferMaxEntries: 0},
	},
	user: mongoose.model('user', new mongoose.Schema(
		{username: String, password: String, name: String, lastname: String, age: String, role: String}
	)),
	product: mongoose.model('product', new mongoose.Schema({name: String, price: String, description: String})),
	newUser: async function(opts){
		if (!opts) return console.error('disxt_test.newUser', 'newUser requires at least one argument: username');
		const user = new disxt_test.user(typeof opts === 'string' ? {username: opts} : opts);
		const result = await user.save(); console.log(result); return result;
	},
	newProduct: async function(opts){
		if (!opts) return console.error('disxt_test.newProduct', 'newProduct requires at least one argument: name');
		const product = new disxt_test.product(typeof opts === 'string' ? {name: opts} : opts);
		const result = await product.save(); console.log(result); return result;
	},
	editProduct: function(){
	
	},
	deleteProduct: function(){
	
	},
	start: function(){
		mongoose.connect("mongodb://mongo:27017/disxt_test", options).then(async function(){
		
			console.log('MongoDB connected...')
			
			app.get('/homepage', (req, res) => {
				res.send("hi world wlcom");
			});
				
			app.listen(port, () => console.log("app run succses port "+port));
			
		}).catch(err=>{
			console.log('MongoDB connection attempt failed...'); setTimeout(disxt_test.start, 5000);
		})
	}
};

disxt_test.start();

/*(function(){
	mongoose.connect("mongodb://mongo:27017/disxt_test", options).then(async function(){
		console.log('MongoDB connected...')
		else {
			const doc = await Customer.findOne();
			
		}
	}).catch(err=>{
		console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
		setTimeout(connectWithRetry, 5000)
	})
})();

app.get('/homepage', (req, res) => {
	res.send("hi world wlcom");
});
	
app.listen(port, () => console.log("app run succses port "+port));*/