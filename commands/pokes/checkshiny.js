const supabase = require('../../lib/database/supabaseClient');
const Discord = require("discord.js");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("checkshiny")
        .setDescription("Verifica tus Pokémon shiny o los de otro usuario")
        .setContexts([Discord.ApplicationCommandType.ChatInput])
        .addUserOption(option => 
            option.setName("usuario")
                  .setDescription("Usuario de Discord a revisar")
                  .setRequired(false) // opcional
        ),

    async execute(interaction) {
        await interaction.deferReply();

        // 1️⃣ Determinar a quién revisar
        const targetUser = interaction.options.getUser("usuario") || interaction.user;
        const discordId = targetUser.id;

        // 2️⃣ Obtener ID interno del usuario en profiles
        const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id, username')
            .eq('discord_id', discordId)
            .maybeSingle();

        if (!userData || userError) {
            const embed = new Discord.EmbedBuilder()
                .setTitle("❌ Error")
                .setDescription(`El usuario ${targetUser.tag} no está registrado. Usa /register primero.`)
                .setColor(Discord.Colors.Red);
            return interaction.editReply({ embeds: [embed] });
        }

        // 3️⃣ Obtener shinies del usuario
        const { data: shinyData, error: shinyError } = await supabase
            .from('shinies')
            .select('*')
            .eq('user_id_fk', userData.id);

        if (shinyError) {
            console.error("Error al verificar shiny:", shinyError);
            const embed = new Discord.EmbedBuilder()
                .setTitle("❌ Error")
                .setDescription("Hubo un error al verificar los shinies.")
                .setColor(Discord.Colors.Red);
            return interaction.editReply({ embeds: [embed], embeded: true });
        }

        if (!shinyData || shinyData.length === 0) {
            const embed = new Discord.EmbedBuilder()
                .setTitle("❌ Sin shinies")
                .setDescription(`${targetUser.tag} no tiene ningún Pokémon shiny registrado.`)
                .setColor(Discord.Colors.Red);
            return interaction.editReply({ embeds: [embed] });
        }

        // 4️⃣ Construir embed con todos los shinies
        const fields = shinyData.map(shiny => ({
            name: `${shiny.pokemon_name} ✨`,
            value: `
**Método:** ${shiny.method || "Desconocido"}
**Fecha:** ${shiny.date_caught || "Desconocida"}
**Ruta:** ${shiny.route_caught || "Desconocida"}
**Naturaleza:** ${shiny.naturaleza || "Desconocida"}
**Secreto:** ${shiny.is_secret ? "Sí" : "No"}
            `
        }));

        const embed = new Discord.EmbedBuilder()
            .setTitle(`✨ Shinies de ${userData.username}`)
            .setDescription(`Tiene **${shinyData.length}** Pokémon shiny registrados.`)
            .addFields(fields)
            .setColor(Discord.Colors.Gold)
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
};
