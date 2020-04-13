'use strict'

var express = require('express')
var helmet = require('helmet')
var bodyParser = require('body-parser')

var Route = require('./routes/rest')

var app = express()

app.use(function (req, res, next) {
  if (req.ip !== '127.0.0.1' && req.ip !== '::ffff:127.0.0.1') {
    res.status(403).end('forbidden' + req.ip)
  } else {
    next()
  }
})

app.use(helmet())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extend: true}))

app.use('/', new Route('test', { allowedRoles: ['dev'] }).restify())
app.use('/', require('./routes/auth'))

app.listen(3000, function () {
  console.log('Internal API is up and running :-)')
})
