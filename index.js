const config = require("./config")
const gdax = require('gdax');
var websocket = new gdax.WebsocketClient(['ETH-USD']);
const pc = new gdax.PublicClient('ETH-USD')

const mc = require('mongodb').MongoClient
let app = {}
// let collection = db.collection('documents')
mc.connect(config.mongoUrl, (err, db) => {
  if (err) throw(err)
  app.db = db
})

// this will put every message into the db
websocket.on('message', data => {
  col = app.db.collection('messages')
  col.insert(data, (err, r) => {
    if (err) throw(err)
  })
});
