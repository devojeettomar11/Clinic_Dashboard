const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  ownerName: { type: String },
  address: { type: String },
  city: { type: String },
  pinCode: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  type: { type: String, default: 'General' },
  mode: { type: String, default: 'In-person' },
  contactNumber: { type: String },
  licenseFileUrl: { type: String },
  openTime: { type: String, default: '09:00' },
  closeTime: { type: String, default: '19:00' },
  status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

clinicSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Clinic', clinicSchema);
