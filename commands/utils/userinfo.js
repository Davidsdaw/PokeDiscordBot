const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Muestra información detallada de un usuario')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuario para ver la información')
        .setRequired(false)
    ),

  async execute(interaction) {
    const member = interaction.options.getMember('usuario') || interaction.member;
    const user = member.user;

    // Fechas
    const joinedAt = `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`;

    // Roles (excluyendo @everyone)
    const roles = member.roles.cache
      .filter(role => role.id !== interaction.guild.id)
      .map(role => `<@&${role.id}>`)
      .join(', ') || 'Ninguno';

    // Estado (online, offline, dnd, idle)
    const statusMap = {
      online: '🟢 En línea',
      offline: '⚫️ Desconectado',
      dnd: '⛔ No molestar',
      idle: '🌙 Ausente'
    };
    const status = statusMap[member.presence?.status] || 'Desconocido';

    // Apodo (nickname)
    const nickname = member.nickname || 'Ninguno';

    // Canal de voz
    const voiceChannel = member.voice.channel ? member.voice.channel.name : 'No está en canal de voz';

    // Booster Nitro?
    const isBooster = member.premiumSince ? `<t:${Math.floor(member.premiumSince.getTime() / 1000)}:F>` : 'No';

    // Permisos destacados
    const perms = [];
    if (member.permissions.has(PermissionsBitField.Flags.Administrator)) perms.push('Administrador');
    if (member.permissions.has(PermissionsBitField.Flags.ManageGuild)) perms.push('Gestionar Servidor');
    if (member.permissions.has(PermissionsBitField.Flags.ManageMessages)) perms.push('Gestionar Mensajes');
    if (member.permissions.has(PermissionsBitField.Flags.KickMembers)) perms.push('Expulsar Miembros');
    if (member.permissions.has(PermissionsBitField.Flags.BanMembers)) perms.push('Banear Miembros');
    if (member.permissions.has(PermissionsBitField.Flags.MuteMembers)) perms.push('Silenciar Miembros');

    const permissionsDisplay = perms.length > 0 ? perms.join(', ') : 'Ninguno';

    // Último mensaje (si existe)
    let lastMessage = 'No se pudo obtener';
    try {
      const messages = await interaction.channel.messages.fetch({ limit: 100 });
      const userMessages = messages.filter(m => m.author.id === user.id);
      if (userMessages.size > 0) {
        const lastMsg = userMessages.first();
        lastMessage = `<t:${Math.floor(lastMsg.createdTimestamp / 1000)}:F>`;
      } else {
        lastMessage = 'No ha enviado mensajes recientes aquí';
      }
    } catch {
      // No hacer nada si no se puede obtener mensajes
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Apodo', value: nickname, inline: true },
        { name: 'Estado', value: status, inline: true },
        { name: 'Se unió', value: joinedAt, inline: true },
        { name: 'Roles', value: roles, inline: false },
        { name: 'Canal de voz', value: voiceChannel, inline: true },
        { name: 'Booster Nitro', value: isBooster, inline: true },
        { name: 'Permisos destacados', value: permissionsDisplay, inline: false },
        { name: 'Último mensaje', value: lastMessage, inline: false }
      )
      .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
