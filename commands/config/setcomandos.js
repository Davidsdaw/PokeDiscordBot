const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const GuildConfig = require('../../events/database/models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setcomandos')
    .setDescription('📌 Establece el canal donde se pueden usar ciertos comandos')
    .addChannelOption(option =>
      option
        .setName('canal')
        .setDescription('Canal permitido para ejecutar comandos')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const canal = interaction.options.getChannel('canal');

    try {
      // Actualiza o crea el registro de configuración del servidor
      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { allowedCommandChannelId: canal.id },
        { upsert: true, new: true }
      );

      await interaction.reply({
        content: `✅ Canal de comandos restringidos establecido en <#${canal.id}>.`,
        ephemeral: true
      });
    } catch (error) {
      console.error('Error al guardar canal de comandos:', error);
      await interaction.reply({
        content: '❌ Ocurrió un error al establecer el canal de comandos.',
        ephemeral: true
      });
    }
  }
};
