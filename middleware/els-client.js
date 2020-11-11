const {
  Client
} = require('@elastic/elasticsearch'),
  client = new Client({
    node: process.env.ELS_URL
  })

module.exports = client
