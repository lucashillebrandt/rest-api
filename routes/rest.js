'use strict'

var database = require('../sdks/database.js')
var express = require('express')
var fs = require('fs')
var path = require('path')
var credentials = JSON.parse(fs.readFileSync(path.join(__dirname, '../sdks/credentials.json')))
var jwt = require('jsonwebtoken')

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

class Router {
  constructor (route, roles) {
    this.route = route
    this.roles = roles
  }

  restify () {
    var router = express.Router()

    router.route('/' + this.route)
      .get(isLoggedIn.bind(this), (req, res) => {
        var sort = null
        var filter = {}

        if (req.query.sort) {
          if (!req.query.order) {
            sort = 'asc'
          }

          sort = {'field': req.query.sort, 'order': req.query.order}
        }

        if (req.query.filter) {
          filter = JSON.parse(req.query.filter)
        }

        var data = database.get(this.route, filter, sort)

        data.then(function (items) {
          res.send(items)
        }).catch(function (err) {
          res.send(err)
        })
      })
      .post(isLoggedIn, (req, res) => {
        if (!req.body.data) {
          return res.send({'message': 'Missing JSON content'})
        }

        var data = database.insert(this.route, req.body.data)

        data.then((items) => {
          res.send(items)
        }).catch((err) => {
          res.send(err)
        })
      })
      .put(isLoggedIn, (req, res) => {
        if (!req.body.filter) {
          res.send({message: 'Missing filter'})
        }

        if (!req.body.data) {
          res.send({message: 'No content to be updated'})
        }

        var data = database.put(this.route, req.body.filter, req.body.data)

        data.then((items) => {
          res.send(items)
        }).catch((err) => {
          res.send(err)
        })
      })
      .delete(isLoggedIn, (req, res) => {
        if (!req.body.filter) {
          res.send({'message': 'The filter is missing'})
        }

        var data = database.delete(this.route, req.body.filter)

        data.then(function (items) {
          res.send(items)
        }).catch(function (err) {
          res.send(err)
        })
      })
    return router
  }
}

module.exports = Router
