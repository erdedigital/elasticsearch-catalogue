const client = require('../../middleware/els-client'),
resp = require('../../middleware/response')


exports.GetIndikatoCatalogue = (req, res, next) => {
	const {
		user_id
	} = req.body

	let queryIntegration = {
		index: 'tokopedia_integrations',
		type: '_doc',
		body: {
			query: {
				bool: {
					must: {
						match: {
							user_id
						}
					},
				},
			},
		}
	}

	client.search(queryIntegration)
		.then(async docs => {
			const stores = docs.body.hits.hits
			if (stores) {
				let result = stores.map(async store => {
					let queryCatalogue = {
						size: 0,
						query: {
							bool: {
								must: [{
										match: {
											store_id: store._id
										}
									},
									{
										match: {
											user_id
										}
									}
								]
							}
						},
						aggs: {
							sku: {
								terms: {
									field: "sku.keyword",
									size: 1,
									exclude: ["", " "]
								}
							},
							no_sku: {
								terms: {
									field: "sku.keyword",
									size: 1,
									include: ["", " "]
								}
							},
							sync_master: {
								terms: {
									field: "sync_master"
								}
							}
						}
					}

					const {
						body
					} = await client.search({
						index: 'tokopedia_catalogues',
						type: '_doc',
						body: queryCatalogue,
					})

					// example docs
					// {
					// 	"took": 14,
					// 	"timed_out": false,
					// 	"_shards": {
					// 		"total": 5,
					// 		"successful": 5,
					// 		"skipped": 0,
					// 		"failed": 0
					// 	},
					// 	"hits": {
					// 		"total": 84,
					// 		"max_score": 0.0,
					// 		"hits": []
					// 	},
					// 	"aggregations": {
					// 		"no_sku": {
					// 			"doc_count_error_upper_bound": 0,
					// 			"sum_other_doc_count": 0,
					// 			"buckets": [
					// 				{
					// 					"key": "",
					// 					"doc_count": 53
					// 				}
					// 			]
					// 		},
					// 		"sku": {
					// 			"doc_count_error_upper_bound": 0,
					// 			"sum_other_doc_count": 29,
					// 			"buckets": [
					// 				{
					// 					"key": "ANDROIDPORTABLE",
					// 					"doc_count": 1
					// 				}
					// 			]
					// 		},
					// 		"sync_master": {
					// 			"doc_count_error_upper_bound": 0,
					// 			"sum_other_doc_count": 0,
					// 			"buckets": [
					// 				{
					// 					"key": 0,
					// 					"key_as_string": "false",
					// 					"doc_count": 84
					// 				}
					// 			]
					// 		}
					// 	}
					// }

					let result = {
						store_id: store._id,
						channel: 'tokopedia',
						store_name: store._source.store_name,
						total: body.hits.total.value,
						sku_ada: body.aggregations.sku.sum_other_doc_count,
						sku_null: body.aggregations.no_sku.sum_other_doc_count,
						sync_true: 0,
						sync_false: 0
					}

					// handle if sku doc_count undefined & count
					if (body.aggregations.sku.buckets.length > 0) {
						result.sku_ada = result.sku_ada + body.aggregations.sku.buckets[0].doc_count
					}

					// handle if no_sku doc_count undefined & count 
					if (body.aggregations.no_sku.buckets.length > 0) {
						result.sku_null = result.sku_null + body.aggregations.no_sku.buckets[0].doc_count
					}

					// handle sync master
					if (body.aggregations.sync_master.buckets) {
						body.aggregations.sync_master.buckets.forEach(sync_master => {
							if (sync_master.key_as_string == 'true' && sync_master.key_as_string !== undefined) {
								result.sync_true = sync_master.doc_count
							}

							if (sync_master.key_as_string == 'false' && sync_master.key_as_string !== undefined) {
								result.sync_false = sync_master.doc_count
							}
						})
					}

					return result
				})

				await Promise.all(result).then(indikator => {
					res.status(200).json({
						status: 200,
						data: indikator
					})
				})

			} else {
				resp.ResData(res, docs)
			}
		}).catch(err => {
			if (err) resp.ResError(res, err)
		})
}