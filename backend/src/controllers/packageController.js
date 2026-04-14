const Package = require('../models/Package');

const getClinicId = (req) => req.user.clinic?._id || req.user.clinic;

exports.getPackages = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const clinicId = getClinicId(req);
    const docs = await Package.find({ clinic: clinicId })
      .skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await Package.countDocuments({ clinic: clinicId });
    res.json({ success: true, data: { docs, totalPages: Math.ceil(total / limit), total } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findOne({ _id: req.params.id, clinic: getClinicId(req) });
    if (!pkg) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: pkg });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createPackage = async (req, res) => {
  try {
    const pkg = await Package.create({ ...req.body, clinic: getClinicId(req) });
    res.status(201).json({ success: true, data: pkg });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updatePackage = async (req, res) => {
  try {
    const pkg = await Package.findOneAndUpdate(
      { _id: req.params.id, clinic: getClinicId(req) },
      req.body, { new: true, runValidators: true }
    );
    if (!pkg) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: pkg });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deletePackage = async (req, res) => {
  try {
    await Package.findOneAndDelete({ _id: req.params.id, clinic: getClinicId(req) });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.togglePackageStatus = async (req, res) => {
  try {
    const pkg = await Package.findOne({ _id: req.params.id, clinic: getClinicId(req) });
    if (!pkg) return res.status(404).json({ success: false, message: 'Not found' });
    pkg.isActive = !pkg.isActive;
    await pkg.save();
    res.json({ success: true, data: pkg });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
