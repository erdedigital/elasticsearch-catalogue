module.exports = {
    ResData: (res, docs) => {
        let {
            statusCode,
            body
        } = docs

        if (statusCode) {

            // handle doc enmty
            if (statusCode == 404) {
                return res.status(statusCode).json({
                    status: statusCode,
                    msg: 'The catalogues are enmty'
                });
            }

            // result handel
            let result = {
                status: statusCode,
                data: {}
            }

            //  handle count
            if (body.hits) {
                let count;
                if (body.hits.total.value > 0) {
                    count = body.hits.total.value
                } else {
                  count = body.hits.total.value
                }
                result.data.count = count
        

                // handle items list docs
                if (body.hits.hits) {
                    result.data.items = body.hits.hits.map(item => {
                        return {
                            _id: item._id,
                            ...item._source
                        }
                    })
                }
            } else if (body._source) { // handle detail
                result.data = {
                    _id: body._id,
                    ...body._source
                }
            }

            return res.status(statusCode).json(result)
        }

        return res.status(422).json({
            status: 422,
            msg: 'There was a missing or invalid parameter.'
        });
    },
    ResError: (res, err) => {
        // console.log("err", err)
        let {
            body,
            statusCode
        } = err
        if (statusCode) {
            if (statusCode == 404) {
                return res.status(statusCode).json({
                    status: statusCode,
                    msg: 'The catalogue id is enmty'
                });
            } else if (statusCode == 400) {
                return res.status(statusCode).json({
                    status: statusCode,
                    msg: 'There was a missing or invalid parameter.'
                });
            }
            return res.status(statusCode).json(body);
        } else if (err.name == "ConnectionError") {
            return res.status(500).json({
                status: 500,
                msg: 'ConnectionError for elasticSearch.'
            })
        }
        return res.status(422).json({
            status: 422,
            msg: 'There was a missing or invalid parameter.'
        });
    }
}