const router = require("express").Router();
const logCtrl = require("../controllers/logCtrl");
const auth = require("../middleware/authen");
const authAdmin = require("../middleware/authenAdmin");

router.route("/log").get(auth, authAdmin, logCtrl.getLog);

router.patch("/log/:id", auth, authAdmin, logCtrl.updateLog);

module.exports = router;
