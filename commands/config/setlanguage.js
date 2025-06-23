const { SlashCommandBuilder,PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../events/database/models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlanguage')
    .setDescription('🛠️ Cambia el idioma del bot en este servidor')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName('idioma')
        .setDescription('Idioma nuevo (es/en)')
        .setRequired(true)
        .addChoices(
          { name: 'Español', value: 'es' },
          { name: 'English', value: 'en' }
        )),
  async execute(interaction) {
    const lang = interaction.options.getString('idioma');

    try {
      const config = await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { language: lang },
        { new: true, upsert: true }
      );

      await interaction.reply(`Idioma cambiado a: \`${lang}\``);
    } catch (error) {
      console.error(error);
      await interaction.reply('Error al actualizar el idioma.');
    }
  },
};
