'use-strict'

var rest = require('../sdks/rest.js')
var express = require('express')
var jwt = require('jsonwebtoken')

var fs = require('fs')
var path = require('path')
var credentials = JSON.parse(fs.readFileSync(path.join(__dirname, '../sdks/credentials.json')))
var bcrypt = require('bcrypt')

var router = express.Router()

router.route('/auth')
  .post((req, res) => {
    if (req.body['user']) {
      var data = rest.get('users', {'_id': req.body.user})

      data.then(function (payload) {
        bcrypt.hash(req.body.password, credentials.auth.salt, (err, hash) => {
          if (req.body['password'] === hash) {
            if (err) {
              res.status(403).send(err)
            }

            payload = payload[0]

            delete payload.password

            jwt.sign(payload, credentials.auth.secret, { expiresIn: '30d' }, (err, token) => {
              if (err) {
                res.status(403).send(err)
              }

              res.send({'token': token})
            })
          }
        })
      }).catch((err) => {
        console.log(err)
        res.status(403).send({'message': 'Unable to find user'})
      })
    } else {
      res.status(403).send({'message': 'Unable to find user'})
    }
  })

module.exports = router
