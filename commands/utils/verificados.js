const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../events/database/models/GuildConfig');
const VerifiedUser = require('../../events/database/models/VerifiedUser');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verificados')
    .setDescription('📋 Lista los usuarios verificados y cuándo se unieron al servidor'),

  async execute(interaction) {
    try {
      const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (!guildConfig || !guildConfig.memberRoleId) {
        return interaction.reply({
          content: '❌ No está configurado el rol de miembro verificado para este servidor.',
          ephemeral: true,
        });
      }

      const memberRole = interaction.guild.roles.cache.get(guildConfig.memberRoleId);
      if (!memberRole) {
        return interaction.reply({
          content: '❌ No se encontró el rol de miembro verificado en el servidor.',
          ephemeral: true,
        });
      }

      const membersWithRole = memberRole.members;

      if (membersWithRole.size === 0) {
        return interaction.reply({
          content: 'ℹ️ No hay usuarios verificados en este servidor.',
          ephemeral: true,
        });
      }

      let description = '';
      for (const member of membersWithRole.values()) {
        const joinedAt = member.joinedAt
          ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:D>`
          : 'Desconocida';

        const userData = await VerifiedUser.findOne({
          guildId: interaction.guild.id,
          userId: member.id,
        });

        const verifiedAt = userData?.verifiedAt
          ? `<t:${Math.floor(userData.verifiedAt.getTime() / 1000)}:D>`
          : 'No registrada';

        description += `• **${member.user.tag}**\n➡️ Se unió: ${joinedAt}\n✅ Verificado: ${verifiedAt}\n\n`;
      }

      if (description.length > 4000) {
        description = description.slice(0, 3997) + '...';
      }

      const embed = new EmbedBuilder()
        .setTitle('✅ Lista de Usuarios Verificados')
        .setDescription(description)
        .setColor('#00FF00')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error listando usuarios verificados:', error);
      await interaction.reply({
        content: '❌ Ocurrió un error al listar los usuarios verificados.',
        ephemeral: true,
      });
    }
  },
};
