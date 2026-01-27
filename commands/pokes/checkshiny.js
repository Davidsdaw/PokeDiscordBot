const supabase = require("../../lib/database/supabaseClient");
const Discord = require("discord.js");

module.exports = {
  data: new Discord.SlashCommandBuilder()
    .setName("checkshiny")
    .setDescription("Verifica tus Pokémon shiny o los de otro usuario")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("Ve los pokemón shiny de otro usuario")
        .setRequired(false),
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

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

    // Usuario objetivo
    const targetUser =
      interaction.options.getUser("usuario") || interaction.user;

    const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID;

    const isAdmin = interaction.member.roles.cache.has(ADMIN_ROLE_ID);

    // Si NO se pasó la opción usuario (o sea, se revisa a sí mismo)
    const isSelfCheck = !interaction.options.getUser("usuario");

    // Mostrar ID si es self o admin
    const showPokemonId = isAdmin || isSelfCheck;

    // Obtener perfil
    const { data: userData } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("discord_id", targetUser.id)
      .maybeSingle();

    if (!userData) {
      return interaction.editReply({
        embeds: [
          new Discord.EmbedBuilder()
            .setTitle("❌ Error")
            .setDescription(`El usuario ${targetUser.tag} no está registrado.`)
            .setColor(Discord.Colors.Red),
        ],
      });
    }

    // Obtener shinies
    const { data: shinyData } = await supabase
      .from("shinies")
      .select("*")
      .eq("user_id_fk", userData.id);

    if (!shinyData || shinyData.length === 0) {
      return interaction.editReply({
        embeds: [
          new Discord.EmbedBuilder()
            .setTitle("❌ Sin shinies")
            .setDescription(`${targetUser.tag} no tiene shinies registrados.`)
            .setColor(Discord.Colors.Red),
        ],
      });
    }

    // ===============================
    // 🔥 PAGINACIÓN + EMBED GOD
    // ===============================

    const PAGE_SIZE = 5;
    let page = 0;
    const totalPages = Math.ceil(shinyData.length / PAGE_SIZE);

    const ivBar = (val) => {
      const totalBlocks = 5; // siempre 5 cuadrados máximo
      if (!val) return "⬜".repeat(totalBlocks); // 0 o null

      if (val === 31) return "🟩".repeat(totalBlocks); // máximo 31 → 5 verdes

      // proporcional sin pasar de 4 verdes si no es 31
      const filled = Math.floor((val / 31) * totalBlocks);
      return "🟩".repeat(filled) + "⬜".repeat(totalBlocks - filled);
    };

    const getSprite = (name) => {
      const formattedName = name
        .toLowerCase()
        .replace("mr-mime", "mrmime")
        .replace("nidoran-f", "nidoranf")
        .replace("nidoran-m", "nidoranm")
        .replace("farfetchd", "farfetchd")
        .replace("wormadam-plant", "wormadam")
        .replace("mime-jr", "mimejr")
        .replace("giratina-altered", "giratina")
        .replace("shaymin-land", "shaymin")
        .replace("basculin-red-striped", "basculin")
        .replace("darmanitan-standard", "darmanitan")
        .replace("thundurus-incarnate", "thundurus")
        .replace("tornadus-incarnate", "tornadus")
        .replace("keldeo-ordinary", "keldeo")
        .replace("meloetta-aria", "meloetta")
        .replace("meowstic-male", "meowstic")
        .replace("landorus-incarnate", "landorus")
        .replace("deoxys-normal", "deoxys");
      return `https://play.pokemonshowdown.com/sprites/ani-shiny/${formattedName}.gif`;
    };

    const buildEmbed = (page) => {
      const start = page * PAGE_SIZE;
      const current = shinyData.slice(start, start + PAGE_SIZE);

      const fields = current.map((shiny) => {
        const ivs = shiny.ivs?.[0];

        const formatIV = (label, value) => {
          return `${ivBar(value)} | ${label.padEnd(3)} | ${String(value ?? 0).padStart(2)}`;
        };

        const ivText = ivs
          ? [
              formatIV("PS", ivs.ps),
              formatIV("Atk", ivs.atk),
              formatIV("Def", ivs.def),
              formatIV("SpA", ivs.spa),
              formatIV("SpD", ivs.spd),
              formatIV("Spe", ivs.spe),
            ].join("\n")
          : "IVs no disponibles";

        const badges = [
          shiny.is_favorite ? "⭐" : null,
          shiny.is_secret ? "🔒" : null,
          shiny.is_alpha ? "🅰️" : null,
        ]
          .filter(Boolean)
          .join(" ");

        const idLine = showPokemonId ? `**ID:** \`${shiny.id_shiny}\`\n` : "";

        return {
          name: `✨ ${shiny.pokemon_name} ${badges}`,
          value:
            idLine +
            `**Método:** ${shiny.method || "Desconocido"}\n` +
            `**Fecha:** ${shiny.date_caught ?? "Desconocida"}\n` +
            `**Ruta:** ${shiny.route_caught || "Ruta desconocida"}\n` +
            `**Naturaleza:** ${shiny.naturaleza || "Desconocida"}\n\n` +
            `**IVs:**\n\`\`\`\n${ivText}\n\`\`\``,
          inline: false,
        };
      });

      return new Discord.EmbedBuilder()
        .setColor(Discord.Colors.Gold)
        .setAuthor({ name: "✨ Shiny Showcase" })
        .setTitle(`Shinies de ${userData.username}`)
        .setDescription(
          `Total: **${shinyData.length}** shinies\n` +
            `Página **${page + 1}/${totalPages}**\n\n` +
            "> ⭐ Favorito · 🔒 Secreto · 🅰️ Alpha",
        )
        .setThumbnail(getSprite(current[0].pokemon_name))
        .addFields(fields)
        .setTimestamp();
    };

    const row = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setCustomId("prev")
        .setLabel("⬅️ Anterior")
        .setStyle(Discord.ButtonStyle.Secondary)
        .setDisabled(page === 0),
      new Discord.ButtonBuilder()
        .setCustomId("next")
        .setLabel("Siguiente ➡️")
        .setStyle(Discord.ButtonStyle.Secondary)
        .setDisabled(page === totalPages - 1),
    );

    const message = await interaction.editReply({
      embeds: [buildEmbed(page)],
      components: [row],
    });

    const collector = message.createMessageComponentCollector({ time: 120000 });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: "❌ No es tu showcase.", ephemeral: true });
      }

      if (i.customId === "prev" && page > 0) page--;
      if (i.customId === "next" && page < totalPages - 1) page++;

      row.components[0].setDisabled(page === 0);
      row.components[1].setDisabled(page === totalPages - 1);

      await i.update({
        embeds: [buildEmbed(page)],
        components: [row],
      });
    });
  },
};
