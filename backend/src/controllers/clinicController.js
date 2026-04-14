const Clinic = require('../models/Clinic');
const User = require('../models/User');
const path = require('path');

exports.getMyClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findOne({ owner: req.user._id });
    res.json({ success: true, data: clinic || null });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.setupClinic = async (req, res) => {
  try {
    let clinic = await Clinic.findOne({ owner: req.user._id });
    if (clinic) {
      Object.assign(clinic, req.body);
      await clinic.save();
    } else {
      clinic = await Clinic.create({ ...req.body, owner: req.user._id });
      await User.findByIdAndUpdate(req.user._id, { clinic: clinic._id });
    }
    res.json({ success: true, data: clinic });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.uploadClinicLicense = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const fileUrl = `/uploads/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, { licenseUrl: fileUrl });
    res.json({ success: true, data: { fileUrl } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
