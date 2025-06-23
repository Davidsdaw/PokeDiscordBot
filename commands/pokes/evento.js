const Discord = require("discord.js");
const GuildConfig = require("../../events/database/models/GuildConfig");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("eventocaptura")
        .setDescription("El bot dirá lo que quieras")
        .setDefaultMemberPermissions(Discord.PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName("descripcion").setDescription("Descripcion del evento").setRequired(true))
        .addStringOption(option => option.setName("pokemon").setDescription("Que pokemon capturar").setRequired(true))
        .addStringOption(option => option.setName("zona").setDescription("En que zona aparece el pokemon").setRequired(true))
        .addStringOption(option => option.setName("region").setDescription("En que region aparece el pokemon").setRequired(true)
            .addChoices(
                { name: 'Kanto', value: 'Kanto' },
                { name: 'Johto', value: 'Johto' },
                { name: 'Hoenn', value: 'Hoenn' },
                { name: 'Sinnoh', value: 'Sinnoh' },
                { name: 'Teselia', value: 'Teselia' }
            ))
        .addStringOption(option => option.setName("premios").setDescription("Separa los premios por ','").setRequired(true))
        .addStringOption(option => option.setName("acabar").setDescription("Donde ir al acabar").setRequired(true))
        .addStringOption(option => option.setName("empieza").setDescription("Cuando empieza el evento").setRequired(true))
        .addStringOption(option => option.setName("duracion").setDescription("Cuanto dura el evento").setRequired(true))
        .addStringOption(option => option.setName("host").setDescription("Quien hostea el evento").setRequired(true))
        .addStringOption(option => option.setName("participantes").setDescription("Quien puede participar").setRequired(true)
            .addChoices(
                { name: 'Lab1', value: 'Lab1' },
                { name: 'Lab2', value: 'Lab2' },
                { name: 'NWO', value: 'NWO' },
                { name: 'MGMA', value: 'MGMA' },
                { name: 'Todos', value: '@everyone' }
            ))
        .addStringOption(option => option.setName("requisitos").setDescription("Requisitos para participar").setRequired(true)
            .addChoices(
                { name: 'Nuevos pueden participar', value: '¡ Todos pueden participar !' },
                { name: '1 Semana', value: ' Debes llevar mas de 1 semana' },
                { name: '2 Semanas', value: 'Debes llevar mas de 2 semanas' },
                { name: '3 Semanas', value: 'Debes llevar mas de 3 semanas' },
                { name: '1 Mes', value: 'Debes llevar mas de 1 mes' }
            )),
    
    async execute(interacion) {
        const {
            guildId,
            user,
            guild
        } = interacion;

        const config = await GuildConfig.findOne({ guildId });
        if (!config || !config.eventChannelID) {
            return interacion.reply({
                content: "❌ No se encontró el canal del evento en la configuración del servidor.",
                ephemeral: true
            });
        }

        const canal = guild.channels.cache.get(config.eventChannelID);
        if (!canal || canal.type !== Discord.ChannelType.GuildText) {
            return interacion.reply({
                content: "❌ El canal configurado para eventos no existe o no es de texto.",
                ephemeral: true
            });
        }

        const descripcion = interacion.options.getString("descripcion");
        const pokemon = interacion.options.getString("pokemon");
        const zona = interacion.options.getString("zona");
        const region = interacion.options.getString("region");
        const premios = interacion.options.getString("premios");
        const empieza = interacion.options.getString("empieza");
        const duracion = interacion.options.getString("duracion");
        const host = interacion.options.getString("host");
        const participantes = interacion.options.getString("participantes");
        const requisitos = interacion.options.getString("requisitos");
        const acabar = interacion.options.getString("acabar");
        const userAvatar = user.displayAvatarURL({ dynamic: true });

        let premiosArray = premios.split(",");
        let premioFormato = premiosArray.join("\n");

        const fechaInicio = new Date(empieza);
        const duracionMs = parseDuration(duracion);

        if (!isNaN(fechaInicio) && !isNaN(duracionMs)) {
            const fechaFin = new Date(fechaInicio.getTime() + duracionMs);
            const timestampEmpieza = Math.floor(fechaInicio.getTime() / 1000);
            const timestampFin = Math.floor(fechaFin.getTime() / 1000);

            const mensajeEvento = new Discord.EmbedBuilder()
                .setColor(0x674EA7)
                .setTitle("🍺¡ Evento **Captura** !🍺")
                .setDescription(descripcion)
                .setThumbnail(userAvatar)
                .addFields(
                    { name: ' POKEMON ', value: pokemon, inline: true },
                    { name: ' ZONA ', value: zona, inline: true },
                    { name: ' REGION ', value: region, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: ' 💰 PREMIOS 💰 ', value: premioFormato, inline: true },
                    { name: ' 🗺️ Al acabar 🗺️ ', value: acabar, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: ' EMPIEZA 🕛 ', value: `<t:${timestampEmpieza}:F>`, inline: true },
                    { name: ' DURACION ⏲️ ', value: duracion, inline: true },
                    { name: ' HOST 🤖 ', value: host, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: ' TERMINA 🕛 ', value: `<t:${timestampFin}:F>`, inline: true }
                )
                .setImage("https://www.gifsanimados.org/data/media/562/linea-imagen-animada-0538.gif")
                .addFields(
                    { name: ' 🎮 Pueden participar 🎮 ', value: participantes },
                    { name: ' ⚒️ Requisitos ⚒️ ', value: requisitos, inline: true }
                )
                .setTimestamp()
                .setFooter({
                    text: "Realizado por : " + user.username,
                    iconURL: userAvatar
                });

            await canal.send({ embeds: [mensajeEvento] });

            await interacion.reply({
                content: "✅ Mensaje enviado correctamente.",
                flags: Discord.MessageFlags.Ephemeral
            }).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));

            const tiempoHastaFin = fechaFin.getTime() - Date.now();
            if (tiempoHastaFin > 0) {
                setTimeout(() => {
                    canal.send(`🕛 El evento de **${pokemon}** ha finalizado.`);
                }, tiempoHastaFin);
            }
        } else {
            return interacion.reply({
                content: "❌ Fecha de inicio o duración inválida.",
                flags: Discord.MessageFlags.Ephemeral
            });
        }
    }
};

// Utilidad para convertir duración en milisegundos
function parseDuration(duracion) {
    const match = duracion.match(/(?:(\d+)\s*d)?\s*(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?\s*(?:(\d+)\s*s)?/i);
    if (!match) return NaN;
    const [ , d, h, m, s ] = match.map(n => parseInt(n) || 0);
    return (((d * 24 + h) * 60 + m) * 60 + s) * 1000;
}
