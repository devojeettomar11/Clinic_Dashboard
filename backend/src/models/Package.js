const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  offerPrice: { type: Number, required: true },
  includes: [{ type: String }],
  description: { type: String },
  isActive: { type: Boolean, default: true },
  bookings: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);
