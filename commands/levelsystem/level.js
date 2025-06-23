const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserLevel = require('../../events/database/models/UserLevel');
const GuildConfig = require('../../events/database/models/GuildConfig'); // Asegúrate de que esté bien importado

function getProgressBar(currentXp, xpNeeded) {
  const totalBlocks = 10;
  const percentage = currentXp / xpNeeded;
  const filledBlocks = Math.round(totalBlocks * percentage);
  const emptyBlocks = totalBlocks - filledBlocks;

  const bar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
  const percentText = Math.floor(percentage * 100) + '%';

  return `${bar} ${percentText}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('🆙 Muestra tu nivel y XP en este servidor'),

  async execute(interaction) {
    try {
      // ⛔ Verificación de canal permitido
      const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (config?.allowedCommandChannelId && interaction.channel.id !== config.allowedCommandChannelId) {
        return interaction.reply({
          content: `❌ Este comando solo se puede usar en <#${config.allowedCommandChannelId}>.`,
          ephemeral: true,
        });
      }

      const userLevel = await UserLevel.findOne({ guildId: interaction.guild.id, userId: interaction.user.id });

      if (!userLevel) {
        return interaction.reply({ content: 'No tienes XP todavía. ¡Empieza a participar!', ephemeral: true });
      }

      const xpNeeded = userLevel.level * 100;
      const progressBar = getProgressBar(userLevel.xp, xpNeeded);

      const embed = new EmbedBuilder()
        .setColor('#00BFFF')
        .setTitle(`${interaction.user.username}, aquí está tu progreso`)
        .addFields(
          { name: 'Nivel', value: `${userLevel.level}`, inline: true },
          { name: 'XP', value: `${userLevel.xp} / ${xpNeeded}`, inline: true },
          { name: 'Progreso', value: progressBar }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error al obtener nivel:', error);
      await interaction.reply({ content: '❌ Error al obtener tu nivel.', ephemeral: true });
    }
  },
};
