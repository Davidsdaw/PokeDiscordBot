const GuildConfig = require('./database/models/GuildConfig');

module.exports = {
  name: 'guildCreate',
  async execute(guild) {
    try {
      const exists = await GuildConfig.findOne({ guildId: guild.id });
      if (!exists) {
        await GuildConfig.create({ guildId: guild.id });
        console.log(`🛠️ Config creada para el servidor: ${guild.name}`);
      }
    } catch (err) {
      console.error('❌ Error al crear configuración de servidor:', err);
    }
  }
};
