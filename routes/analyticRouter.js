const router = require("express").Router();
const analyticCtrl = require("../controllers/analyticCtrl");
const auth = require("../middleware/authen");
const authAdmin = require("../middleware/authenAdmin");

router.get("/analytic", analyticCtrl.getAnalytics);
module.exports = router;
