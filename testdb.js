var MongoClient = require('mongodb').MongoClient,
  co = require('co'),
  assert = require('assert');

co(function*() {
  // Connection URL
  var db = yield MongoClient.connect('mongodb://localhost:27017/myproject');
  console.log("Connected correctly to server");

  // Get the removes collection
  var col = db.collection('removes');
  // Insert a single document
  var r = yield col.insertMany([{a:1}, {a:2}, {a:2}]);
  assert.equal(3, r.insertedCount);

  // Remove a single document
  var r = yield col.deleteOne({a:1});
  assert.equal(1, r.deletedCount);

  // Update multiple documents
  var r = yield col.deleteMany({a:2});
  assert.equal(2, r.deletedCount);
  console.log('removed a2', r.deletedCount)
  db.close();
}).catch(function(err) {
  console.log(err.stack);
});