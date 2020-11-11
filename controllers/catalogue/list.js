const client = require('../../middleware/els-client'),
	resp = require('../../middleware/response')


exports.GetListCatalogue = (req, res, next) => {

	// example parameter
	// {
	//     "from": 0,
	//     "size": 10,
	//     "sort": [
	//       {
	//         "create_date": "desc"
	//       }
	//     ],
	//     "query": {
	//       "bool": {
	//         "must": {
	//           "multi_match": {
	//             "query": "Ugreen",
	//             "fields": [
	//               "sku",
	//               "name"
	//             ],
	//             "type": "most_fields"
	//           }
	//         },
	//         "filter": [
	//           {
	//             "term": {
	//               "user_id": "5e282f561fecae0013a63f54"
	//             }
	//           },
	//           {
	//             "term": {
	//               "store_id": "5e2965f41b35310198be3331"
	//             }
	//           },
	//           {
	//             "term": {
	//               "sync_master": true
	//             }
	//           }
	//         ]
	//       }
	//     },
	//     "post_filter": {
	//       "bool": {
	//         "must": [
	//           {
	//             "bool": {
	//               "should": [
	//                 {
	//                   "range": {
	//                     "original_price": {
	//                       "gte": 30000,
	//                       "lte": 450000
	//                     }
	//                   }
	//                 }
	//               ]
	//             }
	//           },
	//           {
	//             "bool": {
	//               "should": [
	//                 {
	//                   "range": {
	//                     "create_date": {
	//                       "gte": 1579771381,
	//                       "lt": 15797713810
	//                     }
	//                   }
	//                 }
	//               ]
	//             }
	//           },
	//           {
	//             "bool": {
	//               "should": [
	//                 {
	//                   "range": {
	//                     "stock": {
	//                       "gte": 1,
	//                       "lt": 5
	//                     }
	//                   }
	//                 }
	//               ]
	//             }
	//           }
	//         ]
	//       }
	//     }
	//   }

	let {
		per_page,
		page
	} = req.params

	let {
		user_id,
		sort_by,
		order_by,
		store_id,
		sync_master,
		search,
		min_create_date,
		max_create_date,
		min_price,
		max_price,
		min_stock,
		max_stock
	} = req.body

	if (parseInt(per_page) > 20) {
		per_page = 10
	}

	let payload = {
		from: parseInt(page) * parseInt(per_page),
		size: parseInt(per_page),
		sort: [],
		query: {
			bool: {
				filter: [{
						term: {
							user_id
						}
					},
					{
						term: {
							status_catalogue: true
						}
					}
				]
			}
		},
		post_filter: {
			bool: {
				must: []
			}
		}
	}

	if (sort_by && sort_by !== "" && sort_by !== undefined) {
		let sort = {
			create_date: sort_by
		}

		if (order_by && order_by !== "" && order_by !== undefined) {
			if (order_by == 'sync_master') {
				sort = {
					sync_master: sort_by
				}
			} else if (order_by == 'price') {
				sort = {
					price: sort_by
				}
			} else if (order_by == 'sku') {
				sort = {
					"sku.keyword": sort_by
				}
			} else if (order_by == 'product_name') {
				sort = {
					"name.keyword": sort_by
				}
			} else if (order_by == 'store_name') {
				sort = {
					"store_name.keyword": sort_by
				}
			} else if (order_by == 'stock') {
				sort = {
					stock: sort_by
				}
			}
		}

		payload.sort.push(sort)
	} else {
		payload.sort.push({
			create_date: "desc"
		})
	}

	// for filter by store 
	if (store_id !== "" && store_id !== undefined) {
		payload.query.bool.filter.push({
			term: {
				store_id
			}
		})
	}

	// for filter by sync master
	if (sync_master !== "" && sync_master !== undefined) {
		payload.query.bool.filter.push({
			term: {
				sync_master
			}
		})
	} else if (sync_master === false) {
		payload.query.bool.filter.push({
			term: {
				sync_master
			}
		})
	}

	// for search old
	// if (search !== "" && search !== undefined) {
	// 	payload.query.bool = {
	// 		...payload.query.bool,
	// 		must: {
	// 			multi_match: {
	// 				query: search,
	// 				fields: ["sku", "name"],
	// 				type: "most_fields"
	// 			}
	// 		}
	// 	}
	// }

	// handle search new 

	if (search !== '' && search !== undefined) {
      payload.post_filter.bool.must.push({
        multi_match: {
            query: search,
          fields: ['sku','name','name.keyword','sku.keyword'],
          type:"phrase"
        }
      })
   }


	// for filter max and min create_date
	if (min_create_date !== "" && min_create_date !== undefined && max_create_date !== "" && max_create_date !== undefined) {
		payload.post_filter.bool.must.push({
			bool: {
				should: [{
					range: {
						create_date: {
							gte: min_create_date,
							lte: max_create_date
						}
					}
				}]
			}
		})
	}

	// for filter max and min price
	if (min_price !== "" && min_price !== undefined && max_price !== "" && max_price !== undefined) {
		payload.post_filter.bool.must.push({
			bool: {
				should: [{
					range: {
						price: {
							gte: min_price,
							lte: max_price
						}
					}
				}]
			}
		})
	}

	// for filter max and min stock
	if (min_stock !== "" && min_stock !== undefined && max_stock !== "" && max_stock !== undefined) {
		payload.post_filter.bool.must.push({
			bool: {
				should: [{
					range: {
						stock: {
							gte: min_stock,
							lte: max_stock
						}
					}
				}]
			}
		})
	}
	
	// console.log(JSON.stringify(payload, null, 2))


	client.search({
			index: 'tokopedia_catalogues',
			body: payload
		})
		.then(docs => {
			resp.ResData(res, docs)
		})
		.catch(err => {
			resp.ResError(res, err)
		})
}