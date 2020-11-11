const client = require('../middleware/els-client'),
amqp = require('../middleware/amqp-connection')

   // handle delete all integration by user_id
exports.DeleteIntegrationsByUserID = () => {
   
   amqp.Connect().then(function (conn) {
         return conn.createChannel()
      }).then(async function (ch) {

         return ch.assertQueue('els_tokopedia_integrations_delete_by_user_id').then(ok => {
            return ch.consume(ok.queue, msg => {
               if (msg) {
                     let body = JSON.parse(msg.content.toString()),
                        { user_id } = body,
                        payload = {
                           query:{
                                 bool: {
                                    filter: [{ term: { user_id }}]
                                 }
                           }
                        };
                     
                     client.deleteByQuery({
                        index: 'tokopedia_integrations',
                        type: '_doc',
                        body: payload,
                     }).then(deleted => {
                        console.log("delete katalog tokopedia", deleted)
                     }).catch(err => {
                        console.log("err delete els katalog tokopedia", err)
                        return amqp.Publisher('log_error', {
                           user_id: new_doc.user_id,
                           channel: "els-tokopedia",
                           method: 'DeleteByUserID',
                           message: `error delete produk by user id : ${user_id}`,
                           error: err,
                           date: new Date().getTime().toString().slice(0, 10)
                        })
                     })
               }
            }, { noAck: true })

         })
   }).catch(err => {
      return amqp.Publisher('log_error', {
         user_id: new_doc.user_id,
         channel: "els-tokopedia",
         method: 'DeleteByUserID',
         message: `error rabbitMQ Connect`,
         error: err,
         date: new Date().getTime().toString().slice(0, 10)
      })
   })
}

// create
exports.ConsumerStoreCreate = () => {
   amqp.Connect().then(function (conn) {
      return conn.createChannel()
   }).then(async function (ch) {
      // Consumer
      return await ch.assertQueue('els_store_tokopedia_create').then(function (ok) {
         return ch.consume(ok.queue, async function (msg) {
            const new_doc = JSON.parse(msg.content.toString());
            if (new_doc) {
               let id = new_doc._id;
               delete new_doc._id;
               await client.index({
                  index: "tokopedia_integrations",
                  type: "_doc",
                  id,
                  body: new_doc
               }).then( ({  statusCode }) => {
                  // console.log('statusCode', statusCode)
                  if(statusCode === 200 || statusCode === 201) {
                     return amqp.Publisher('tokopedia_integrations_update_is_elasticsearch', {
                        store_id: id 
                     })
                  }

               }).catch(err => {
                  return amqp.Publisher('log_error', {
                     user_id,
                     channel: "els-tokopedia",
                     method: 'ConsumerStoreCreate',
                     message: `Insert/Update store data : ${new_doc}`,
                     error: err,
                     date: new Date().getTime().toString().slice(0, 10)
                  });
               })
            }
         }, {
            noAck: true
         });
      });
   }).catch(console.warn);
}


// update
exports.ConsumerStoreUpdate = () => {
   amqp.Connect().then(function (conn) {
      return conn.createChannel()
   }).then(async function (ch) {
      // Consumer
      return await ch.assertQueue('els_store_tokopedia_update').then(function (ok) {
         return ch.consume(ok.queue, async function (msg) {
            const new_doc = JSON.parse(msg.content.toString());
            if (new_doc) {
               let id = new_doc._id;
               delete new_doc._id;
               await client.index({
                  index: "tokopedia_integrations",
                  type: "_doc",
                  id,
                  body: new_doc
               }).catch(err => {
                  return amqp.Publisher('log_error', {
                     user_id,
                     channel: "els-tokopedia",
                     method: 'ConsumerStoreUpdate',
                     message: `Update store data : ${new_doc}`,
                     error: err,
                     date: new Date().getTime().toString().slice(0, 10)
                  });
               })
            }

         }, {
            noAck: true
         });
      });
   }).catch(console.warn);
}


// delete
exports.ConsumerStoreDeleteByID = () => {
   amqp.Connect().then(function (conn) {
      return conn.createChannel()
   }).then(async function (ch) {
      // Consumer
      return await ch.assertQueue('els_store_tokopedia_delete_by_id').then(function (ok) {
         return ch.consume(ok.queue, async function (msg) {
            const new_doc = JSON.parse(msg.content.toString());
            if (new_doc) {
               const { user_id, store_id } = new_doc;
               await client.delete({
                  index: "tokopedia_integrations",
                  type: "_doc",
                  id: store_id
               }).catch(err => {
                  return amqp.Publisher('log_error', {
                     user_id,
                     channel: "els-tokopedia",
                     method: 'ConsumerStoreDeleteByID',
                     message: `Detete for store  data : ${new_doc}`,
                     error: err,
                     date: new Date().getTime().toString().slice(0, 10)
                  });
               })
            }

         }, {
            noAck: true
         });
      });
   }).catch(console.warn);
}

// update tonen expired all store 

exports.UpdateExpiresTokenAllStore = () => {
   amqp.Connect().then(function (conn) {
      return conn.createChannel()
   }).then(async function (ch) {
      // Consumer
      return await ch.assertQueue('els_update_token_tokopedia').then(function (ok) {
         return ch.consume(ok.queue, async function (msg) {
            const new_doc = JSON.parse(msg.content.toString());
            if (new_doc) {

               let query = {
                  index: 'tokopedia_integrations',
                  refresh: true,
                  body: {
                     script: {
                        lang: 'painless',
                        source: `ctx._source["update_date"] = ${new_doc.expire_date}; ctx._source["expire_date"] = ${new_doc.expire_date}`,
                     },
                     query: {
                        match_all: {},
                     },
                  },
               }

               // console.log("query", query)
               await client.updateByQuery(query)
                  .then((result) => {
                     console.log(
                        result,
                        'BERHASIL UPDATE update token di all store'
                     )
                  })
                  .catch(err => {
                     return amqp.Publisher('log_error', {
                        user_id: new_doc.user_id,
                        channel: "els-tokopedia",
                        method: 'UpdateExpiresTokenAllStore',
                        message: `error update all store expited token tokopedia`,
                        error: err,
                        date: new Date().getTime().toString().slice(0, 10)
                     })
                  })
            }

         }, {
            noAck: true
         });
      });
   }).catch(console.warn);
}