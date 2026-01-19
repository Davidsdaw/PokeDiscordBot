const { Client, IntentsBitField, Collection, REST, Routes, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

require('dotenv').config();


const registeredCommands = process.env.REGISTERED_COMMANDS
  ? process.env.REGISTERED_COMMANDS.split(",")
  : [];
// const connectToDatabase = require('./events/database/database');

// connectToDatabase();

const client = new Client({
  intents: new IntentsBitField(3276799)
});

client.commands = new Collection();

// Cargar comandos
const commandsPath = path.join(__dirname, 'commands');

fs.readdirSync(commandsPath).forEach(folder => {
  const folderPath = path.join(commandsPath, folder);

  if (fs.lstatSync(folderPath).isDirectory()) {
    // Leer archivos en la subcarpeta
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      const command = require(filePath);

      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
      }
    }
  } else if (folder.endsWith('.js')) {
    // En caso tengas archivos directamente en /commands también
    const command = require(path.join(commandsPath, folder));
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
    }
  }
});

// fs.readdirSync('./events').forEach(file => {
//   if (!file.endsWith('.js')) return;
//   const event = require(`./events/${file}`);
//   if (!registeredCommands.includes(event.name)) return;
//   if (event.name && event.execute) {
//     client.on(event.name, (...args) => event.execute(...args, client));
//   }
// });

const rest = new REST().setToken(process.env.BOT_TOKEN);

async function registerCommands() {
  
  try {
    const finalCommands = client.commands.filter(cmd =>
      registeredCommands.includes(cmd.data.name)
    );

    await rest.put(
  Routes.applicationCommands(process.env.CLIENT_ID),
  { body: [] }
);
    
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.SERVER_ID),
      {
        body: finalCommands.map(cmd => cmd.data.toJSON())
      }
    );

    console.log(`✅ Han cargado ${finalCommands.size} comandos (/)`);
    console.log("📌 Registrados:", finalCommands.map(c => c.data.name).join(", "));
  } catch (error) {
    console.error("❌ Error al cargar comandos:", error);
  }
}

client.once('ready', async () => {
  console.log(`✅ Bot listo como ${client.user.tag}`);

  await registerCommands();

  try {
    client.user.setActivity('Recopilando muertazos', { type: 4 });
    console.log('✅➡️  Status establecido');
  } catch (error) {
    console.error('❌➡️ Error al establecer el estado:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('❌ Error ejecutando comando:', error);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: '❌ Ocurrió un error al ejecutar el comando.' });
    } else {
      await interaction.reply({ content: '❌ Ocurrió un error al ejecutar el comando.', ephemeral: true });
    }
  }
});



require('./events/messageLog')(client);
client.login(process.env.BOT_TOKEN);
