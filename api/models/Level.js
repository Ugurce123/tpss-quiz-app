const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true,
    unique: true,
    min: 1
  },
  description: {
    type: String,
    default: ''
  },
  minScore: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    default: 100
  },
  passingScore: {
    type: Number,
    default: 70
  },
  timeLimit: {
    type: Number, // dakika cinsinden
    default: 30
  },
  questionCount: {
    type: Number,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true
  },
  prerequisites: [{
    type: Number // önceki seviye numaraları
  }],
  rewards: {
    points: {
      type: Number,
      default: 0
    },
    badge: {
      type: String,
      default: ''
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

levelSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Level', levelSchema);