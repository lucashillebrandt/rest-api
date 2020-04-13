var rest = require('../sdks/rest.js')
var express = require('express')
var jwt = require('jsonwebtoken')

var fs = require('fs')
var path = require('path')
var credentials = JSON.parse(fs.readFileSync(path.join(__dirname, '../sdks/credentials.json')))
var bcrypt = require('bcrypt')

function isLoggedIn (req, res, next) {
  var token = req.headers.authorization
  var object = this

  if (token) {
    token = token.replace('Bearer ', '')

    jwt.verify(token, credentials.auth.secret, (err, decoded) => {
      if (err) {
        res.status(401).send({ message: 'Sign in to continue.' })
      } else {
        if (object.roles.allowedRoles.includes(decoded.role)) {
          next()
        } else {
          res.status(401).send({ message: 'Access Denied' })
        }
      }
    })
  } else {
    res.status(401).send({ message: 'Sign in to continue.' })
  }
}

class Login {
  constructor (route, roles) {
    this.route = route
    this.roles = roles
  }

  users () {
    var router = express.Router()

    router.route('/login')
      .post(isLoggedIn.bind(this), (req, res) => {
        if (req.body['email'] && req.body['password'] && req.body['name'] && req.body['role'] && req.body['active']) {
          rest.get('users', {'_id': req.body.email})
            .then((data) => {
              data = data[0]
              if (data) {
                if (req.body.email === data['_id']) {
                  return res.status(403).send({'message': 'User already exists'})
                }
              }

              data = {
                '_id': req.body.email,
                'name': req.body.name,
                'active': req.body.active
              }

              if (req.body.role.match(/(support|client|devops)/)) {
                data['role'] = req.body.role
              } else {
                return res.status(403).send({'message': 'Invalid Role'})
              }

              bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                  console.log(err)
                  res.status(403).send({'message': 'Unable to create user'})
                }
                data['secret'] = salt

                bcrypt.hash(req.body.password, data.secret, (err, hash) => {
                  if (err) {
                    return res.status(403).send(err)
                  }

                  data['password'] = hash
                  console.log(data)
                  rest.insert('users', data)
                    .catch((err) => {
                      console.log(err)
                      res.status(403).send({'message': 'Unable to create secret'})
                    })
                  res.send({'message': 'User created successfully'})
                })
              })
            }).catch((err) => {
              console.log(err)
            })
        } else {
          return res.status(403).send({'message': 'There are missing parameters'})
        }
      })
      .put(isLoggedIn.bind(this), (req, res) => {
        if (req.body.email && req.body.password) {
          rest.get('users', {'_id': req.body.email})
            .then((payload) => {
              payload = payload[0]

              new Promise((resolve, reject) => {
                var data = {}
                if (req.body.password) {
                  bcrypt.hash(req.body.password, payload.secret, (err, hash) => {
                    if (err) {
                      return res.status(403).send(err)
                    }

                    data['password'] = hash

                    resolve(data)
                  })
                }
              })
              .then((data) => {
                rest.put('users', {'_id': req.body.email}, data)
                  .then((data) => {
                    res.send({'message': 'User updated sucessfully'})
                  })
                  .catch((err) => {
                    console.log(err)
                    return res.status(403).send({'message': 'Unable to update user'})
                  })
              })
              .catch((err) => {
                console.log(err)
                return res.status(403).send({'message': 'Unable to update user'})
              })
            }).catch((err) => {
              console.log(err)
              return res.status(403).send({'message': 'Unable to find user'})
            })
        }
      })
      .delete(isLoggedIn.bind(this), (req, res) => {
        if (req.body['email']) {
          rest.delete('users', {'_id': req.body.email})
            .then(() => {
              res.send({'message': 'User removed successfully'})
            })
            .catch((err) => {
              console.log(err)
              res.status(403).send({'message': 'Unable to find user'})
            })
        } else {
          res.status(403).send({'message': 'There are missing parameters'})
        }
      })
    return router
  }
}

module.exports = Login
