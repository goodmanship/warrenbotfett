const config = require('./config')
const IncomingWebhook = require('@slack/client').IncomingWebhook

const webhook = new IncomingWebhook(config.slackUrl)

module.exports = {
  test: () => config.logger.info('whatup'),
  reportFill: (trade, order) => {
    let msg = trade.size === order.size ? 'complete fill.  ' : 'partial fill.  '
    msg += `${order.side} ${trade.size} out of ${order.size} @ ${order.price}`
    webhook.send(msg, (err, res) => {
      if (err) {
        config.logger.err('Error: ', err)
      } else {
        config.logger.info('Message sent: ', res)
      }
    })
  }
}
