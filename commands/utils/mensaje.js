const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require("discord.js");
const GuildConfig = require("../../events/database/models/GuildConfig");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("anuncio")
        .setDescription("🗞️ Envía una noticia")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((opcion) =>
            opcion
                .setName("titulo")
                .setDescription("Título del anuncio")
                .setMinLength(3)
                .setMaxLength(256)
                .setRequired(true)
        )
        .addStringOption((opcion) =>
            opcion
                .setName("mensaje")
                .setDescription("Cuerpo del mensaje (usa \\n para saltos de línea)")
                .setMinLength(3)
                .setMaxLength(4000)
                .setRequired(true)
        )
        .addChannelOption((opcion) =>
            opcion
                .setName("canal")
                .setDescription("Canal donde se enviará el anuncio")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        ),

    execute: async (interaction) => {
        const { guildId, user } = interaction;

        const titulo = interaction.options.getString("titulo");
        const mensaje = interaction.options.getString("mensaje").replace(/\\n/g, "\n");
        const canal = interaction.options.getChannel("canal");

        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle(titulo)
            .setDescription(mensaje)
            .setFooter({ text: `Publicado por ${user.username}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        if (!canal || canal.type !== ChannelType.GuildText) {
            return interaction.reply({
                content: "❌ El canal seleccionado no es válido.",
                ephemeral: true,
            });
        }

        try {
            // Enviar anuncio
            await canal.send({ embeds: [embed] });
            await interaction.reply({ content: "✅ Anuncio enviado correctamente.", ephemeral: true });

            // Buscar configuración de la guild para obtener el canal de logs
            const config = await GuildConfig.findOne({ guildId });
            const logChannelId = config?.logChannelId;

            if (logChannelId) {
                const logChannel = interaction.guild.channels.cache.get(logChannelId);
                if (logChannel && logChannel.type === ChannelType.GuildText) {
                    const logEmbed = new EmbedBuilder()
                        .setColor(0xffcc00)
                        .setTitle("📢 Anuncio enviado")
                        .addFields(
                            { name: "Título", value: titulo },
                            { name: "Autor", value: user.tag, inline: true },
                            { name: "Canal", value: `<#${canal.id}>`, inline: true }
                        )
                        .setTimestamp();
                    await logChannel.send({ embeds: [logEmbed] });
                }
            }
        } catch (error) {
            console.error("Error enviando anuncio o log:", error);
            await interaction.reply({ content: "❌ Hubo un error al enviar el anuncio.", ephemeral: true });
        }
    },
};
