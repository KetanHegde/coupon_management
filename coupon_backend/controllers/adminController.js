const Admin = require("../models/Admin");
const Coupon = require("../models/Coupon");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

exports.registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) return res.status(400).json({ message: "Admin already exists" });
    
    bcrypt.genSalt(saltRounds, function (err, salt) {
        if (err) {
            console.error("Error generating salt:", err);
            return;
        }
    
        bcrypt.hash(password, salt, async function (err, hash) {
            if (err) {
                console.error("Error hashing password:", err);
                return;
            }
    
            try {
                const newAdmin = new Admin({ username: "admin", password: hash });
                await newAdmin.save();
            } catch (error) {
                console.error("Error saving admin:", error);
            }
        });
    });

    res.json({ message: "Admin registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error registering admin", error });
  }
};

exports.adminLogin = async (req, res) => {
    try {
      const { username, password } = req.body;
  
      const admin = await Admin.findOne({ username });
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign(
        { id: admin._id, username },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1h" }
      );
  
      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: "Error during login", error });
    }
  };

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving coupons", error });
  }
};

exports.addCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "Coupon code is required" });

    const newCoupon = new Coupon({ code, is_claimed: false, is_active: true });
    await newCoupon.save();
    res.json({ message: "Coupon added successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error adding coupon", error });
  }
};

exports.toggleCoupon = async (req, res) => {
    try {
      const { id } = req.params; // Get coupon ID from URL params
      const { is_active } = req.body;
  
      if (is_active === undefined) {
        return res.status(400).json({ message: "is_active field is required" });
      }
  
      const updatedCoupon = await Coupon.findByIdAndUpdate(
        id,
        { is_active },
        { new: true }
      );
  
      if (!updatedCoupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
  
      res.json({ message: "Coupon updated successfully!", coupon: updatedCoupon });
    } catch (error) {
      res.status(500).json({ message: "Error updating coupon", error });
    }
  };
  

  exports.getClaimHistory = async (req, res) => {
    try {
      // Fetch claimed coupons
      const claimedCoupons = await Coupon.find({ is_claimed: true }).sort({ "claimed_by.claimed_at": -1 });
  
      // Aggregate data by IP address
      const claimStats = claimedCoupons.reduce((acc, coupon) => {
        const ip = coupon.claimed_by?.ip_address || "Unknown";
  
        if (!acc[ip]) {
          acc[ip] = { count: 0, coupons: [] };
        }
  
        acc[ip].count += 1;
        acc[ip].coupons.push(coupon.code || "Unnamed Coupon");
  
        return acc;
      }, {});
  
      // Transform the data into an array for easier frontend usage
      const result = Object.entries(claimStats).map(([ip, details]) => ({
        ip_address: ip,
        total_claimed: details.count,
        coupons: details.coupons,
      }));
  
      res.json({ claimHistory: claimedCoupons, claimStats: result });
    } catch (error) {
      res.status(500).json({ message: "Error fetching claim history", error });
    }
  };
  



exports.deleteCoupon = async (req, res) => {
    try {
      const { id } = req.params;
  
      const result = await Coupon.deleteOne({ _id: id });
  
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Coupon not found" });
      }
  
      res.json({ message: "Coupon deleted successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting coupon", error: error.message });
    }
  };
  


  exports.updateCoupon = async (req, res) => {
    try {
      const { id } = req.params;
      const { newCode } = req.body;
  
      if (!newCode) {
        return res.status(400).json({ message: "New coupon code is required" });
      }
  
      const updatedCoupon = await Coupon.findByIdAndUpdate(
        id,
        { code: newCode },
      );
  
      if (!updatedCoupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
  
      res.json({ message: "Coupon updated successfully!", coupon: updatedCoupon });
    } catch (error) {
      res.status(500).json({ message: "Error updating coupon", error: error.message });
    }
  };


  exports.adminLogout = async (req, res) => {
    try {
      res.clearCookie("token");
      res.json({ message: "Admin logged out successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error during logout", error });
    }
  };
  
