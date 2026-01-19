const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Discord = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('📺 Establece el status del bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setContexts(Discord.ApplicationCommandType.ChatInput)
        .addIntegerOption(option =>
            option
                .setName('actividad')
                .setDescription('Tipo de actividad (0: Jugando, 1: Transmitiendo, 2: Escuchando, 3: Viendo)')
                .setRequired(true)
                .addChoices(
                    { name: 'Jugando', value: 0 },
                    { name: 'Transmitiendo', value: 1 },
                    { name: 'Escuchando', value: 2 },
                    { name: 'Viendo', value: 3 },
                    { name: 'Custom', value: 4 },
                    { name: 'Competing', value: 5 }
                )
        )
        .addStringOption(option =>
            option
                .setName('descripcion')
                .setDescription('Descripción de la actividad')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('url')
                .setDescription('URL de transmisión (solo requerido para "Transmitiendo")')
        ),
    execute: async (interaction) => {

        const allowedUserId = '555065265679892500';
        if (interaction.user.id !== allowedUserId) {
            return interaction.reply({ content: '❌ Solo el creador del bot puede usar este comando.', ephemeral: true });
        }

        const actividad = interaction.options.getInteger('actividad');
        const descripcion = interaction.options.getString('descripcion');
        const url = interaction.options.getString('url');

        const activityTypes = ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'CUSTOM', 'COMPETING'];

        if (actividad === 1 && !url) {
            return interaction.reply({ content: 'La URL es requerida para "Transmitiendo".', ephemeral: true });
        }

        try {
            const activityOptions = { type: actividad, url: actividad === 1 ? url : undefined };
            interaction.client.user.setActivity(descripcion, activityOptions);

            await interaction.reply({
                content: `✅ Status actualizado a: ${activityTypes[actividad]} ${descripcion}${url ? ` (URL: ${url})` : ''}`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Hubo un error actualizando el estado.', ephemeral: true });
        }
    }
};
