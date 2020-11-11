const express = require('express'),
    router = express.Router(),
    getList = require('../controllers/integration/list')

router.post("/list/:page/:per_page", getList.GetListIntegration);

module.exports = router;