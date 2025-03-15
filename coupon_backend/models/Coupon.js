const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, 
  is_claimed: { type: Boolean, default: false }, 
  claimed_by: { 
    ip_address: { type: String, default: null }, 
    browser_id: { type: String, default: null }, 
    claimed_at: { type: Date, default: null }
  },
  is_active: { type: Boolean, default: true } 
});

module.exports = mongoose.model("Coupon", couponSchema);
