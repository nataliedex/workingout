const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const profileController = require("../controllers/profile");
const homeController = require("../controllers/home");
const { ensureAuth, ensureGuest } = require("../middleware/auth");
const upload = require("../middleware/multer");

//Main Routes - simplified for now
// router.get("/profile", ensureAuth, profileController.getProfile);
// router.post("/update-about", profileController.postUpdateAbout);
// router.post("/update-image", upload.single("file"), profileController.postUpdateImage);

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

router.get("/", homeController.getIndex);



module.exports = router;
