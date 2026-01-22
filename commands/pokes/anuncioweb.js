const Discord = require("discord.js");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("anuncioweb")
        .setDescription("Envía el anuncio de explicación de pokémon.")
        .setDefaultMemberPermissions(Discord.PermissionFlagsBits.Administrator),
    async execute(interaction) {
 const anuncioEmbed = new Discord.EmbedBuilder()
    .setColor("#6e025f")
    .setAuthor({
        name: "⚠️ ¡Atención LAB!",
        iconURL: "https://i.imgur.com/RnO8OWe.gif"
    })
    .setTitle("Colaboración para la Web")
    .setDescription(
        "Esta sección está dedicada a recopilar información y recursos de **usuarios y shinys** para nuestra página web.\n\n" +
        "El objetivo es **acelerar el proceso de carga de datos** mediante el registro y la aportación de shinys.\n\n" +
        "🔹 Se recomienda introducir **datos reales**.\n" +
        "🔹 Si solo quieres aportar información, usa **`fake_`** en el email del registro.\n" +
        "🔹 Una vez lanzada la web, **esas cuentas serán eliminadas**.\n\n" +
        "> ⚠️ **Los comandos no funcionarán fuera de este canal**"
    )
    .addFields(
        {
            name: "📌 Comandos disponibles",
            value: 
                "`/register` → Registrarte en la web\n" +
                "`/addshiny` → Agregar un shiny a tu showcase\n" +
                "`/checkshiny` → Ver tus shinys o los de otros usuarios *(en desarrollo)*"
        }
    )
    .setFooter({
        text: "Los datos no pueden ser editados ni eliminados · Contactar con ChetiiKo"
    })
    .setThumbnail("https://i.imgur.com/RnO8OWe.gif");


        await interaction.reply({ embeds: [anuncioEmbed]});
    }
}