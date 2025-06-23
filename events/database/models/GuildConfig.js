const mongoose = require('mongoose');

const guildConfigSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true
  },
  language: {
    type: String,
    default: 'es'
  },
  logChannelId: {
    type: String,
    default: null
  },
  modRoleId: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  verifyChannelId: {
    type: String,
    default: null
  },
  memberRoleId: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('GuildConfig', guildConfigSchema);

