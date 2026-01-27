const Discord = require("discord.js");
const supabase = require("../../lib/database/supabaseClient");

module.exports = {
  data: new Discord.SlashCommandBuilder()
    .setName("editshiny")
    .setDescription("Edita la información de un Pokémon shiny en tu colección")

    // ID (OBLIGATORIO)
    .addStringOption((option) =>
      option
        .setName("shiny_id")
        .setDescription("ID del Pokémon shiny a editar")
        .setRequired(true),
    )

    // OPCIONALES
    .addStringOption((option) =>
      option
        .setName("pokemon")
        .setDescription("Nombre del Pokémon shiny")
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("metodo")
        .setDescription("Método de obtención del shiny")
        .setRequired(false)
        .addChoices(
          { name: "Huevos", value: "Huevo" },
          { name: "Horda", value: "Horda" },
          { name: "Single", value: "Single" },
          { name: "Safari", value: "Safari" },
          { name: "Evento", value: "Evento" },
          { name: "Pokeball", value: "Pokeball" },
          { name: "Fosil", value: "Fosil" },
          { name: "Manada", value: "Manada" },
        ),
    )
    .addNumberOption((option) =>
      option
        .setName("año")
        .setDescription("Año de obtención")
        .setRequired(false),
    )
    .addNumberOption((option) =>
      option
        .setName("mes")
        .setDescription("Mes de obtención")
        .setRequired(false),
    )
    .addNumberOption((option) =>
      option
        .setName("dia")
        .setDescription("Día de obtención")
        .setRequired(false),
    )
    .addStringOption((option) =>
      option.setName("ruta").setDescription("Ruta").setRequired(false),
    )
    // IVs
    .addNumberOption((option) =>
      option.setName("ps").setDescription("IV PS").setRequired(false),
    )
    .addNumberOption((option) =>
      option.setName("atk").setDescription("IV ATK").setRequired(false),
    )
    .addNumberOption((option) =>
      option.setName("def").setDescription("IV DEF").setRequired(false),
    )
    .addNumberOption((option) =>
      option.setName("spa").setDescription("IV SPA").setRequired(false),
    )
    .addNumberOption((option) =>
      option.setName("spd").setDescription("IV SPD").setRequired(false),
    )
    .addNumberOption((option) =>
      option.setName("spe").setDescription("IV SPE").setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName("secret")
        .setDescription("¿Es shiny secreto?")
        .setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName("alpha")
        .setDescription("¿Es shiny alpha?")
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("naturaleza")
        .setDescription("Naturaleza del shiny")
        .setRequired(false)
        .addChoices(
          { name: "Osada", value: "Osada" },
          { name: "Modesta", value: "Modesta" },
          { name: "Serena", value: "Serena" },
          { name: "Miedosa", value: "Miedosa" },
          { name: "Huraña", value: "Huraña" },
          { name: "Afable", value: "Afable" },
          { name: "Amable", value: "Amable" },
          { name: "Activa", value: "Activa" },
          { name: "Firme", value: "Firme" },
          { name: "Agitada", value: "Agitada" },
          { name: "Cauta", value: "Cauta" },
          { name: "Alegre", value: "Alegre" },
          { name: "Pícara", value: "Picara" },
          { name: "Floja", value: "Floja" },
          { name: "Alocada", value: "Alocada" },
          { name: "Ingenua", value: "Ingenua" },
          { name: "Audaz", value: "Audaz" },
          { name: "Plácida", value: "Placida" },
          { name: "Mansa", value: "Mansa" },
          { name: "Grosera", value: "Grosera" },
          { name: "Fuerte", value: "Fuerte" },
          { name: "Dócil", value: "Docil" },
          { name: "Seria", value: "Seria" },
          { name: "Tímida", value: "Timida" },
          { name: "Rara", value: "Rara" },
        ),
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    // ===== PERMISOS =====
    const ROLE_ID = process.env.ROLE_ID;
    const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID;
    const isAdmin = interaction.member.roles.cache.has(ADMIN_ROLE_ID);

    if (!interaction.member.roles.cache.has(ROLE_ID)) {
      return interaction.editReply(
        "❌ No tienes permiso para usar este comando.",
      );
    }

    const ALLOWED_CHANNEL_ID = process.env.ALLOWED_CHANNEL_ID;
    if (interaction.channelId !== ALLOWED_CHANNEL_ID) {
      return interaction.editReply(
        "❌ Este comando solo puede usarse en el canal autorizado.",
      );
    }

    // ===== OBTENER SHINY =====
    const shinyId = interaction.options.getString("shiny_id");

    const { data: shiny, error } = await supabase
      .from("shinies")
      .select("*")
      .eq("id_shiny", shinyId)
      .maybeSingle();

    if (!shiny || error) {
      return interaction.editReply(
        "❌ No se encontró ningún shiny con ese ID.",
      );
    }

    const { data: user, errorUser } = await supabase
      .from("profiles")
      .select("*")
      .eq("discord_id", interaction.user.id)
      .maybeSingle();


    // Validar propiedad
    if (!isAdmin && user.id !== shiny.user_id_fk) {
      return interaction.editReply(
        "❌ No puedes editar un shiny que no es tuyo.",
      );
    }

    // ===== CONSTRUIR UPDATE DINÁMICO =====
    const updatedData = {};

    // Campos simples
    const pokemon = interaction.options.getString("pokemon");
    if (pokemon) updatedData.pokemon_name = pokemon;

    const metodo = interaction.options.getString("metodo");
    if (metodo) updatedData.method = metodo;

    const ruta = interaction.options.getString("ruta");
    if (ruta) updatedData.route_caught = ruta;

    const naturaleza = interaction.options.getString("naturaleza");
    if (naturaleza) updatedData.nature = naturaleza;

    const secret = interaction.options.getBoolean("secret");
    if (secret !== null) updatedData.is_secret = secret;

    const alpha = interaction.options.getBoolean("alpha");
    if (alpha !== null) updatedData.is_alpha = alpha;

    // ===== IVs (JSON) =====
    let ivs = shiny.ivs?.[0] || {
      ps: 0,
      atk: 0,
      def: 0,
      spa: 0,
      spd: 0,
      spe: 0,
    };

    const ps = interaction.options.getNumber("ps");
    if (ps !== null) ivs.ps = ps;

    const atk = interaction.options.getNumber("atk");
    if (atk !== null) ivs.atk = atk;

    const def = interaction.options.getNumber("def");
    if (def !== null) ivs.def = def;

    const spa = interaction.options.getNumber("spa");
    if (spa !== null) ivs.spa = spa;

    const spd = interaction.options.getNumber("spd");
    if (spd !== null) ivs.spd = spd;

    const spe = interaction.options.getNumber("spe");
    if (spe !== null) ivs.spe = spe;

    updatedData.ivs = [ivs];

    // ===== Fecha (solo si vienen los 3) =====
    const year = interaction.options.getNumber("año");
    const month = interaction.options.getNumber("mes");
    const day = interaction.options.getNumber("dia");

    if ((year !== null || month !== null || day !== null) && !(year !== null && month !== null && day !== null)) {
      return interaction.editReply(
      "⚠️ Para actualizar la fecha, debes proporcionar el año, mes y día.",
      );
    }

    //COMPROBAR VALIDACIONES DE FECHA, ESTÁ MAL HECHO COPIAR DE ADDSHINY
    if (year !== null && month !== null && day !== null) {
      updatedData.date_caught = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }

    // Nada que actualizar
    if (Object.keys(updatedData).length === 0) {
      return interaction.editReply(
        "⚠️ No has proporcionado ningún campo para actualizar.",
      );
    }

    // ===== UPDATE =====
    const { error: updateError } = await supabase
      .from("shinies")
      .update(updatedData)
      .eq("id_shiny", shinyId);

    if (updateError) {
      return interaction.editReply(
        `❌ Error al actualizar el shiny: ${updateError.message}`,
      );
    }

    return interaction.editReply(
      `✅ **${shiny.pokemon_name}** actualizado correctamente.`,
    );
  },
};
