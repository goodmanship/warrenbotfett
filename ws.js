const config = require("./lib/config")
const slack = require('./lib/slack')

const gdax = require('gdax')
const player = require('play-sound')(opts = {})
const ws = new gdax.WebsocketClient(['ETH-USD'])

const app = {}

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
      slack.reportFill(trade, o)
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
    sound = './public/sounds/crinkle.wav'
  }
  app.audio.kill()
  app.audio = player.play(sound, {afplay: ['-v', soundVol(data.size)]})
}

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
}, 80)