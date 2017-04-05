// const db = require('mongodb')
// const MongoClient = require('mongodb').MongoClient
// const assert = require('assert')


// // Use connect method to connect to the server
// MongoClient.connect(config.mongoUrl, (err, db) => {
//   assert.equal(null, err)
//   console.log("Connected successfully to server")

//   insertDocuments(db, () => {
//     findDocuments(db, () => db.close())
//   })
// })

const mc = require('mongodb').MongoClient,
  co = require('co'),
  assert = require('assert');

co(function*() {
  // Connection URL
  const url = config.mongoUrl
  // Use connect method to connect to the Server
  const db = yield MongoClient.connect(url, console.log)
  // Close the connection
  db.close()
}).catch(function(err) {
  console.log(err.stack)
})

function insertDocuments(callback, db=db) {
  // Get the documents collection
  const collection = db.collection('documents')
  // Insert some documents
  collection.insertMany([
    {a : 1}, {a : 2}, {a : 3}
  ], (err, result) => {
    assert.equal(err, null)
    assert.equal(3, result.result.n)
    assert.equal(3, result.ops.length)
    console.log("Inserted 3 documents into the collection")
    callback(result)
  })
}

function findDocuments(db, callback) {
  // Get the documents collection
  const collection = db.collection('documents')
  // Find some documents
  collection.find({}).toArray((err, docs) => {
    assert.equal(err, null)
    console.log("Found the following records")
    console.log(docs)
    callback(docs)
  })
}

// insertDocuments(r => console.log(r))
module.exports = {
  connect: connect
}