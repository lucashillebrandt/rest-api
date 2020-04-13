'use-strict'

var Mongo = require('./mongo.js')
var Rest = function () {}

var conn = Mongo.connect()

/**
 * Prepare field sort to send to database.
 */
function checkSort (content) {
  return new Promise((resolve, reject) => {
    if (content) {
      var options = {}
      if (content.order === 'desc') {
        content.order = -1
      } else {
        content.order = 1
      }

      options = {'sort': {}}
      options.sort[content.field] = content.order
      resolve(options)
    } else {
      reject(new Error({message: 'No content'}))
    }
  })
}

/**
 * Checks for field _id into JSON data.
 */
function checkId (object) {
  return new Promise((resolve, reject) => {
    if (object) {
      if (object.hasOwnProperty('id') && !object.hasOwnProperty('_id')) {
        object['_id'] = object.id
        delete object.id
      }

      resolve(object)
    } else {
      reject(new Error({message: 'Missing JSON Object'}))
    }
  })
}

/**
 * Gets data from database.
 */
Rest.prototype.get = function (collection, filter = {}, sort = undefined) {
  return new Promise(async (resolve, reject) => {
    conn.then(async (db) => {
      var options = {}

      if (!db) {
        reject(new Error({'message': 'Unable to create DB connection'}))
      }

      if (sort) {
        options = await checkSort(sort)
      }

      checkId(filter).then((filter) => {
        db.collection(collection).find(filter, options).toArray((err, result) => {
          if (err) {
            console.log(err)
            reject(new Error({message: 'Unable to get data from database'}))
          }

          resolve(result)
        })
      }).catch((err) => {
        console.log(err)
        return reject(new Error({'message': 'missing JSON'}))
      })
    }).catch((err) => {
      console.log(err)
      return reject(new Error({'message': 'Unable to create DB connection'}))
    })
  })
}

/**
 * Inserts data into database.
 */
Rest.prototype.insert = function (collection, data) {
  return new Promise((resolve, reject) => {
    conn.then(async (db) => {
      if (!db) {
        return reject(new Error({'message': 'Unable to create DB connection'}))
      }

      if (typeof (data) !== Array) {
        data = [data]
      }

      db.collection(collection).insertMany(data, (err, result) => {
        if (err) {
          console.error(err)
          reject(new Error({message: 'Unable to insert data into the database.'}))
        }

        resolve(new Error({message: 'Document has been created successfully.'}))
      })
    }).catch((err) => {
      console.log(err)
      return reject(new Error({'message': 'Unable to create DB connection'}))
    })
  })
}

/**
 * Updates data from database.
 */
Rest.prototype.put = function (collection, filter, data) {
  return new Promise((resolve, reject) => {
    conn.then((db) => {
      checkId(filter).then((filter) => {
        data = { '$set': data }

        db.collection(collection).findOneAndUpdate(filter, data, (err, result) => {
          console.log(err)
          if (err) {
            reject(new Error({message: 'Unable to update data into the database.'}))
          }

          resolve({message: 'Data has been updated successfully.'})
        })
      }).catch((err) => {
        console.log(err)
        return reject(new Error({'message': 'missing JSON'}))
      })
    }).catch((err) => {
      console.log(err)
      return reject(new Error({'message': 'Unable to create DB connection'}))
    })
  })
}

/**
 * Removes data from database.
 */
Rest.prototype.delete = function (collection, filter) {
  return new Promise((resolve, reject) => {
    conn.then((db) => {
      checkId(filter).then((filter) => {
        db.collection(collection).deleteMany(filter, (err, result) => {
          if (err) {
            console.log(err)
            reject(new Error({message: 'Unable to remove data from database.'}))
          }

          resolve({message: 'Data has been removed successfully.'})
        })
      }).catch((err) => {
        console.log(err)
        return reject(new Error({'message': 'missing JSON'}))
      })
    }).catch((err) => {
      console.log(err)
      return reject(new Error({'message': 'Unable to create DB connection'}))
    })
  })
}

module.exports = new Rest()
