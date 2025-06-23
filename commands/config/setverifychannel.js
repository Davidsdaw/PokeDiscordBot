const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const GuildConfig = require('../../events/database/models/GuildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setverifychannel')
        .setDescription('🛠️ Establece el canal donde se enviarán las verificaciones')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option
                .setName('canal')
                .setDescription('Canal de verificaciones')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const canal = interaction.options.getChannel('canal');

        try {
            let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
            if (!config) {
                config = new GuildConfig({ guildId: interaction.guild.id });
            }

            config.verifyChannelId = canal.id;
            await config.save();

            await interaction.reply({
                content: `✅ Canal de verificación establecido en: ${canal}`,
                flags: 64
            });
        } catch (err) {
            console.error('Error guardando el canal de verificación:', err);
            await interaction.reply({
                content: '❌ Hubo un error al guardar el canal de verificación.',
                flags: 64
            });
        }
    }
};
