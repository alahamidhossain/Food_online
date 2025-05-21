const Coupon = require('../models/Coupon');

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
  try {
    const { code, discount_percent, valid_from, valid_until, active } = req.body;
    
    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }
    
    const coupon = await Coupon.create({
      code,
      discount_percent,
      valid_from: new Date(valid_from),
      valid_until: new Date(valid_until),
      active
    });
    
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort('-valid_until');
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get coupon by ID
// @route   GET /api/coupons/:id
// @access  Private/Admin
const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (coupon) {
      res.json(coupon);
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res) => {
  try {
    const { discount_percent, valid_from, valid_until, active } = req.body;
    
    const coupon = await Coupon.findById(req.params.id);
    
    if (coupon) {
      coupon.discount_percent = discount_percent || coupon.discount_percent;
      
      if (valid_from) {
        coupon.valid_from = new Date(valid_from);
      }
      
      if (valid_until) {
        coupon.valid_until = new Date(valid_until);
      }
      
      coupon.active = active !== undefined ? active : coupon.active;
      
      const updatedCoupon = await coupon.save();
      res.json(updatedCoupon);
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (coupon) {
      await coupon.deleteOne();
      res.json({ message: 'Coupon removed' });
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    
    const coupon = await Coupon.findOne({ 
      code,
      active: true,
      valid_from: { $lte: new Date() },
      valid_until: { $gte: new Date() }
    });
    
    if (coupon) {
      res.json({
        valid: true,
        discount_percent: coupon.discount_percent
      });
    } else {
      res.json({
        valid: false,
        message: 'Invalid or expired coupon code'
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon
};
