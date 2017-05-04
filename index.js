const config = require("./lib/config")
const slack = require('./lib/slack')

const express = require('express')
const gdax = require('gdax')
const orderbookSync = new gdax.OrderbookSync(['ETH-USD'])

const Afplay = require('afplay')
const player = new Afplay

const app = express()
app.orders = []

const ws = new gdax.WebsocketClient(['ETH-USD']);
// const pc = new gdax.PublicClient('ETH-USD')
// const mc = require('mongodb').MongoClient

// Defaults to https://api.gdax.com if apiURI omitted
const authedClient = new gdax.AuthenticatedClient(
  config.apiKey,
  config.apiSecret,
  config.apiPassphrase,
  config.apiURI
)
authedClient.getAccounts((err, r, data) => console.log(data))

function filledOrder(trade) {
  authedClient.getOrders((err, r, data) => {
    // if the order was filled, it wont be in the order list any more
    const newOrders = data
    data = app.orders
    app.orders = newOrders

    if (data == null) return false
    const o = data.find(order => order.id == trade.maker_order_id)
    if (o !== undefined) {
      slack.reportFill(trade, o)
      app.audio.kill()
      player.play('./public/sounds/kick.wav', {volume: 4})
    }
  })
}

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

function soundVol(size) {
  let x = parseFloat(size)
  if (x <= 5)
    return 0.5
  else
    return Math.min((x/8).toFixed(2), 1)
}

function playAnotherTen() {
  let sum = 0
  for (trade in app.trades.slice(0,10)) {
    if (trade.side == 'sell') {
      sum -= trade.size
    } else {
      sum += trade.size
    }
  }
  app.trades = app.trades.slice(9)
  let side = sum < 0 ? 'sell' : 'buy'
  app.trades.unshift({side, size: sum})
  playAnotherOne()
}

function playAnotherOne() {
  let sound
  let vol
  let time
  let data = app.trades.shift()
  if (data.side == 'sell') {
    if (data.size >= 1000) {
      sound = './public/sounds/Glass.aiff'
      vol = 5
      time = 0.5
    } else if (data.size >= 100) {
      sound = './public/sounds/Ping.aiff'
      vol = 3
      time = 0.2
    } else if (data.size >= 10) {
      sound = './public/sounds/Morse.aiff'
      vol = 2
      time = 0.1
    } else {
      sound = './public/sounds/Tink.aiff'
      vol = 1
      time = 0.1
    }
  } else {
    if (data.size >= 1000) {
      sound = './public/sounds/Basso.aiff'
      vol = 5
      time = 0.5
    } else if (data.size >= 100) {
      sound = './public/sounds/Bottle.aiff'
      vol = 3
      time = 0.2
    } else if (data.size >= 10) {
      sound = './public/sounds/Frog.aiff'
      vol = 2
      time = 0.1
    } else {
      sound = './public/sounds/Pop.aiff'
      vol = 1
      time = 0.1
    }
  }
  app.audio = player.play(sound, {volume: vol, time: time})
  setTimeout(audioPoll, 50)
}

function audioPoll() {
  // if (app.trades.length > 10) playAnotherTen()
  if (app.trades.length > 0) playAnotherOne()
  else setTimeout(audioPoll, 100)
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

app.audio = player.play('./public/sounds/Submarine.aiff', {volume: 1, time: 0.1}).then(audioPoll)
app.trades = []
ws.on('message', data => {
  if (data.type == 'match') {
    app.trades.push(data)
    filledOrder(data)
  }
})

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

app.post('/allorder', (req, res) => {
  const body = req.body
  console.log(body)
  res.sendStatus(200)
})

// start node server
app.listen(3000, function () {
  console.log('Warning: dangerously high ROI detected')
})

