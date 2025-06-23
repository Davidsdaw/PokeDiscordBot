const GuildConfig = require('./database/models/GuildConfig');
const VerifiedUser = require('./database/models/VerifiedUser');

module.exports = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember) {
    try {
      if (oldMember.roles.cache.size === newMember.roles.cache.size) return;

      const guildConfig = await GuildConfig.findOne({ guildId: newMember.guild.id });
      if (!guildConfig || !guildConfig.memberRoleId) return;

      const hadRole = oldMember.roles.cache.has(guildConfig.memberRoleId);
      const hasRole = newMember.roles.cache.has(guildConfig.memberRoleId);

      if (!hadRole && hasRole) {
        // Se le dio el rol, guardamos la fecha
        await VerifiedUser.findOneAndUpdate(
          { guildId: newMember.guild.id, userId: newMember.id },
          { verifiedAt: new Date() },
          { upsert: true }
        );
      }
    } catch (error) {
      console.error('Error guardando fecha de verificación:', error);
    }
  }
};
