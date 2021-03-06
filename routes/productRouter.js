const router = require("express").Router();
const productCtrl = require("../controllers/productCtrl");
const auth = require("../middleware/authen");
const authAdmin = require("../middleware/authenAdmin");

router.get("/allproducts", productCtrl.getAllProducts);
router
  .route("/products")
  .get(productCtrl.getProducts)
  .post(auth, authAdmin, productCtrl.createProduct);

router
  .route("/products/:id")
  .get(productCtrl.getProductById)
  .delete(auth, authAdmin, productCtrl.deleteProduct)
  .put(auth, authAdmin, productCtrl.updateProduct);

router
  .route("/banners")
  .post(productCtrl.createBanner)
  .get(productCtrl.getListBanners);

router.patch("/rating/:id", productCtrl.reviews);

// router.patch('/products/discount/:id', productCtrl.discount)
router.patch("/products/event_disc", productCtrl.evenDiscount);
router.patch("/products/update_price_all", productCtrl.updatePriceAllProduct);
router.patch(
  "/products/update_category_all",
  productCtrl.updateCategoryAllProduct
);
router.patch(
  "/products/update_inventory_all",
  auth,
  authAdmin,
  productCtrl.updateInventoryAllProduct
);

router.get("/test1", productCtrl.getInventoryPopulate);
router.post("/inventory", productCtrl.addInventory);
router.get("/inventory", productCtrl.getInventory);

module.exports = router;
