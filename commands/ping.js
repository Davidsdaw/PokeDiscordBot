const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDMPermission(false)
    .setDescription('Responde con Pong!'),
  async execute(interaction) {
    await interaction.reply('Pong!');
  },
};
