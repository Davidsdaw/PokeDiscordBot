const { EmbedBuilder, Events } = require('discord.js');
const GuildConfig = require('./database/models/GuildConfig');

module.exports = (client) => {
  // Mensaje eliminado
  client.on(Events.MessageDelete, async (message) => {
  if (message.partial || message.author?.bot || !message.guild) return;

  const config = await GuildConfig.findOne({ guildId: message.guild.id });
  if (!config || !config.logChannelId) return;

  const logChannel = message.guild.channels.cache.get(config.logChannelId);
  if (!logChannel) return;

  // Obtener los logs de auditoría para eliminación de mensajes
  let executor = 'Desconocido';

  try {
    const fetchedLogs = await message.guild.fetchAuditLogs({
      limit: 1,
      type: 'MESSAGE_DELETE',
    });

    const deletionLog = fetchedLogs.entries.first();

    if (deletionLog) {
      const { executor: userExecutor, target, createdTimestamp } = deletionLog;

      // Confirmar que el mensaje borrado sea del mismo autor y que el evento haya ocurrido en los últimos 5 segundos
      if (target.id === message.author.id && (Date.now() - createdTimestamp) < 5000) {
        executor = userExecutor.tag;
      }
    }
  } catch (error) {
    console.error('Error al obtener audit logs:', error);
  }

  const embed = new EmbedBuilder()
    .setColor('#FF0000')
    .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
    .setTitle('🗑️ Mensaje Eliminado')
    .addFields(
      { name: 'Canal', value: `<#${message.channel.id}>`, inline: true },
      { name: 'Autor del mensaje', value: `<@${message.author.id}>`, inline: true },
      { name: 'Eliminado por', value: executor, inline: true },
      { name: 'Contenido', value: message.content || '*Sin contenido*' }
    )
    .setTimestamp();

  logChannel.send({ embeds: [embed] }).catch(() => {});
});

  // Mensaje editado
  client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
    if (
      oldMessage.partial ||
      newMessage.partial ||
      oldMessage.author?.bot ||
      !oldMessage.guild ||
      oldMessage.content === newMessage.content
    ) return;

    const config = await GuildConfig.findOne({ guildId: oldMessage.guild.id });
    if (!config || !config.logChannelId) return;

    const logChannel = oldMessage.guild.channels.cache.get(config.logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setAuthor({ name: oldMessage.author.tag, iconURL: oldMessage.author.displayAvatarURL() })
      .setTitle('✏️ Mensaje Editado')
      .addFields(
        { name: 'Canal', value: `<#${oldMessage.channel.id}>`, inline: true },
        { name: 'Autor', value: `<@${oldMessage.author.id}>`, inline: true },
        { name: 'Antes', value: oldMessage.content || '*Sin contenido*' },
        { name: 'Después', value: newMessage.content || '*Sin contenido*' }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] }).catch(() => {});
  });
};
