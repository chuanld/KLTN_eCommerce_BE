const router = require("express").Router();
const categoryCtrl = require("../controllers/categoryCtrl");
const auth = require("../middleware/authen");
const authAdmin = require("../middleware/authenAdmin");

router
  .route("/category")
  .get(categoryCtrl.getCategories)
  .post(auth, authAdmin, categoryCtrl.createCategory);

router
  .route("/category/:id")
  .get(categoryCtrl.getCategoryById)
  .delete(auth, authAdmin, categoryCtrl.deleteCategory)
  .put(auth, authAdmin, categoryCtrl.updateCategory);

module.exports = router;
