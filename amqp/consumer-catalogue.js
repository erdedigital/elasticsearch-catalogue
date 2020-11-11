const client = require('../middleware/els-client'),
   amqp = require('../middleware/amqp-connection')

// handle delete all catalogue by user_id
exports.DeleteCatalogueByUserID = () => {
   
   amqp.Connect().then(function (conn) {
         return conn.createChannel()
      }).then(async function (ch) {

         return ch.assertQueue('els_tokopedia_catalogues_delete_by_user_id').then(ok => {
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
                        index: 'tokopedia_catalogues',
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
      console.log("err", err)
      return amqp.Publisher('log_error', {
         user_id: "",
         channel: "els-tokopedia",
         method: 'DeleteByUserID',
         message: `error rabbitMQ Connect`,
         error: err,
         date: new Date().getTime().toString().slice(0, 10)
      })
   })
}

// create
exports.ConsumerCatalogueCreate = () => {
   amqp.Connect().then(function (conn) {
      return conn.createChannel()
   }).then(async function (ch) {
      // Consumer
      return await ch.assertQueue('els_tokopedia_catalogue_create').then(function (ok) {
         return ch.consume(ok.queue, async function (msg) {
            const new_doc = JSON.parse(msg.content.toString());
            if (new_doc) {
               let id = new_doc._id;
               delete new_doc._id;
               await client.index({
                  index: "tokopedia_catalogues",
                  type: "_doc",
                  id,
                  body: new_doc
               }).then( ({  statusCode }) => {
                  // console.log('statusCode', statusCode)
                  if(statusCode === 200 || statusCode === 201) {
                     return amqp.Publisher('tokopedia_catalogue_update_is_elasticsearch', {
                        catalogue_id: id 
                     })
                  }
               }).catch(err => {
                  console.log("err", err)
                  return amqp.Publisher('log_error', {
                     user_id: new_doc.user_id,
                     channel: "els-tokopedia",
                     method: 'ConsumerCatalogueCreate',
                     message: `Error Insert/Update data : ${new_doc}`,
                     error: err,
                     date: new Date().getTime().toString().slice(0, 10)
                  })
               })
            }
         }, {
            noAck: true
         });
      });
   }).catch(err => {
      console.log("err", err)
      return amqp.Publisher('log_error', {
         user_id: "",
         channel: "els-tokopedia",
         method: 'ConsumerCatalogueCreate',
         message: `error rabbitMQ Connect`,
         error: err,
         date: new Date().getTime().toString().slice(0, 10)
      })
   })
}


// update partial fild
exports.ConsumerCatalogueUpdate = () => {
   amqp.Connect().then(function (conn) {
      return conn.createChannel()
   }).then(async function (ch) {
      // Consumer
      return await ch.assertQueue('els_tokopedia_catalogue_update').then(function (ok) {
         return ch.consume(ok.queue, async function (msg) {
            const new_doc = JSON.parse(msg.content.toString());
            if (new_doc) {
               let id = new_doc._id;
               delete new_doc._id;
               await client.index({
                  index: "tokopedia_catalogues",
                  type: "_doc",
                  id,
                  body: new_doc
               }).catch(err => {
                  return amqp.Publisher('log_error', {
                     user_id: new_doc.user_id,
                     channel: "els-tokopedia",
                     method: 'ConsumerCatalogueUpdate',
                     message: `error Update data : ${new_doc}`,
                     error: err,
                     date: new Date().getTime().toString().slice(0, 10)
                  })
               })
            }
         }, {
            noAck: true
         });
      });
   }).catch(err => {
      console.log("err", err)
      return amqp.Publisher('log_error', {
         user_id: "",
         channel: "els-tokopedia",
         method: 'ConsumerCatalogueUpdate',
         message: `error rabbitMQ Connect`,
         error: err,
         date: new Date().getTime().toString().slice(0, 10)
      })
   })
}

// delete catalogue by id
exports.ConsumerCatalogueDeleteByMultipleID = () => {
   amqp.Connect().then(function (conn) {
      return conn.createChannel()
   }).then(async function (ch) {
      // Consumer
      return await ch.assertQueue('els_tokopedia_catalogue_delete_by_id').then(function (ok) {
         return ch.consume(ok.queue, async function (msg) {
            const new_doc = JSON.parse(msg.content.toString());
            console.log('els_tokopedia_catalogue_delete_by_id', new_doc)
            if (new_doc) {

               const idsToDelete = new_doc.catalogue_id // arrray
               const bulk = idsToDelete.map(id => {
                  return {
                     'delete': {
                        '_index': 'tokopedia_catalogues',
                        '_type': '_doc',
                        '_id': id
                     }
                  }
               })

               await client.bulk({
                     body: bulk
                  })
                  .catch(err => {
                     return amqp.Publisher('log_error', {
                        user_id: new_doc.user_id,
                        channel: "els-tokopedia",
                        method: 'ConsumerCatalogueDeleteByMultipleID',
                        message: `error Detete By ID data : ${bulk}`,
                        error: err,
                        date: new Date().getTime().toString().slice(0, 10)
                     })
                  })
            }
         }, {
            noAck: true
         });
      });
   }).catch(err => {
      console.log("err", err)
      return amqp.Publisher('log_error', {
         user_id: "",
         channel: "els-tokopedia",
         method: 'ConsumerCatalogueDeleteByMultipleID',
         message: `error rabbitMQ Connect`,
         error: err,
         date: new Date().getTime().toString().slice(0, 10)
      })
   })
}

// delete catalogue store_id
exports.ConsumerCatalogueDeleteByStoreID = () => {
   amqp.Connect().then(function (conn) {
      return conn.createChannel()
   }).then(async function (ch) {
      // Consumer
      return await ch.assertQueue('els_tokopedia_catalogue_delete_by_store_id').then(function (ok) {
         return ch.consume(ok.queue, async function (msg) {
            const new_doc = JSON.parse(msg.content.toString());

            console.log('els_tokopedia_catalogue_delete_by_store_id', new_doc)

            if (new_doc) {
               const {
                  user_id,
                  store_id
               } = new_doc;
               await client.deleteByQuery({
                  index: "tokopedia_catalogues",
                  type: "_doc",
                  body: {
                     query: {
                        term: {
                           store_id
                        }
                     }
                  }
               }).catch(err => {
                  // console.log('err', err)
                  return amqp.Publisher('log_error', {
                     user_id,
                     channel: "els-tokopedia",
                     method: 'ConsumerCatalogueDeleteByStoreID',
                     message: `Error Detete By Store data : ${new_doc}`,
                     error: err,
                     date: new Date().getTime().toString().slice(0, 10)
                  })
               })
            }
         }, {
            noAck: true
         });
      });
   }).catch(err => {
      console.log("err", err)
      return amqp.Publisher('log_error', {
         user_id: "",
         channel: "els-tokopedia",
         method: 'ConsumerCatalogueDeleteByStoreID',
         message: `error rabbitMQ Connect`,
         error: err,
         date: new Date().getTime().toString().slice(0, 10)
      })
   })
}

// handle if master delete & update to catalogue by master ID
exports.ConsumerCatalogueUpdateByMasterID = () => {

   amqp.Connect().then(function (conn) {
         return conn.createChannel()
      }).then(async function (ch) {
         // Consumer
         return await ch
            .assertQueue('els_tokopedia_catalogue_update_by_master_id')
            .then(function (ok) {
               return ch.consume(
                  ok.queue,
                  async function (msg) {
                     // console.log(msg, 'INI MESSAGE')
                     // console.log(msg.content, 'INI MESSAGE CONTENT')
                     const new_doc = JSON.parse(msg.content.toString())
                     if (new_doc) {
                        console.log('Berhasil dapet newDoc', new_doc)
                        const id = new_doc.master_id
                        // console.log(id, 'ini master id')

                        await client
                           .updateByQuery({
                              index: 'tokopedia_catalogues',
                              refresh: true,
                              body: {
                                 script: {
                                    lang: 'painless',
                                    source: 'ctx._source["master_id"] = null; ctx._source["sync_master"] = false',
                                 },
                                 query: {
                                    match: {
                                       master_id: id,
                                    },
                                 },
                              },
                           })
                           .then((result) => {
                              console.log(
                                 result,
                                 'BERHASIL UPDATE master_id di CATALOGUE'
                              )
                           })
                           .catch(err => {
                              return amqp.Publisher('log_error', {
                                 user_id: new_doc.user_id,
                                 channel: "els-tokopedia",
                                 method: 'ConsumerCatalogueUpdateByMasterID',
                                 message: `error update produk ${new_doc.name} by master id : ${id} `,
                                 error: err,
                                 date: new Date().getTime().toString().slice(0, 10)
                              })
                           })
                     }
                  }, {
                     noAck: true,
                  }
               )
            })
      })
      .catch(err => {
         console.log("err", err)
         return amqp.Publisher('log_error', {
            user_id: "",
            channel: "els-tokopedia",
            method: 'ConsumerCatalogueUpdateByMasterID',
            message: `error rabbitMQ Connect`,
            error: err,
            date: new Date().getTime().toString().slice(0, 10)
         })
      })
}

exports.ConsumerCatalogueUpdateByStoreID = () => {
   amqp.Connect().then(function (conn) {
         return conn.createChannel()
      }).then(async function (ch) {
         // Consumer
         return await ch
            .assertQueue('els_tokopedia_catalogue_update_by_store_id')
            .then(function (ok) {
               return ch.consume(
                  ok.queue,
                  async function (msg) {
                     // console.log(msg, 'INI MESSAGE')
                     // console.log(msg.content, 'INI MESSAGE CONTENT')
                     const new_doc = JSON.parse(msg.content.toString())
                     if (new_doc) {
                        console.log('Berhasil dapet newDoc', new_doc)
                        const id = new_doc.store_id
                        await client
                           .updateByQuery({
                              index: 'tokopedia_catalogues',
                              refresh: true,
                              body: {
                                 script: {
                                    lang: 'painless',
                                    source: 'ctx._source["master_id"] = null; ctx._source["sync_master"] = false',
                                 },
                                 query: {
                                    match: {
                                       store_id: id,
                                    },
                                 },
                              },
                           })
                           .then((result) => {
                              console.log(
                                 result,
                                 'BERHASIL unsync catalogue'
                              )
                           })
                           .catch(err => {
                              return amqp.Publisher('log_error', {
                                 user_id,
                                 channel: "els-tokopedia",
                                 method: 'ConsumerCatalogueUpdateByStoreID',
                                 message: `error update store ${new_doc.name} by store_id : ${id}`,
                                 error: err,
                                 date: new Date().getTime().toString().slice(0, 10)
                              })
                           })
                     }
                  }, {
                     noAck: true,
                  }
               )
            })
      })
      .catch(err => {
         console.log("err", err)
         return amqp.Publisher('log_error', {
            user_id: "",
            channel: "els-tokopedia",
            method: 'ConsumerCatalogueUpdateByStoreID',
            message: `error rabbitMQ Connect`,
            error: err,
            date: new Date().getTime().toString().slice(0, 10)
         })
      })
}