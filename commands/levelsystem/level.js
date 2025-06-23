const { SlashCommandBuilder } = require('discord.js');
const UserLevel = require('../../events/database/models/UserLevel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('Muestra tu nivel y XP en este servidor'),

  async execute(interaction) {
    try {
      const userLevel = await UserLevel.findOne({ guildId: interaction.guild.id, userId: interaction.user.id });

      if (!userLevel) {
        return interaction.reply({ content: 'No tienes XP todavía. ¡Empieza a participar!', ephemeral: true });
      }

      const xpNeeded = userLevel.level * 100;

      await interaction.reply({
        content: `Tu nivel es **${userLevel.level}**\nXP: ${userLevel.xp} / ${xpNeeded}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error al obtener nivel:', error);
      await interaction.reply({ content: '❌ Error al obtener tu nivel.', ephemeral: true });
    }
  },
};
