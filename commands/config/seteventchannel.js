const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const GuildConfig = require("../../events/database/models/GuildConfig");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("seteventchannel")
        .setDescription("Establece el canal donde se enviarán los eventos de captura.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option => 
            option.setName("canal")
                .setDescription("Canal para los eventos de captura.")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        ),

    async execute(interaction) {
        const canal = interaction.options.getChannel("canal");
        const guildId = interaction.guildId;

        try {
            let config = await GuildConfig.findOne({ guildId });

            if (!config) {
                config = new GuildConfig({
                    guildId,
                    eventChannelID: canal.id
                });
            } else {
                config.eventChannelID = canal.id;
            }

            await config.save();

            await interaction.reply({
                content: `✅ El canal de eventos ha sido establecido a <#${canal.id}>`,
                ephemeral: true
            });
        } catch (error) {
            console.error("Error al guardar el canal de eventos:", error);
            await interaction.reply({
                content: "❌ Ocurrió un error al guardar el canal. Inténtalo de nuevo más tarde.",
                ephemeral: true
            });
        }
    }
};
