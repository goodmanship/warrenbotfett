const config = require('./config')
const IncomingWebhook = require('@slack/client').IncomingWebhook
const webhook = new IncomingWebhook(config['slackUrl'])

module.exports = {
  test: function() {
    console.log("whatup")
  },
  reportFill: function(trade, order) {
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
}