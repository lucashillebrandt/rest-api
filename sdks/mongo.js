'use strict'

var fs = require('fs')
var path = require('path')
var credentials = JSON.parse(fs.readFileSync(path.join(__dirname, '/credentials.json')))

var MongoClient = require('mongodb').MongoClient
function Mongo () {}

/**
 * Connects to the MongoDB database.
 */
Mongo.prototype.connect = function () {
  return new Promise((resolve, reject) => {
    MongoClient.connect(credentials.mongo.url, { useNewUrlParser: true }, (err, client) => {
      if (err) {
        var error = {
          message: 'Unable to connect to the database.'
        }

        return reject(error)
      }

      var db = client.db(credentials.mongo.database)

      return resolve(db)
    })
  })
}

module.exports = new Mongo()
