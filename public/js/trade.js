console.log("i got this here")
const endpoint = {
  'orderbook': '/orderbook'
}
const buyOrderBook = document.querySelector('#buyOrders')
const sellOrderBook = document.querySelector('#sellOrders')
const title = document.querySelector('#mainTitle')

function sellSort(x, y) {
  if (y.price < x.price) return -1
  if (y.price == x.price) return 0
  if (y.price > x.price) return 1
}

function showBook(data) {
  const buyOrderList = data.filter(order => order['side'] == 'buy').map(order => `<li class='${order['side']}'><span><strong>${parseFloat(order['price']).toFixed(2)}</strong> ${order['size']}</span></li>`).join('')
  const sellOrderList = data.filter(order => order['side'] == 'sell').sort((a,b) => parseFloat(b['price']) - parseFloat(a['price'])).map(order => `<li class='${order['side']}'><span><strong>${parseFloat(order['price']).toFixed(2)}</strong> ${order['size']}</span></li>`).join('')
  buyOrderBook.innerHTML = buyOrderList
  sellOrderBook.innerHTML = sellOrderList
}

setInterval(() => {
  fetch(endpoint['orderbook'])
    .then(blob => blob.json())
    .then(data => showBook(data))
}, 1000)

const buyButton = document.querySelector('button#buy')
const sellButton = document.querySelector('button#sell')
buyButton.addEventListener('click', (e) => title.innerHTML = 'buy!')
sellButton.addEventListener('click', (e) => title.innerHTML = 'sell!')