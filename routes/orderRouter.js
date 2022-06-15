const router = require("express").Router();
const orderCtrl = require("../controllers/orderCtrl");
const auth = require("../middleware/authen");
const authAdmin = require("../middleware/authenAdmin");

router
  .route("/order")
  .get(auth, authAdmin, orderCtrl.getOrder)
  .post(auth, orderCtrl.createOrder);
router.patch("/order/:id", auth, authAdmin, orderCtrl.updateStatus);

router.post("/payment/create_payment_url", auth, orderCtrl.payVnpay);
router.get("/payment/vnpay_ipn", auth, orderCtrl.payVnpayCallback);
module.exports = router;
