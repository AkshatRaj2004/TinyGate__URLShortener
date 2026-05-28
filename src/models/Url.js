const mongoose = require('mongoose');

// ── Analytics sub-document ────────────────────────────────────────────────────
const clickSchema = new mongoose.Schema(
  {
    ip: { type: String, default: 'unknown' },
    browser: { type: String, default: 'unknown' },
    os: { type: String, default: 'unknown' },
    device: { type: String, default: 'unknown' },
    country: { type: String, default: 'unknown' },
    referrer: { type: String, default: 'direct' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ── URL document ──────────────────────────────────────────────────────────────
const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customAlias: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    analytics: [clickSchema],
  },
  { timestamps: true }
);

// Automatically deactivate expired URLs on read
urlSchema.pre(/^find/, function (next) {
  this.where({
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  });
  next();
});

module.exports = mongoose.model('Url', urlSchema);
