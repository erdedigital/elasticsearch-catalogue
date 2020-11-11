const router = require('express').Router()
const catalogue = require('./catalogue'),
integration = require('./integration')

router.use("/catalogue", catalogue)
router.use("/integration", integration)

module.exports = router