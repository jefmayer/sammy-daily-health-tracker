const bodyParser = require('body-parser');
const co = require('co');
const env = require('dotenv');
const express = require('express');
const mongo = require('mongodb');
const path = require('path');

env.config();

const PORT = process.env.PORT || 5005;
const host = '0.0.0.0';
const uri = process.env.MONGODB_URI;
const name = process.env.MONGODB_DB;
const { MongoClient } = mongo;
  
const find = (client, collectionName) => (
  co(function * () {
    const db = client.db(name);
    const collection = db.collection(collectionName);
    const docs = yield collection.find({}).toArray();
    return docs;
  })
);

let dbClient = null;
const getDbClient = () => {
  if (dbClient) {
    return dbClient;
  }
  console.log('sammy-tracker: -----> create new db connection.');
  dbClient = MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return dbClient;
};

const server = express();

server.use(express.static(path.join(__dirname, 'public')));
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'ejs');
server.get('/', (req, res) => res.render('pages/index'));
server.get('/getRecords', function(req, res) {
  co(function * () {
    const client = yield getDbClient();
    const docs = yield find(client, 'daily');
    res.end(JSON.stringify(docs));
  }).catch(err => console.log(err))
});
server.post('/addRecord', function(req, res) {		
  co(function * () {
    const { body } = req;
    const {
      activity,
      appetite,
      date,
      mobility,
      notes,
      pain,
      stress,
    } = body;
    const doc = {
      ...(activity && { activity }),
      ...(appetite && { appetite }),
      ...(date && { date }),
      ...(mobility && { mobility }),
      ...(notes && { notes }),
      ...(pain && { pain }),
      ...(stress && { stress }),
    };
    const client = yield getDbClient();
    const db = client.db(name);
    db.collection('daily').updateOne(
      { date },
      { $set: doc },
      { upsert: true },
      () => {
        res.end(JSON.stringify({success: "success"}));
      },
    )
  }).catch(err => console.log(err));
});
server.post('/login', function(req, res) {
  co(function * () {
    const { body } = req;
    const { password, username } = body;
    const client = yield getDbClient();
    const docs = yield find(client, 'users');
    const item = docs.find((doc) => doc.username === username && doc.password === password);
    if (item) {
      res.end(JSON.stringify([{"success": "success"}]));
      return;
    }
    res.end(JSON.stringify([{"success": "error"}]));
  }).catch(err => console.log(err));
});
server.listen(PORT, host, (err) => {
  if (err) throw err;
  console.log(`sammy-tracker: -----> ready on http://${host}:${PORT}`);
});