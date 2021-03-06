const router = require("express").Router();
const discountCtrl = require("../controllers/discountCtrl");
const auth = require("../middleware/authen");

router
  .route("/discount")
  .get(auth, discountCtrl.getVouchers)
  .post(auth, discountCtrl.createVoucher);

router.patch("/discount/:id", auth, discountCtrl.updateVoucher);
router.delete("/discount/:id", auth, discountCtrl.deleteVoucher);
router.post("/discount/checkvalid", discountCtrl.checkValidDiscount);
module.exports = router;
