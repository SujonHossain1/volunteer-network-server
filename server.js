const express = require('express');
const cors = require('cors');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.get('/', (req, res) =>{
    res.send({
        message: "api for volunteer network"
    })
})

/*Database Connetion */

const uri = `mongodb+srv://volunteer-network:${process.env.DB_PASSWORD}@volunteer-network.hkwtl.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true,  useUnifiedTopology: true });
client.connect(err => {
  const volunteerWorkCollection = client.db(`${process.env.DB_NAME}`).collection("volunteer-works");
  console.log("Database Connected");
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
})


