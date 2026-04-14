const LabTest = require('../models/LabTest');

const getClinicId = (req) => req.user.clinic?._id || req.user.clinic;

exports.getLabTests = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const clinicId = getClinicId(req);
    const docs = await LabTest.find({ clinic: clinicId })
      .skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await LabTest.countDocuments({ clinic: clinicId });
    res.json({ success: true, data: { docs, totalPages: Math.ceil(total / limit), total } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getLabTestById = async (req, res) => {
  try {
    const test = await LabTest.findOne({ _id: req.params.id, clinic: getClinicId(req) });
    if (!test) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: test });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createLabTest = async (req, res) => {
  try {
    const test = await LabTest.create({ ...req.body, clinic: getClinicId(req) });
    res.status(201).json({ success: true, data: test });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateLabTest = async (req, res) => {
  try {
    const test = await LabTest.findOneAndUpdate(
      { _id: req.params.id, clinic: getClinicId(req) },
      req.body, { new: true, runValidators: true }
    );
    if (!test) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: test });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteLabTest = async (req, res) => {
  try {
    await LabTest.findOneAndDelete({ _id: req.params.id, clinic: getClinicId(req) });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
