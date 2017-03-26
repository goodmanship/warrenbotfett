const config = require("./config")
const gdax = require('gdax');

// logs trades to console
// const websocket = new gdax.WebsocketClient(['ETH-USD']);
// websocket.on('message', data => {
//   if(data.type != 'match') return false
//   console.log(data)
// });

// for actual orders
// const authedClient = new Gdax.AuthenticatedClient(
//   config.key, config.b64secret, config.passphrase, config.apiUrl
// );

const publicClient = new gdax.PublicClient('ETH-USD')
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
[1,2,3].forEach(i => {
  publicClient.getProductTrades((err, res, data) => console.log(data))