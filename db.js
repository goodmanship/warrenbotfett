const db = require('mongodb')

const MongoClient = require('mongodb').MongoClient
const assert = require('assert')

// Connection URL
const url = 'mongodb://localhost:27017/myproject'

// Use connect method to connect to the server
MongoClient.connect(url, (err, db) => {
  assert.equal(null, err)
  console.log("Connected successfully to server")

  insertDocuments(db, () => {
    findDocuments(db, () => db.close())
  })
})

function insertDocuments(db, callback) {
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