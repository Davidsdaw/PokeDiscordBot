const GuildConfig = require('./database/models/GuildConfig');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {

  // Si la interacción viene de un DM
  if (interaction.channel?.type === 1) { // 1 es tipo DM en discord.js v14
    const allowedCommandsInDM = ['players'];
    if (!allowedCommandsInDM.includes(interaction.commandName)) {
      return interaction.reply({
        content: '❌ Este comando no está disponible por mensajes directos.',
        ephemeral: true,
      });
    }
  }

  // Comandos
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return interaction.reply({ content: '❌ Comando no encontrado.', ephemeral: true });

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error('❌ Error ejecutando comando:', error);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ Hubo un error ejecutando el comando.', ephemeral: true });
      }
    }
  }

    // Botones de verificación
    if (interaction.isButton()) {
      const [action, decision, userId] = interaction.customId.split('_');
      if (action !== 'verify') return;

      try {
        const member = await interaction.guild.members.fetch(userId).catch(() => null);
        if (!member) {
          return await interaction.reply({ content: '❌ No se encontró al usuario.', ephemeral: true });
        }

        const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
        if (!config || !config.memberRoleId) {
          return await interaction.reply({ content: '❌ El rol de miembro no está configurado.', ephemeral: true });
        }

        if (decision === 'accept') {
          await member.roles.add(config.memberRoleId);
          await interaction.update({ content: `✅ Verificación aceptada para ${member.user.tag}`, components: [] });
          try {
            await member.send(`🎉 Has sido verificado en **${interaction.guild.name}**.`);
          } catch {}
        } else if (decision === 'reject') {
          await interaction.update({ content: `❌ Verificación rechazada para ${member.user.tag}`, components: [] });
          try {
            await member.send(`🚫 Tu solicitud fue rechazada en **${interaction.guild.name}**.`);
          } catch {}
        }
      } catch (error) {
        console.error('Error en verificación por botón:', error);
        if (!interaction.replied) {
          await interaction.reply({ content: '❌ Error al procesar la verificación.', ephemeral: true });
        }
      }
    }
  }
};
