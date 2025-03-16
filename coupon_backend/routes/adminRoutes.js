const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", adminController.registerAdmin);

router.post("/login", adminController.adminLogin);
router.post("/logout",authMiddleware, adminController.adminLogout);

router.get("/coupons", authMiddleware, adminController.getAllCoupons);
router.post("/coupon", authMiddleware, adminController.addCoupon);
router.put("/coupon/toggle/:id", authMiddleware, adminController.toggleCoupon);
router.get("/claims", authMiddleware, adminController.getClaimHistory);
router.delete("/coupon/delete/:id", authMiddleware, adminController.deleteCoupon);
router.put("/coupon/update/:id", authMiddleware, adminController.updateCoupon);

module.exports = router;
