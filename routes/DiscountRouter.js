const router = require('express').Router()
const discountCtrl = require('../controllers/DiscountCtrl')
const auth = require('../middleware/authen')
const authAdmin = require('../middleware/authenAdmin')

router
  .route('/discount')
  .get(auth, discountCtrl.getVouchers)
  .post(auth, discountCtrl.createVoucher)

router.patch('/discount/:id', auth, discountCtrl.updateVoucher)
router.post('/discount/checkvalid', discountCtrl.checkValidDiscount)
module.exports = router
