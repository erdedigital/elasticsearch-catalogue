const client = require('../../middleware/els-client'),
   resp = require('../../middleware/response')

class CatalogueSyncMaster {

   // handle get items sync master for price
   static GetDetailItemsPriceSyncMasterCatalogue(req, res, next) {
      const {
         user_id,
         master_id
      } = req.params

      let query_price = {
         query: {
            bool: {
               must: [{
                     match: {
                        user_id
                     }
                  },
                  {
                     match: {
                        master_id
                     }
                  },
                  {
                     match: {
                        sync_master: true
                     }
                  },
                  {
                     match: {
                        status_catalogue: true
                     }
                  },
               ],
            },
         },
      }

      client
         .search({
            index: 'tokopedia_catalogues',
            type: '_doc',
            body: query_price,
         })
         .then(({
            statusCode,
            body
         }) => {

            if (statusCode) {
               if (statusCode == 404) {
                  return res.status(statusCode).json({
                     status: statusCode,
                     msg: 'The catalogues are enmty'
                  });
               }

               let data = body.hits.hits.map(item => {
                  // console.log('item', item)
                  let product_id = item._source.product_id;
                  if (item._source.product_childs_product_id > 0) {
                     product_id = item._source.product_childs_product_id;
                  }
                  return {
                     channel: "tokopedia",
                     store_id: item._source.store_id,
                     store_name: item._source.store_name,
                     catalogue_id: item._id,
                     price: item._source.price,
                     sku: item._source.sku,
                     name: item._source.name,
                     params: {
                        shop_id: item._source.shop_id,
                        sku: item._source.sku,
                        product_id: product_id,
                        is_variation: item._source.is_variation,
                        product_childs_product_id: item._source.product_childs_product_id
                     }
                  }
               })
               return res.status(statusCode).json({
                  status: statusCode,
                  data: data
               });
            }
            return res.status(422).json({
               status: 422,
               msg: 'There was a missing or invalid parameter.'
            });
         })
         .catch(err => {
            resp.ResError(res, err)
         })
   }


   // handle get items sync master for stock 
   static GetDetailItemsStockSyncMasterCatalogue(req, res, next) {
      const {
         user_id,
         master_id
      } = req.params

      let query_stock = {
         query: {
            bool: {
               must: [{
                     match: {
                        user_id
                     }
                  },
                  {
                     match: {
                        master_id
                     }
                  },
                  {
                     match: {
                        sync_master: true
                     }
                  },
                  {
                     match: {
                        status_catalogue: true
                     }
                  },
               ],
            },
         },
      }

      // console.log('query_stock', query_stock)
      client
         .search({
            index: 'tokopedia_catalogues',
            type: '_doc',
            body: query_stock,
         })
         .then(({
            statusCode,
            body
         }) => {
            console.log('body', body)
            if (statusCode) {
               if (statusCode == 404) {
                  return res.status(statusCode).json({
                     status: statusCode,
                     msg: 'The catalogues are enmty'
                  });
               }
               let data = body.hits.hits.map(item => {
                  // console.log('item', item)
                  let product_id = item._source.product_id;
                  if (item._source.product_childs_product_id > 0) {
                     product_id = item._source.product_childs_product_id;
                  }
                  return {
                     channel: "tokopedia",
                     store_name: item._source.store_name,
                     store_id: item._source.store_id,
                     stock: item._source.stock,
                     price: item._source.price,
                     catalogue_id: item._id,
                     sku: item._source.sku,
                     name: item._source.name,
                     params: {
                        shop_id: item._source.shop_id,
                        sku: item._source.sku,
                        product_id: product_id,
                        is_variation: item._source.is_variation,
                        product_childs_product_id: item._source.product_childs_product_id
                     }
                  }
               })
               return res.status(statusCode).json({
                  status: statusCode,
                  data: data
               });
            }
            return res.status(422).json({
               status: 422,
               msg: 'There was a missing or invalid parameter.'
            });
         })
         .catch((err) => {
            resp.ResError(res, err)
         })
   }
}

module.exports = CatalogueSyncMaster
