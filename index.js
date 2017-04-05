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


// function runApp(db, callback) {
//   let collection = db.collection('documents')
//   for (i in [0,1,2]) {
//     let trades = []
//     pc.getProductTrades((err, data) => {
//       if (err) throw(err)
//       collection.update(data, {upsert: true}, (err, r) => {
//         if (err) throw(err)
//         console.log(r)
//       })
//     })
//     if (i == 2) console.log(trades)
//   }
//   callback()
// }


// console.log('any trades?')
// console.log(trades)
// logs trades to console
// const websocket = new gdax.WebsocketClient(['ETH-USD']);

// this will put every message into the db
websocket.on('message', data => {
  col = app.db.collection('messages')
  col.insert(data, (err, r) => {
    if (err) throw(err)
  })
});

// for actual orders
// const authedClient = new Gdax.AuthenticatedClient(
//   config.key, config.b64secret, config.passphrase, config.apiUrl
// );


// function log24HrStats(err, res, data) {
//   if(err) console.error(err)
//   if(data) console.log(data)
// }
// console.log('get products')
// publicClient.getProducts((err, res, data) => console.log(data))
// console.log('get product ticker')
// publicClient.getProduct24HrStats(
//   (err, res, data) => console.log(data),
//   {'product-id': 'ETH-USD'}
// )
// publicClient.getProductHistoricRates((err, res, data) => console.log(data))

// [1,2,3].forEach(i => {
//   let trades = []
//   publicClient.getProductTrades((err, res, data) => console.log(data))