require('dotenv').config();
const express = require('express'),
   app = express()

const amqp = require("./amqp");
app.use("/", amqp);

module.exports = app;