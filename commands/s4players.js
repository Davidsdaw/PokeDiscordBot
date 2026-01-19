const { SlashCommandBuilder,PermissionFlagsBits } = require('discord.js');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('s4players')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription('Responde con los jugadores de s4!'),

  async execute(interaction) {
    try {
      const response = await fetch('https://s4-tools.nullified.xyz/vfun/gameservers.txt');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const rawData = await response.text();

      const lines = rawData.split('\n').filter(line => line.trim().length > 0);

      const servers = lines.map(line => {
        const [namePart, players] = line.split(';');

        // Si hay un guion "-", tomamos la parte después del último guion
        // Sino tomamos la última palabra (o grupo de palabras) después del último espacio
        let name = '';
        if (namePart.includes('-')) {
          name = namePart.substring(namePart.lastIndexOf('-') + 1).trim();
        } else {
          const parts = namePart.split(' ');
          parts.shift();
          name = parts.join(' ').trim();
        }

        return { name, players };
      });

      // Orden deseado
      const order = ['Leaguers', 'The World', 'Imperials', 'Dominic'];

      servers.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));

      const message = servers.map(s => `${s.name} = ${s.players}`).join('\n');

      await interaction.reply(`\`\`\`\n${message}\n\`\`\``);

    } catch (error) {
      console.error('Error fetching players:', error);
      await interaction.reply({ content: '❌ No pude obtener la lista de jugadores.', flags: 64 });
    }
  },
};
