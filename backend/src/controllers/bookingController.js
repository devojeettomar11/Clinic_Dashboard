const Booking = require('../models/Booking');
const path = require('path');

const getClinicId = (req) => req.user.clinic?._id || req.user.clinic;

exports.getBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { clinic: getClinicId(req) };
    if (status) filter.status = status;
    const docs = await Booking.find(filter)
      .populate('user', 'name phone email')
      .populate('test', 'name price category')
      .populate('package', 'name offerPrice')
      .skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await Booking.countDocuments(filter);
    res.json({ success: true, data: { docs, totalPages: Math.ceil(total / limit), total } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name phone email')
      .populate('test', 'name price category')
      .populate('package', 'name offerPrice');
    if (!booking) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: booking });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.assignTechnician = async (req, res) => {
  try {
    const { technicianId, technicianName, technicianPhone } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        assignedTechnician: technicianName,
        technicianId,
        technicianPhone,
        status: 'assigned',
        $push: { workflowHistory: { status: 'assigned', description: `Technician ${technicianName} assigned` } },
      },
      { new: true }
    ).populate('user', 'name phone').populate('test', 'name price').populate('package', 'name offerPrice');
    res.json({ success: true, data: booking });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, description } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: { workflowHistory: { status, description: description || `Status updated to ${status}` } },
      },
      { new: true }
    ).populate('user', 'name phone').populate('test', 'name price').populate('package', 'name offerPrice');
    res.json({ success: true, data: booking });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.uploadReport = async (req, res) => {
  try {
    const files = req.files || [];
    const urls = files.map((f) => `/uploads/${f.filename}`);
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: 'report_ready',
        $push: {
          reportUrls: { $each: urls },
          workflowHistory: { status: 'report_ready', description: `${files.length} report(s) uploaded` },
        },
      },
      { new: true }
    ).populate('user', 'name phone').populate('test', 'name price').populate('package', 'name offerPrice');
    res.json({ success: true, data: booking });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: 'cancelled',
        $push: { workflowHistory: { status: 'cancelled', description: 'Booking cancelled' } },
      },
      { new: true }
    );
    res.json({ success: true, data: booking });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMyBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const docs = await Booking.find({ user: req.user._id })
      .populate('test', 'name price').populate('package', 'name offerPrice')
      .populate('clinic', 'name').skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await Booking.countDocuments({ user: req.user._id });
    res.json({ success: true, data: { docs, totalPages: Math.ceil(total / limit), total } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
