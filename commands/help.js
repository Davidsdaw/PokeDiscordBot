const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDMPermission(false)
    .setDescription('Muestra la lista de comandos disponibles'),
  async execute(interaction) {
    const commands = interaction.client.commands.map(cmd => `- \`${cmd.data.name}\`: ${cmd.data.description}`).join('\n');
    await interaction.reply(`Aquí tienes los comandos disponibles:\n${commands}`);
  },
};
