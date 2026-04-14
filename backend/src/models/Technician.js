const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema({
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  name: { type: String, required: true },
  phone: { type: String },
  employeeId: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

technicianSchema.virtual('id').get(function () { return this._id.toHexString(); });
technicianSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Technician', technicianSchema);
