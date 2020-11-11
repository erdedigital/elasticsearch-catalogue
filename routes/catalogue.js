const express = require('express'),
   router = express.Router(),
   getListCatalogue = require('../controllers/catalogue/list'),
   catalogueSyncMaster = require('../controllers/catalogue/detail-items-sync-master'),
   indikatorCatalogue = require('../controllers/catalogue/indikator')

router.post("/list/:page/:per_page", getListCatalogue.GetListCatalogue);
router.get("/detail-items-price-sync-master/:user_id/:master_id", catalogueSyncMaster.GetDetailItemsPriceSyncMasterCatalogue);
router.get("/detail-items-stock-sync-master/:user_id/:master_id", catalogueSyncMaster.GetDetailItemsStockSyncMasterCatalogue);
router.post("/marketplace", indikatorCatalogue.GetIndikatoCatalogue);

module.exports = router;