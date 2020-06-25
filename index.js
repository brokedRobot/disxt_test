const mongoose = require('mongoose');
const express = require('express');
const app = express();

const port = process.env.PORT || 8000;
const db_link = "mongodb://localhost:27018/db";
const db_link2 = "mongodb://localhost:27018/db";

if (0) mongoose.connect(db_link, (err) => {
	if (err){
		console.error('error conn', err);
		if (0) mongoose.connect(db_link2, (err) => {
			if (err){
				console.error('error conn2', err);
			}
			else console.log('conn success2');
		});
	}
	else console.log('conn success');
});

const options = {
    autoIndex: false, // Don't build indexes
    reconnectTries: 30, // Retry up to 30 times
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0
}

const customerSchema = new mongoose.Schema({name: String, address: String, email:String});

const Customer = mongoose.model('Customer', customerSchema);

async function createNewCustomer() {
	const customer = new Customer({
		name: 'new customer', 
		address: 'new address',
		email: 'customer1@new.com'
	});
	const result = await customer.save(); console.log(result);
}

const connectWithRetry = () => {
//async function connectWithRetry() {
	console.log('MongoDB connection with retry')
	mongoose.connect("mongodb://mongo:27017/test", options).then(async function(){
		console.log('MongoDB is connected')
		
		if (0) createNewCustomer();
		else {
			const doc = await Customer.findOne();
			console.log('doc', doc);
		}

		
	}).catch(err=>{
		console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
		setTimeout(connectWithRetry, 5000)
	})
}

connectWithRetry()

app.get('/homepage', (req, res) => {
	res.send("hi world wlcom");
});
	
app.listen(port, () => console.log("app run succses port "+port));