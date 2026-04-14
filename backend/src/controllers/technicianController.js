const Technician = require('../models/Technician');

const getClinicId = (req) => req.user.clinic?._id || req.user.clinic;

exports.getTechnicians = async (req, res) => {
  try {
    const techs = await Technician.find({ clinic: getClinicId(req), isActive: true });
    res.json({ success: true, data: techs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
