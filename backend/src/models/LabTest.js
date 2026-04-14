const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  turnaround: { type: String, default: '24 hrs' },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  bookings: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('LabTest', labTestSchema);
