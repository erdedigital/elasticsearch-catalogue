const router = require('express').Router(),
consumerCatalogue = require('./consumer-catalogue'),
consumerStore = require('./consumer-integrations')


consumerCatalogue.ConsumerCatalogueCreate();
consumerCatalogue.ConsumerCatalogueUpdate();
consumerCatalogue.ConsumerCatalogueDeleteByMultipleID();
consumerCatalogue.ConsumerCatalogueDeleteByStoreID();
consumerCatalogue.ConsumerCatalogueUpdateByMasterID();
consumerCatalogue.ConsumerCatalogueUpdateByStoreID();
consumerCatalogue.DeleteCatalogueByUserID();
consumerStore.ConsumerStoreUpdate();
consumerStore.ConsumerStoreCreate();
consumerStore.ConsumerStoreDeleteByID();
consumerStore.DeleteIntegrationsByUserID();
consumerStore.UpdateExpiresTokenAllStore();


module.exports = router;

