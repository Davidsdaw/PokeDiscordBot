const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../events/database/models/GuildConfig'); // Asegúrate que la ruta es correcta

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('🗑️ Limpia mensajes en el canal actual.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Cantidad de mensajes a eliminar (1-99)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Razón de la limpieza')
                .setRequired(false)),

    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const reason = interaction.options.getString('reason') || 'No especificada';

        if (amount < 1 || amount > 99) {
            return await interaction.reply({
                content: '❌ La cantidad debe estar entre 1 y 99 mensajes.',
                flags: 64,
            });
        }

        try {
            // Borrar mensajes
            const messages = await interaction.channel.messages.fetch({ limit: amount });
            const deleted = await interaction.channel.bulkDelete(messages, true);

            // Confirmación efímera al moderador
            const msg = await interaction.reply({
                content: `✅ Se eliminaron ${deleted.size} mensajes.`,
                flags: 64,
            });
            setTimeout(() => {
                msg.delete().catch(console.error);
            }, 5000);

            // Crear el embed del log
            const logEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🧹 Limpieza Completada')
                .setDescription(`
                    **Detalles de la operación:**
                    
                    📊 Mensajes eliminados: ${deleted.size}
                    📝 Razón: ${reason}
                    ⏰ Tiempo: ${new Date().toLocaleString()}
                    
                `)
                .addFields(
                    { name: '🎯 Canal', value: `${interaction.channel}`, inline: true },
                    { name: '👤 Moderador', value: `${interaction.user}`, inline: true }
                )
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setTimestamp();

            // Buscar el logChannelId en la configuración del servidor
            const config = await GuildConfig.findOne({ guildId: interaction.guild.id });

            if (config && config.logChannelId) {
                const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
                if (logChannel && logChannel.isTextBased()) {
                    logChannel.send({ embeds: [logEmbed] }).catch(err => {
                        console.warn('⚠️ No se pudo enviar el log al canal configurado:', err.message);
                    });
                }
            }

        } catch (err) {
            console.error('❌ Error ejecutando /purge:', err);
            if (!interaction.replied) {
                const msg = await interaction.reply({
                    content: '❌ Hubo un error al intentar limpiar mensajes.',
                    flags: 64
                });
                setTimeout(() => {
                    msg.delete().catch(console.error);
                }, 5000);
            }
        }
    }
};
