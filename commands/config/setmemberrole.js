const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../events/database/models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setmemberrole')
    .setDescription('🔐 Establece el rol que se dará al verificar')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption(option =>
      option.setName('rol')
        .setDescription('Rol para miembros verificados')
        .setRequired(true)),
  async execute(interaction) {
    const rol = interaction.options.getRole('rol');

    let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!config) config = new GuildConfig({ guildId: interaction.guild.id });

    config.memberRoleId = rol.id;
    await config.save();

    await interaction.reply({ content: `✅ Rol de miembro establecido: ${rol}`, ephemeral: true });
  }
};
