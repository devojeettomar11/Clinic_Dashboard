const mongoose = require('mongoose');

const workflowEventSchema = new mongoose.Schema({
  status: String,
  description: String,
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'LabTest' },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
  address: { type: String },
  scheduledDate: { type: Date },
  status: {
    type: String,
    enum: ['booked', 'assigned', 'sample_collected', 'in_analysis', 'report_ready', 'completed', 'cancelled'],
    default: 'booked',
  },
  assignedTechnician: { type: String },
  technicianId: { type: String },
  technicianPhone: { type: String },
  reportUrls: [{ type: String }],
  workflowHistory: [workflowEventSchema],
  amount: { type: Number, default: 0 },
}, { timestamps: true });

// Virtual id getter
bookingSchema.virtual('id').get(function () { return this._id.toHexString(); });
bookingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);
