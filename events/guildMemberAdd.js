const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
// const Canvas = require('@napi-rs/canvas'); // usa esto si estás en sistemas modernos
const Canvas = require('canvas'); // alternativa si @napi-rs/canvas no funciona
const path = require('path');
const GuildConfig = require('./database/models/GuildConfig');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const config = await GuildConfig.findOne({ guildId: member.guild.id });
    if (!config || !config.welcomeChannelId) return;

    const channel = member.guild.channels.cache.get(config.welcomeChannelId);
    if (!channel) return;

    // === CANVAS LOGIC ===
    const canvas = Canvas.createCanvas(800, 250);
    const ctx = canvas.getContext('2d');

    // Fondo
    const background = await Canvas.loadImage(path.join(__dirname, '../assets/welcome_bg.png'));
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Círculo de avatar
    ctx.beginPath();
    ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ extension: 'png' }));
    ctx.drawImage(avatar, 25, 25, 200, 200);

    // Texto
    ctx.restore();
    ctx.font = '36px Sans';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Bienvenido, ${member.user.username}`, 250, 130);
    ctx.font = '24px Sans';
    ctx.fillText(`Ahora somos ${member.guild.memberCount} miembros`, 250, 170);

    const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'welcome.png' });

    const embed = new EmbedBuilder()
      .setColor('#00FFAA')
      .setTitle('🎉 ¡Nuevo miembro!')
      .setDescription(`Bienvenido <@${member.id}> al servidor **${member.guild.name}**.`)
      .setImage('attachment://welcome.png')
      .setTimestamp();

    channel.send({ embeds: [embed], files: [attachment] });
  }
};
