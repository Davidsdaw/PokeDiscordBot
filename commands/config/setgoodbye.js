const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const GuildConfig = require("../../events/database/models/GuildConfig");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setgoodbyechannel")
        .setDescription("👋 Establece el canal donde se enviarán los mensajes de despedida.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option => 
            option.setName("canal")
                .setDescription("Canal para los mensajes de despedida.")
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
                    goodbyeChannelId: canal.id
                });
            } else {
                config.goodbyeChannelId = canal.id;
            }

            await config.save();

            await interaction.reply({
                content: `✅ El canal de despedida ha sido establecido a <#${canal.id}>`,
                ephemeral: true
            });
        } catch (error) {
            console.error("Error al guardar el canal de despedida:", error);
            await interaction.reply({
                content: "❌ Ocurrió un error al guardar el canal. Inténtalo de nuevo más tarde.",
                ephemeral: true
            });
        }
    }
};
