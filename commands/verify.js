const {
  SlashCommandBuilder,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');
const GuildConfig = require('../events/database/models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('🔐 Solicita verificación en el servidor')
    .setDMPermission(false)
    .addStringOption(option =>
      option.setName('nick')
        .setDescription('Tu nombre de jugador')
        .setRequired(true))
    .addAttachmentOption(option =>
      option.setName('foto1')
        .setDescription('Primera captura')
        .setRequired(true))
    .addAttachmentOption(option =>
      option.setName('foto2')
        .setDescription('Segunda captura')
        .setRequired(true)),

  async execute(interaction) {



    const nick = interaction.options.getString('nick');
    const foto1 = interaction.options.getAttachment('foto1');
    const foto2 = interaction.options.getAttachment('foto2');

    // Cargar config
    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!config || !config.verifyChannelId) {
      return interaction.reply({ content: '❌ No se ha configurado el canal de verificación.', flags: 64 });
    }

    const verifyChannel = await interaction.guild.channels.fetch(config.verifyChannelId);
    if (!verifyChannel) {
      return interaction.reply({ content: '❌ No se encontró el canal de verificación.', flags: 64 });
    }

    if (config?.allowedVerifyChannelId && interaction.channel.id !== config.allowedVerifyChannelId) {
      return interaction.reply({
        content: `❌ Este comando solo se puede usar en <#${config.allowedVerifyChannelId}>.`,
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('📥 Nueva solicitud de verificación')
      .setColor('#0099ff')
      .addFields(
        { name: '👤 Usuario', value: `${interaction.user.tag} (${interaction.user.id})`, inline: false },
        { name: '🎮 Nick del juego', value: nick, inline: false }
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`verify_accept_${interaction.user.id}`)
        .setLabel('✅ Aceptar')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`verify_reject_${interaction.user.id}`)
        .setLabel('❌ Rechazar')
        .setStyle(ButtonStyle.Danger)
    );

    await verifyChannel.send({
      embeds: [embed],
      files: [foto1.url, foto2.url],
      components: [buttons]
    });

    await interaction.reply({ content: '✅ Solicitud enviada correctamente.', flags: 64 });
  }
};
