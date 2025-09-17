const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  company: { type: String },
  city: { type: String },
  state: { type: String },
  source: {
    type: String,
    enum: ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'],
    required: true,
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'lost', 'won'],
    required: true,
  },
  score: { type: Number, min: 0, max: 100, default: 0 },
  lead_value: { type: Number, default: 0 },
  last_activity_at: { type: Date },
  is_qualified: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },

});

// Ensure email is unique across all leads
leadSchema.index({ email: 1 }, { unique: true });

// Auto-update updated_at on updates
leadSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: Date.now() });
  next();
});

module.exports = mongoose.model('Lead', leadSchema);