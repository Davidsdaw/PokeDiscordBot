const Discord = require("discord.js");
const supabase = require("../../lib/database/supabaseClient");

module.exports = {
  data: new Discord.SlashCommandBuilder()
    .setName("deleteshiny")
    .setDescription("Elimina un Pokémon shiny de tu colección")
    .addStringOption((option) =>
      option
        .setName("shiny_id")
        .setDescription("ID del Pokémon shiny a eliminar")
        .setRequired(true),
    )
    .addBooleanOption((option) =>
      option
        .setName("confirmar")
        .setDescription("Confirma que deseas eliminar este Pokémon shiny")
        .setRequired(true),
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID;
    const isAdmin = interaction.member.roles.cache.has(ADMIN_ROLE_ID);

    const ROLE_ID = process.env.ROLE_ID;
    if (!interaction.member.roles.cache.has(ROLE_ID)) {
      return interaction.editReply({
        embeds: [
          new Discord.EmbedBuilder()
            .setTitle("❌ Error")
            .setDescription("No tienes permiso para usar este comando.")
            .setColor(Discord.Colors.Red),
        ],
      });
    }
    const ALLOWED_CHANNEL_ID = process.env.ALLOWED_CHANNEL_ID;
    if (interaction.channelId !== ALLOWED_CHANNEL_ID) {
      return interaction.editReply({
        embeds: [
          new Discord.EmbedBuilder()
            .setTitle("❌ Canal incorrecto")
            .setDescription(
              "Este comando solo puede usarse en el canal autorizado.",
            )
            .setColor(Discord.Colors.Red),
        ],
      });
    }

        const shinyId = interaction.options.getString("shiny_id");
        const confirm = interaction.options.getBoolean("confirmar");

        // Obtener shiny
    const { data: shiny, errorr } = await supabase
      .from("shinies")
      .select("*")
      .eq("id_shiny", shinyId)
      .maybeSingle();

    if (!shiny || errorr) {
      return interaction.editReply({
        content: "❌ No se encontró ningún shiny con ese ID."
      });
    }

    if (!isAdmin && shiny.user_id_fk !== interaction.user.id) {
      return interaction.editReply({
        content: "❌ No puedes eliminar un shiny que no es tuyo."
      });
    }

        if (!confirm) {
          return interaction.editReply({
            embeds: [
              new Discord.EmbedBuilder()
                .setTitle("❌ Confirmación requerida")
                .setDescription("Por favor confirma que deseas eliminar este Pokémon shiny.")
                .setColor(Discord.Colors.Red),
            ],
          });
        }
        const { data, error } = await supabase
          .from("shinies")
          .delete()
          .eq("id_shiny", shinyId);
    
        if (error) {
          return interaction.editReply({
            embeds: [
              new Discord.EmbedBuilder()
                .setTitle("❌ Error")
                .setDescription("No se pudo eliminar el Pokémon shiny.")
                .setColor(Discord.Colors.Red),
            ],
          });
        }
    
        return interaction.editReply({
          embeds: [
            new Discord.EmbedBuilder()
              .setTitle("✅ Éxito")
              .setDescription(`Pokémon ${shinyId} eliminado correctamente.`)
              .setColor(Discord.Colors.Green),
          ],
        });
      },
    };
