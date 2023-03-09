const express = require("express");
const app = express();
const PORT = 9000;
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

let db,
	dbConnectionStr = process.env.DB_STRING,
	dbName = "dev";
// talk to mongo DB
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true }).then(
	client => {
		console.log(`Connected to ${dbName} Database`);
		db = client.db(dbName);
	}
);
app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});
app.get("/unkown", (req, res) => {
	res.json({ error: true });
});

app.get("/api/services/all", (req, res) => {
	db.collection("service-buds-services")
		.find()
		.toArray()
		.then(data => {
			res.json(data);
		})
		.catch(error => {
			res.json(error);
		});
});

app.get("/api/services/:hall", (req, res) => {
	const hall = req.params.hall;
	db.collection("service-buds-services")
		.find({ hall: hall })
		.toArray()
		.then(data => {
			res.json(data);
		})
		.catch(res.json({ status: 404, message: "No matching hall found" }));
});

app.post("/api/services/new", (req, res) => {
	if (
		!req.body.id ||
		!req.body.firstName ||
		!req.body.lastName ||
		!req.body.date ||
		!req.body.service ||
		!req.body.hall ||
		!req.body.phone ||
		!req.body.room ||
		!req.body.email
	) {
		res.json({ status: 500, message: "Please all fields are required" });
	} else {
		db.collection("service-buds-services")
			.insertOne({
				id: req.body.id,
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				email: req.body.email,
				room: req.body.room,
				service: req.body.service,
				hall: req.body.hall,
				phone: req.body.phone,
				date: req.body.date,
			})
			.then(result => {
				console.log("Service Added");
			})
			.catch(error => console.error(error));
		res.json({ status: 200, message: "New service added", response: req.body });
	}
});

app.listen(process.env.PORT || PORT, () => {
	console.log(`Serever is running on port ${PORT}, Better go catch it`);
});
