const Booking = require('../models/Booking');

const getClinicId = (req) => req.user.clinic?._id || req.user.clinic;

exports.getRevenueSummary = async (req, res) => {
  try {
    const clinicId = getClinicId(req);
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [daily, weekly, monthly, total] = await Promise.all([
      Booking.aggregate([{ $match: { clinic: clinicId, status: 'completed', createdAt: { $gte: startOfDay } } }, { $group: { _id: null, sum: { $sum: '$amount' } } }]),
      Booking.aggregate([{ $match: { clinic: clinicId, status: 'completed', createdAt: { $gte: startOfWeek } } }, { $group: { _id: null, sum: { $sum: '$amount' } } }]),
      Booking.aggregate([{ $match: { clinic: clinicId, status: 'completed', createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, sum: { $sum: '$amount' } } }]),
      Booking.aggregate([{ $match: { clinic: clinicId, status: 'completed' } }, { $group: { _id: null, sum: { $sum: '$amount' } } }]),
    ]);

    res.json({
      success: true,
      data: {
        daily: daily[0]?.sum || 0,
        weekly: weekly[0]?.sum || 0,
        monthly: monthly[0]?.sum || 0,
        total: total[0]?.sum || 0,
      },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getRevenueTransactions = async (req, res) => {
  try {
    const { period = 'monthly', page = 1, limit = 10 } = req.query;
    const clinicId = getClinicId(req);
    const now = new Date();
    let startDate;
    if (period === 'daily') startDate = new Date(now.setHours(0, 0, 0, 0));
    else if (period === 'weekly') { startDate = new Date(now); startDate.setDate(now.getDate() - 7); }
    else { startDate = new Date(now.getFullYear(), now.getMonth(), 1); }

    const filter = { clinic: clinicId, status: 'completed', createdAt: { $gte: startDate } };
    const docs = await Booking.find(filter)
      .populate('user', 'name')
      .populate('test', 'name')
      .populate('package', 'name')
      .skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });

    const total = await Booking.countDocuments(filter);

    const formatted = docs.map((b) => ({
      id: b._id,
      user: { name: b.user?.name || 'Unknown' },
      test: b.test?.name || b.package?.name || 'N/A',
      date: b.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      amount: b.amount,
      type: b.test ? 'test' : 'package',
    }));

    res.json({ success: true, data: { docs: formatted, totalPages: Math.ceil(total / limit), total } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
