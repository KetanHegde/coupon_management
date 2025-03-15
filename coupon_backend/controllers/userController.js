const Coupon = require("../models/Coupon");

exports.claimCoupon = async (req, res) => {
  const { browserId } = req.body;
  const ipAddress = req.ip;

  if (req.cookies.claim_token) {
    return res
      .status(403)
      .json({ message: "You have already claimed a coupon in this session." });
  }

  const cooldownPeriod = 60 * 60 * 1000;

  const recentClaim = await Coupon.findOne({
    "claimed_by.ip_address": ipAddress,
    "claimed_by.claimed_at": { $gt: new Date(Date.now() - cooldownPeriod) },
  });

  if (recentClaim) {
    const oneHourLater = new Date(recentClaim.claimed_by.claimed_at);
    oneHourLater.setHours(oneHourLater.getHours() + 1);

    return res.status(403).json({
      message: `You can only claim one coupon per hour. Come after ${oneHourLater.toLocaleString(
        "en-GB",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      )}`,
    });
  }

  const coupon = await Coupon.findOne({ is_claimed: false, is_active: true });

  if (!coupon) {
    return res.status(404).json({ message: "No available coupons." });
  }

  coupon.is_claimed = true;
  coupon.claimed_by = {
    ip_address: ipAddress,
    browser_id: browserId,
    claimed_at: new Date(),
  };

  await coupon.save();

  res.cookie("claim_token", "claimed", { httpOnly: true, sameSite: "Strict" });
  res.json({ message: "Coupon claimed successfully!", coupon: coupon.code });
};
