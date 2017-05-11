const config = require("./config")
const logger = config.logger
const gdax = require('gdax')
const pc = new gdax.PublicClient('ETH-USD')

function storeSome(err, res, data) {
  // each data element is: [ time, low, high, open, close, volume ]
  let maxTime = new Date(data[0][0] * 1000)
  let minTime = new Date(data[0][0] * 1000)
  let time

  data.forEach(d => {
    time = new Date(d[0]*1000)
    if (time < minTime) minTime = time
    if (time > maxTime) maxTime = time
    logger.info(time, d[1], d[2], d[3], d[4], d[5])
  })

  logger.info('summary: ', data.length, 'data points, min time:', minTime, ', max time:', maxTime)
}

logger.info(new Date)
pc.getProductHistoricRates({'granularity': 60}, storeSome)
