const express = require('express');
const cors = require('cors');
require('dotenv').config();
const admin = require("firebase-admin");
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.send({
        message: "api for volunteer network"
    })
})

// Generate Private Key
const serviceAccount = require("./config/serviceAccountKey.json");
const { reset } = require('nodemon');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://volunteer-net-online.firebaseio.com"
});

/*Database Connection Setup */

const uri = `mongodb+srv://volunteer-network:${process.env.DB_PASSWORD}@volunteer-network.hkwtl.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const volunteerWorkCollection = client.db(`${process.env.DB_NAME}`).collection("volunteer-works");
    const registerCollection = client.db(`${process.env.DB_NAME}`).collection("register-works");

  /***************** Validated User Information **********************/
    app.get('/check-is-signUp', (req, res) => {
        const bearer = req.headers.authorization;

        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            admin.auth().verifyIdToken(idToken)
                .then(decodedToken => {
                    res.send(decodedToken);
                }).catch(error => {
                    res.status(401).send("unauthorized access 401");
                });
        }

    })
    app.get('/register-workshop', (req, res) => {
        const bearer = req.headers.authorization;

        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            admin.auth().verifyIdToken(idToken)
                .then(decodedToken => {
                    let tokenEmail = decodedToken.email;

                    if (tokenEmail == req.query.email) {
                        registerCollection.find({ email: req.query.email })
                            .toArray((err, documents) => {
                                res.send(documents)
                            })
                    } else {
                        res.status(401).send("unauthorized access 401");
                    }
                }).catch(error => {
                    res.status(401).send("unauthorized access 401");
                });
        } else {
            res.status(401).send("unauthorized access 401");
        }
    })

    /********** Get All Data from Data Source **********/

    app.get('/workData', (req, res) => {
        volunteerWorkCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })


    /*********** Single Item Data **************** */
    app.get('/volunteer-organization/:id', (req, res) => {
        volunteerWorkCollection.findOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                res.send(result)
            })
    })

    app.delete('/volunteer-organization-delete/:id', (req, res) => {
        registerCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                if (result.deletedCount > 0) {
                    res.send({ deleted: true })
                }
            })
    })

    /*************** insert organization **************/

    app.post('/register-works', (req, res) => {
        const data = req.body;
        registerCollection.insertOne(data)
            .then((result) => {
                res.send(result);
            })
            .catch(err => {
                console.log(err)
            })
    })



    /*********** Route for Admin *************/

    app.get('/all-register-data', (req, res) => {
        registerCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })


    console.log("Database Connected");

});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
})


