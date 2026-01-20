const supabase = require('./../../lib/database/supabaseClient');
const Discord = require("discord.js");

// Siempre cierra la interacción
async function safeReply(user, interaction, embed) {
    let dmSent = false;

    try {
        await user.send({ embeds: [embed] });
        dmSent = true;
    } catch { }

    if (dmSent) {
        await interaction.editReply({ content: "📩 Te he enviado la información por privado." });
    } else {
        await interaction.editReply({ embeds: [embed] });
    }
}

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("register")
        .setDescription("Regístrate en nuestra página web")
        .setContexts([Discord.ApplicationCommandType.ChatInput])
        .addStringOption(option => option.setName("correo").setDescription("Correo electrónico").setRequired(true))
        .addStringOption(option => option.setName("contraseña").setDescription("Contraseña").setRequired(true))
        .addStringOption(option => option.setName("repite_contraseña").setDescription("Repite la contraseña").setRequired(true))
        .addStringOption(option => option.setName("usuario_pkm").setDescription("Usuario de Pokemmo").setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const ROLE_ID = process.env.ROLE_ID;
        const ALLOWED_CHANNEL_ID = process.env.ALLOWED_CHANNEL_ID;

        if (interaction.channelId !== ALLOWED_CHANNEL_ID) {
            const embed = new Discord.EmbedBuilder()
                .setTitle("❌ Canal incorrecto")
                .setDescription("Este comando solo puede usarse en el canal autorizado.")
                .setColor(Discord.Colors.Red);

            return interaction.editReply({ embeds: [embed], ephemeral: true });
        }


        if (!interaction.member.roles.cache.has(ROLE_ID)) {
            const emmbed = new Discord.EmbedBuilder()
                .setTitle("❌ Error")
                .setDescription("No tienes permiso para usar este comando, necesitas ser miembro.")
                .setColor(Discord.Colors.Red);
            return interaction.editReply({
                embeds: [emmbed]
            });
        }

        const email = interaction.options.getString("correo");
        const password = interaction.options.getString("contraseña");
        const repeatPassword = interaction.options.getString("repite_contraseña");
        const discordId = interaction.user.id;
        const pkmUser = interaction.options.getString("usuario_pkm");
        const userAvatar = interaction.user.displayAvatarURL({ dynamic: true });

        // Contraseñas
        if (password !== repeatPassword) {
            return safeReply(interaction.user, interaction,
                new Discord.EmbedBuilder()
                    .setTitle("❌ Error")
                    .setDescription("Las contraseñas no coinciden.")
                    .setColor(Discord.Colors.Red)
            );
        }

        // 3️⃣ Usuario Pokemmo
        const { data: pkmExists } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', pkmUser)
            .maybeSingle();

        if (pkmExists) {
            return safeReply(interaction.user, interaction,
                new Discord.EmbedBuilder()
                    .setTitle("❌ Error")
                    .setDescription("Ese usuario Pokemmo ya está registrado.")
                    .setColor(Discord.Colors.Red)
            );
        }

        // 4️⃣ Discord ID
        const { data: discordExists } = await supabase
            .from('profiles')
            .select('discord_id')
            .eq('discord_id', discordId)
            .maybeSingle();

        if (discordExists) {
            return safeReply(interaction.user, interaction,
                new Discord.EmbedBuilder()
                    .setTitle("❌ Error")
                    .setDescription("Tu cuenta de Discord ya está registrada.")
                    .setColor(Discord.Colors.Red)
            );
        }

        // 5️⃣ Registro
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: pkmUser,
                    discord_id: discordId,
                    pkm_user: pkmUser
                }
            }
        });

        if (error) {
            if (error.message.includes("User already registered")) {
                return safeReply(interaction.user, interaction,
                    new Discord.EmbedBuilder()
                        .setTitle("❌ Error")
                        .setDescription("Ese correo ya está registrado.")
                        .setColor(Discord.Colors.Red)
                );
            }
            if (error.message.includes("Password should be at least 6 characters.")) {
                return safeReply(interaction.user, interaction,
                    new Discord.EmbedBuilder()
                        .setTitle("❌ Error")
                        .setDescription("La contraseña debe tener al menos 6 caracteres.")
                        .setColor(Discord.Colors.Red)
                );
            }
            return safeReply(interaction.user, interaction,
                new Discord.EmbedBuilder()
                    .setTitle("❌ Error")
                    .setDescription(error.message)
                    .setColor(Discord.Colors.Red)
            );
        }

        // 6️⃣ Éxito
        return safeReply(interaction.user, interaction,
            new Discord.EmbedBuilder()
                .setTitle("✅ Registro exitoso")
                .setDescription(`Usuario **${pkmUser}** registrado correctamente.`)
                .setThumbnail(userAvatar)
                .setColor(Discord.Colors.Green)
                .setFooter({ text: "Visita nuestra web para más información." })
                .setTimestamp()
        );
    }
};
