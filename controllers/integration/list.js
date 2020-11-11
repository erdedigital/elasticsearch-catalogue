const client = require('../../middleware/els-client'),
    resp = require('../../middleware/response')


exports.GetListIntegration = (req, res, next) => {

    let per_page = parseInt(req.params.per_page)
	if (per_page > 20) {
		per_page = 10
	}

	let payload = {
		from: parseInt(req.params.page) * parseInt(per_page),
		size: per_page,
		sort: [],
		query: {
			bool: {
				filter: [{
						term: {
							user_id: req.body.user_id
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

	if (req.body.sort_by && req.body.sort_by !== "" && req.body.sort_by !== undefined) {
		let sort = {
			create_date: req.body.sort_by
		}

		if (req.body.order_by && req.body.order_by !== "" && req.body.order_by !== undefined) {
			if (req.body.order_by == 'status') {
				sort = {
					status: req.body.sort_by
				}
			} else if (req.body.order_by == 'expire_date') {
				sort = {
					expire_date: req.body.sort_by
				}
			}
		}

		payload.sort.push(sort)
	} else {
		payload.sort.push({
			create_date: "desc"
		})
	}

	// handle filter by status
	if (req.body.status !== "" && req.body.status !== undefined) {
		payload.query.bool.filter.push({
			term: {
				status: req.body.status
			}
		})
    }
    
    // handle filter min and max create_date
	if (req.body.min_create_date !== "" && req.body.min_create_date !== undefined && req.body.max_create_date !== "" && req.body.max_create_date !== undefined) {
		payload.post_filter.bool.must.push({
			bool: {
				should: [{
					range: {
						create_date: {
							gte: req.body.min_create_date,
							lte: req.body.max_create_date
						}
					}
				}]
			}
		})
    }
    
    // handle filter min and max expire_date
	if (req.body.min_expire_date !== "" && req.body.min_expire_date !== undefined && req.body.max_expire_date !== "" && req.body.max_expire_date !== undefined) {
		payload.post_filter.bool.must.push({
			bool: {
				should: [{
					range: {
						expire_date: {
							gte: req.body.min_expire_date,
							lte: req.body.max_expire_date
						}
					}
				}]
			}
		})
	}

	// for search
	if (req.body.search !== "" && req.body.search !== undefined) {
		payload.query.bool = {
			...payload.query.bool,
			must: {
				multi_match: {
					query: req.body.search,
					fields: ["store_name"],
					type: "most_fields"
				}
			}
		}
	}

	// console.log('req.body.search', req.body)

	// console.log('body', JSON.stringify(payload, null, 2))

    // return res.status(200).json(payload)

    client.search({
        index: 'tokopedia_integrations',
        body: payload
    })
    .then(docs => {
        resp.ResData(res, docs)
    })
    .catch(err => {
        resp.ResError(res, err)
    })
}