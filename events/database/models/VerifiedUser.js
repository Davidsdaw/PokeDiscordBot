// models/VerifiedUser.js
const mongoose = require('mongoose');

const verifiedUserSchema = new mongoose.Schema({
  guildId: String,
  userId: String,
  verifiedAt: Date,
});

module.exports = mongoose.model('VerifiedUser', verifiedUserSchema);
