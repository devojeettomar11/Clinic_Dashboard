const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password').populate('clinic');
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Token invalid' });
  }
};

const clinicAdmin = (req, res, next) => {
  if (req.user?.role !== 'clinic') {
    return res.status(403).json({ success: false, message: 'Clinic admins only' });
  }
  next();
};

module.exports = { protect, clinicAdmin };
