const express = require("express");
const { claimCoupon } = require("../controllers/userController");

const router = express.Router();

router.post("/claim-coupon", claimCoupon);

module.exports = router;
