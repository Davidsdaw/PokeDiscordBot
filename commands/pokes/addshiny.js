const supabase = require('../../lib/database/supabaseClient');
const Discord = require("discord.js");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("addshiny")
        .setContexts(Discord.ApplicationCommandType.ChatInput)
        .setDescription("Agrega un Pokémon shiny a tu colección")
        .addStringOption(option => option.setName("pokemon").setDescription("Nombre del Pokémon shiny").setRequired(true))
        .addStringOption(option => option.setName("metodo").setDescription("Método de obtención del shiny").setRequired(true)
            .addChoices(
                { name: 'Huevos', value: 'Huevo' },
                { name: 'Horda', value: 'Horda' },
                { name: 'Single', value: 'Single' },
                { name: 'Safari', value: 'Safari' },
                { name: 'Evento', value: 'Evento' },
                { name: 'Pokeball', value: 'Pokeball' },
                { name: 'Fosil', value: 'Fosil' }
            ))
        .addNumberOption(option => option.setName("año").setDescription("Año en que se obtuvo el shiny").setRequired(true))
        .addNumberOption(option => option.setName("mes").setDescription("Mes en que se obtuvo el shiny").setRequired(true))
        .addNumberOption(option => option.setName("dia").setDescription("Día en que se obtuvo el shiny").setRequired(true))
        .addStringOption(option => option.setName("ruta").setDescription("Ruta donde se obtuvo el shiny").setRequired(true))
        .addNumberOption(option => option.setName("ps").setDescription("IVs PS shiny").setRequired(true))
        .addNumberOption(option => option.setName("atk").setDescription("IVs ATK shiny").setRequired(true))
        .addNumberOption(option => option.setName("def").setDescription("IVs DEF shiny").setRequired(true))
        .addNumberOption(option => option.setName("spa").setDescription("IVs SPA shiny").setRequired(true))
        .addNumberOption(option => option.setName("spd").setDescription("IVs SPD shiny").setRequired(true))
        .addNumberOption(option => option.setName("spe").setDescription("IVs SPE shiny").setRequired(true))
        .addBooleanOption(option => option.setName("secret").setDescription("¿Es un Shiny secret ?").setRequired(true))
        .addStringOption(option => option.setName("naturaleza").setDescription("Naturaleza del shiny").setRequired(true)
            .addChoices(
                { name: 'Osada', value: 'Osada' },
                { name: 'Modesta', value: 'Modesta' },
                { name: 'Serena', value: 'Serena' },
                { name: 'Miedosa', value: 'Miedosa' },
                { name: 'Huraña', value: 'Huraña' },
                { name: 'Afable', value: 'Afable' },
                { name: 'Amable', value: 'Amable' },
                { name: 'Activa', value: 'Activa' },
                { name: 'Firme', value: 'Firme' },
                { name: 'Agitada', value: 'Agitada' },
                { name: 'Cauta', value: 'Cauta' },
                { name: 'Alegre', value: 'Alegre' },
                { name: 'Pícara', value: 'Picara' },
                { name: 'Floja', value: 'Floja' },
                { name: 'Alocada', value: 'Alocada' },
                { name: 'Ingenua', value: 'Ingenua' },
                { name: 'Audaz', value: 'Audaz' },
                { name: 'Plácida', value: 'Placida' },
                { name: 'Mansa', value: 'Mansa' },
                { name: 'Grosera', value: 'Grosera' },
                { name: 'Fuerte', value: 'Fuerte' },
                { name: 'Dócil', value: 'Docil' },
                { name: 'Seria', value: 'Seria' },
                { name: 'Tímida', value: 'Timida' },
                { name: 'Rara', value: 'Rara' },
            ))
    ,

    async execute(interaction) {
        const discordId = interaction.user.id;
        const pokemonName = interaction.options.getString("pokemon");
        const metodo = interaction.options.getString("metodo");
        const año = interaction.options.getNumber("año");
        const mes = interaction.options.getNumber("mes");
        const dia = interaction.options.getNumber("dia");
        const ruta = interaction.options.getString("ruta");
        const ps = interaction.options.getNumber("ps");
        const atk = interaction.options.getNumber("atk");
        const def = interaction.options.getNumber("def");
        const spa = interaction.options.getNumber("spa");
        const spd = interaction.options.getNumber("spd");
        const spe = interaction.options.getNumber("spe");
        const secret = interaction.options.getBoolean("secret");
        const naturaleza = interaction.options.getString("naturaleza");

        const ROLE_ID = process.env.ROLE_ID;
        if (!interaction.member.roles.cache.has(ROLE_ID)) {
            const embed = new Discord.EmbedBuilder()
                .setTitle("❌ Error")
                .setDescription("No tienes permiso para usar este comando, necesitas ser miembro.")
                .setColor(Discord.Colors.Red);
            return interaction.editReply({
                embeds: [{ embeds: [embed], ephemeral: true }]
            });
        }

        const ALLOWED_CHANNEL_ID = process.env.ALLOWED_CHANNEL_ID;

        if (interaction.channelId !== ALLOWED_CHANNEL_ID) {
            const embed = new Discord.EmbedBuilder()
                .setTitle("❌ Canal incorrecto")
                .setDescription("Este comando solo puede usarse en el canal autorizado.")
                .setColor(Discord.Colors.Red);

            return interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        // Año tiene que ser 4 digitos mayor o igual a 2012

        if (año < 2012 || año > 9999) {
            const embed = new Discord.EmbedBuilder()
                .setTitle("❌ Error")
                .setDescription("El año debe ser un número de 4 dígitos mayor o igual a 2012.")
                .setColor(Discord.Colors.Red);
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        // Mes entre 1 y 12
        if (mes < 1 || mes > 12) {
            const embed = new Discord.EmbedBuilder()
                .setTitle("❌ Error")
                .setDescription("El mes debe estar entre 1 y 12.")
                .setColor(Discord.Colors.Red);
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        // Dia entre 1 y 31
        if (dia < 1 || dia > 31) {
            const embed = new Discord.EmbedBuilder()
                .setTitle("❌ Error")
                .setDescription("El día debe estar entre 1 y 31.")
                .setColor(Discord.Colors.Red);
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const fecha = `${año}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;

        // Validar IVs entre 0 y 31
        const ivsSplitted = [ps, atk, def, spa, spd, spe];
        for (const iv of ivsSplitted) {
            if (iv < 0 || iv > 31) {
                const embed = new Discord.EmbedBuilder()
                    .setTitle("❌ Error")
                    .setDescription("Los IVs deben estar entre 0 y 31")
                    .setColor(Discord.Colors.Red);
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }
        }

        let jsonIvs = [{
            ps: parseInt(ps),
            atk: parseInt(atk),
            def: parseInt(def),
            spa: parseInt(spa),
            spd: parseInt(spd),
            spe: parseInt(spe)
        }];

        // Verificar si el usuario está registrado
        const { data: user } = await supabase
            .from('profiles')
            .select('*')
            .eq('discord_id', discordId)
            .single();

        if (!user) {
            const embed = new Discord.EmbedBuilder()
                .setTitle("❌ Error")
                .setDescription("No estás registrado. Usa el comando /register para registrarte.")
                .setColor(Discord.Colors.Red);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            // Agregar el shiny a la base de datos
            const { error } = await supabase
                .from('shinies')
                .insert([
                    {
                        user_id_fk: user.id,
                        pokemon_name: pokemonName,
                        method: metodo,
                        date_caught: fecha,
                        route_caught: ruta,
                        ivs: jsonIvs,
                        is_secret: secret,
                        naturaleza: naturaleza
                    }
                ]);
            if (error) {
                console.error("Error al agregar el shiny:", error);
                const embed = new Discord.EmbedBuilder()
                    .setTitle("❌ Error")
                    .setDescription("Hubo un error al agregar tu Pokémon shiny. Inténtalo de nuevo más tarde.")
                    .setColor(Discord.Colors.Red);
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                const embed = new Discord.EmbedBuilder()
                    .setTitle("✅ Pokémon Shiny Agregado")
                    .setDescription(`Tu Pokémon shiny ha sido registrado exitosamente.`)
                    .addFields(
                        { name: "Pokémon", value: pokemonName, inline: true },
                        { name: "Método", value: metodo, inline: true },
                        { name: "Naturaleza", value: naturaleza, inline: true },
                        { name: "Fecha de Captura", value: fecha, inline: true },
                        { name: "Ruta", value: ruta, inline: true },
                        { name: "Secret", value: secret ? "Sí" : "No", inline: true },
                        { name: "IVs", value: `PS: ${ivsSplitted[0]} | ATK: ${ivsSplitted[1]} | DEF: ${ivsSplitted[2]} | SPA: ${ivsSplitted[3]} | SPD: ${ivsSplitted[4]} | SPE: ${ivsSplitted[5]}`, inline: false }
                    )
                    .setColor(Discord.Colors.Green)
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
    }
}