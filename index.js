const config = require("./config")

const express = require('express')
const gdax = require('gdax')
const orderbookSync = new gdax.OrderbookSync(['ETH-USD'])

const app = express()

// const ws = new gdax.WebsocketClient(['ETH-USD']);
// const pc = new gdax.PublicClient('ETH-USD')
// const mc = require('mongodb').MongoClient

// const Bullish = require('technicalindicators').Bullish
// const Bearish = require('technicalindicators').Bearish

function sellSide(data) {
  return data['side'] == 'sell'
}

function buySide(data) {
  return data['side'] == 'buy'
}

function getOrders(limit=100) {
  const book = orderbookSync.book.state()
  const asks = book.asks.slice(0, limit - 1)
  const bids = book.bids.slice(0, limit - 1)
  return asks.concat(bids)
}
// mongo connection
// let collection = db.collection('documents')
// mc.connect(config.mongoUrl, (err, db) => {
//   if (err) throw(err)
//   app.db = db
// })

// this will put every message into the db
// pc.getProductOrderBook((err, r, data) => {
//   console.log(data)
// })

// synced order book
// const orderbookSync = new gdax.OrderbookSync()
// setInterval(() => console.log(orderbookSync.book.state()), 1000)

// ws.on('message', data => {
//   console.log(data)
  // col = app.db.collection('messages')
  // col.insert(data, (err, r) => {
  //   if (err) throw(err)

// Node config
app.set('view engine', 'pug')
app.use(express.static('public'))

// Routing
app.get('/', (req, res) => {
  res.render('trade')
})

app.get('/orderbook', (req, res) => {
  res.json(getOrders())
})

// start node server
app.listen(3000, function () {
  console.log('Warning: dangerously high ROI detected')
})

