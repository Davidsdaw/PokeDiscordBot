const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../events/database/models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlogchannel')
    .setDescription('🛠️ Configura el canal de logs del servidor')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option
        .setName('canal')
        .setDescription('Selecciona el canal para logs')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const channel = interaction.options.getChannel('canal');

    // Verifica que sea un canal de texto
    if (!channel.isTextBased()) {
      return interaction.reply({ content: 'Por favor selecciona un canal de texto válido.', flags: 64 });
    }

    let config = await GuildConfig.findOne({ guildId: interaction.guildId });
    if (!config) {
      config = new GuildConfig({ guildId: interaction.guildId });
    }

    config.logChannelId = channel.id;
    await config.save();

    return interaction.reply({ content: `Canal de logs establecido en ${channel}.`, flags: 64 });
  },
};
