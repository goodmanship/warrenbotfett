const Afplay = require('afplay')
const express = require('express')
const gdax = require('gdax')

const config = require('./lib/config')
const slack = require('./lib/slack')

const app = express()
app.orders = []
const authedClient = new gdax.AuthenticatedClient(
  config.apiKey,
  config.apiSecret,
  config.apiPassphrase,
  config.apiURI
)
const logger = config.logger
const orderbookSync = new gdax.OrderbookSync(['ETH-USD'])
const pc = new gdax.PublicClient('ETH-USD')
const player = new Afplay()
const ws = new gdax.WebsocketClient(['ETH-USD'])

// const mc = require('mongodb').MongoClient
// Defaults to https://api.gdax.com if apiURI omitted

function filledOrder(trade) {
  authedClient.getOrders((err, r, data) => {
    // if the order was filled, it wont be in the order list any more
    const oldOrders = app.orders
    app.orders = data

    if (oldOrders == null) return false
    const o = oldOrders.find(order => order.id === trade.maker_order_id)
    if (o !== undefined) {
      slack.reportFill(trade, o)
      player.play('./public/sounds/kick.wav', { volume: 4 })
      return true
    }
    return false
  })
}

function getOrders(limit = 100) {
  const book = orderbookSync.book.state()
  const asks = book.asks.slice(0, limit - 1)
  const bids = book.bids.slice(0, limit - 1)
  return asks.concat(bids)
}

function audioPoll() {
  setTimeout(() => {
    if (app.trades.length > 0) {
      let sound
      let volume
      let time
      const data = app.trades.shift()
      if (data.side === 'sell') {
        if (data.size >= 1000) {
          sound = './public/sounds/Glass.aiff'
          volume = 5
          time = 0.5
        } else if (data.size >= 100) {
          sound = './public/sounds/Morse.aiff'
          volume = 3
          time = 0.2
        } else if (data.size >= 10) {
          sound = './public/sounds/Frog.aiff'
          volume = 2
          time = 0.1
        } else {
          sound = './public/sounds/Tink.aiff'
          volume = 1
          time = 0.1
        }
      } else if (data.size >= 1000) {
        sound = './public/sounds/Basso.aiff'
        volume = 5
        time = 0.5
      } else if (data.size >= 100) {
        sound = './public/sounds/Bottle.aiff'
        volume = 3
        time = 0.2
      } else if (data.size >= 10) {
        sound = './public/sounds/Ping.aiff'
        volume = 2
        time = 0.1
      } else {
        sound = './public/sounds/Pop.aiff'
        volume = 1
        time = 0.1
      }
      app.audio = player.play(sound, { volume, time })
      setTimeout(audioPoll, 50)
    } else {
      setTimeout(audioPoll, 100)
    }
  }, 5)
}

// current balance
authedClient.getAccounts((err, r, data) => {
  pc.getProductTicker((err, r, eth) => {
    let total = 0.00
    data.forEach((c) => {
      if (c.currency === 'USD')
        total += parseFloat(c.balance)
      else if (c.currency === 'ETH')
        total += parseFloat(c.balance)*parseFloat(eth.price)
      logger.info(c.currency, ':', parseFloat(c.balance).toFixed(2))
    })
    logger.info('Total:', `$${total.toFixed(2)}`)
  })
})

// audio
app.audio = player.play('./public/sounds/Submarine.aiff', { volume: 1, time: 0.1 }).then(audioPoll)
app.trades = []
ws.on('message', (data) => {
  if (data.type === 'match') {
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
  logger.info(body)
  res.sendStatus(200)
})

// start node server
app.listen(3000, () => {
  logger.warn('dangerously high ROI detected')
})
