const express = require('express');
const router = express.Router({ mergeParams: true});
const CreditController = require('../controller/CreditController');
const { authMiddleware } = require('./userMiddleWare');

router.use(authMiddleware);
router.route('/')
  .post(CreditController.create)
  .get(CreditController.getAll);

router.route('/:id')
  .put(CreditController.update)
  .delete(CreditController.delete);

router.route('/:id/balance')
  .put(CreditController.adjustBalance);

module.exports = router;