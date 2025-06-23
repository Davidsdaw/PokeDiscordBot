const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../events/database/models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setmodrole')
    .setDescription('🛠️ Configura el rol de moderadores del servidor')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption(option =>
      option
        .setName('rol')
        .setDescription('Selecciona el rol de moderadores')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const role = interaction.options.getRole('rol');

    let config = await GuildConfig.findOne({ guildId: interaction.guildId });
    if (!config) {
      config = new GuildConfig({ guildId: interaction.guildId });
    }

    config.modRoleId = role.id;
    await config.save();

    return interaction.reply({ content: `Rol de moderadores establecido en ${role.name}.`, flags: 64 });
  },
};