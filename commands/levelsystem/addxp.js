const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const UserLevel = require('../../events/database/models/UserLevel');
const GuildConfig = require('../../events/database/models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addxp')
    .setDescription('➕ Añade XP a un usuario')
    .addUserOption(option => option.setName('usuario').setDescription('Usuario a añadir XP').setRequired(true))
    .addIntegerOption(option => option.setName('cantidad').setDescription('Cantidad de XP').setRequired(true)),

  async execute(interaction) {
    try {
      // Obtener configuración para permisos
      const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (!config || !config.modRoleId) {
        return interaction.reply({ content: '❌ No hay rol de moderador configurado.', ephemeral: true });
      }

      if (!interaction.member.roles.cache.has(config.modRoleId)) {
        return interaction.reply({ content: '❌ No tienes permiso para usar este comando.', ephemeral: true });
      }

      const user = interaction.options.getUser('usuario');
      const amount = interaction.options.getInteger('cantidad');

      if (amount <= 0) return interaction.reply({ content: '❌ Cantidad inválida.', ephemeral: true });

      let userLevel = await UserLevel.findOne({ guildId: interaction.guild.id, userId: user.id });
      if (!userLevel) userLevel = new UserLevel({ guildId: interaction.guild.id, userId: user.id, xp: 0, level: 1 });

      userLevel.xp += amount;

      while (userLevel.xp >= userLevel.level * 100) {
        userLevel.xp -= userLevel.level * 100;
        userLevel.level++;
      }

      await userLevel.save();

      // Enviar DM al usuario
      try {
        await user.send(`🎉 Has recibido ${amount} XP en **${interaction.guild.name}**. Nivel actual: ${userLevel.level} (${userLevel.xp} XP).`);
      } catch {}

      if (config.logChannelId) {
        const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setTitle('XP Añadida')
            .setColor('Green')
            .setDescription(`${interaction.user.tag} ha añadido **${amount} XP** a ${user.tag}`)
            .addFields(
              { name: 'Nivel Actual', value: `${userLevel.level}`, inline: true },
              { name: 'XP Actual', value: `${userLevel.xp}`, inline: true }
            )
            .setTimestamp();

          logChannel.send({ embeds: [embed] });
        }
      }

      return interaction.reply({ content: `✅ Se añadieron ${amount} XP a ${user.tag}.`, ephemeral: true });

    } catch (error) {
      console.error(error);
      return interaction.reply({ content: '❌ Error al añadir XP.', ephemeral: true });
    }
  }
};
