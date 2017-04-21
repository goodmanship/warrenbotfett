const config = require("./config")

const express = require('express')
const gdax = require('gdax')
const IncomingWebhook = require('@slack/client').IncomingWebhook
const orderbookSync = new gdax.OrderbookSync(['ETH-USD'])
const player = require('play-sound')(opts = {})
const webhook = new IncomingWebhook(config['slackUrl'])

const app = express()

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
    if (data == null) return false
    let o = data.find(order => order.id == trade.maker_order_id)
    if (o !== undefined) {
      slack(trade, o)
      app.audio.kill()
      player.play('./public/sounds/kick.wav', {afplay: ['-v', 10]})
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
    return Math.min((x/10).toFixed(2), 1)
}

function playAnotherOne() {
  let sound
  let data = app.trades.shift()
  if (data.side == 'sell') {
    sound = './public/sounds/tink.wav'
  } else {
    sound = './public/sounds/snare.wav'
  }
  app.audio.kill()
  app.audio = player.play(sound, {afplay: ['-v', soundVol(data.size)]})
}

function slack(trade, order) {
  let msg = trade.size == order.size ? 'complete fill.  ' : 'partial fill.  '
  msg += `${order.side} ${trade.size} out of ${order.size} @ ${order.price}`
  webhook.send(msg, (err, res) => {
    if (err) {
      console.log('Error: ', err)
    } else {
      console.log('Message sent: ', res)
    }
  })
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

app.audio = player.play('./public/sounds/kick.wav', {afplay: ['-v', 0.5]})
app.trades = []
ws.on('message', data => {
  if (data.type == 'match') {
    app.trades.push(data)
    filledOrder(data)
  }
})

setInterval(() => {
  if (app.trades.length > 0) playAnotherOne()
}, 100)

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

