const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  // Yeni sistem: clean veya dirty
  correctAnswer: {
    type: String,
    enum: ['clean', 'dirty'],
    required: true
  },
  // Kirli bagaj için sebep (sadece correctAnswer='dirty' ise gerekli)
  dirtyReason: {
    type: String,
    enum: ['explosive_device', 'weapon_parts', 'sharp_objects', 'martial_arts_equipment', 'gas_bomb'],
    required: function() {
      return this.correctAnswer === 'dirty';
    }
  },
  // Admin tarafından belirlenen kirli seçenekleri
  dirtyOptions: [{
    value: {
      type: String,
      enum: ['explosive_device', 'weapon_parts', 'sharp_objects', 'martial_arts_equipment', 'gas_bomb']
    },
    label: String
  }],
  level: {
    type: Number,
    required: true,
    min: 1
  },
  points: {
    type: Number,
    default: 10
  },
  image: {
    type: String,
    default: null
  },
  explanation: {
    type: String,
    default: ''
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: {
    type: String,
    default: 'general'
  },
  isActive: {
    type: Boolean,
    default: true
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

questionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Question', questionSchema);