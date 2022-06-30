const router = require("express").Router();
const userCtrl = require("../controllers/userController");
const auth = require("../middleware/authen");
const authAdmin = require("../middleware/authenAdmin");

router.post("/register", userCtrl.register);

//new
router.post("/activation", userCtrl.activation);

router.post("/login", userCtrl.login);

router.get("/logout", userCtrl.logout);

router.get("/refresh_token", userCtrl.refreshToken);

//new
router.post("/forgot", userCtrl.forgotPassword);

//new
router.post("/reset", auth, userCtrl.resetPassword);

router.patch("/change", auth, userCtrl.changePassword);

router.get("/infor", auth, userCtrl.getUser);

router.get("/all_users", auth, authAdmin, userCtrl.getAllUserLists);

//new
router.get("/all_infor", auth, authAdmin, userCtrl.getAllUsers);
router.get("/infor_byId/:id", auth, authAdmin, userCtrl.getInfoById);

router.post("/create_infor", auth, authAdmin, userCtrl.createUser);

//new
router.patch("/update", auth, userCtrl.updateUser);
//new
router.patch("/all_update/:id", auth, authAdmin, userCtrl.updateAllUsers);

//new
router.delete("/delete/:id", auth, authAdmin, userCtrl.deleteUsers);

//addCart
router.patch("/addtocart", auth, userCtrl.addtoCart);

//DeleteCart
router.delete("/delete_cart", auth, userCtrl.deleteCart);
router.delete("/delete_cart/:id", auth, userCtrl.deleteCartById);

//Order
router.get("/order_infor", auth, userCtrl.orderInfo);
router.get("/order_infor/:id", auth, userCtrl.orderInfoDetailByID);
router.patch("/order_infor/:id", auth, userCtrl.cancelOrder);

//login with social
router.post("/login_google", userCtrl.loginGoogle);

router.post("/register_google", userCtrl.registerGoogle);

router.post("/login_facebook", userCtrl.loginFacebook);

router.post("/register_facebook", userCtrl.registerFacebook);

module.exports = router;
