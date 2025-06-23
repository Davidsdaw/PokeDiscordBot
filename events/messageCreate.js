const UserLevel = require('../events/database/models/UserLevel');

const cooldowns = new Map(); // clave: userId-guildId, valor: timestamp

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const cooldownKey = `${message.author.id}-${message.guild.id}`;
    const now = Date.now();
    const cooldownAmount = 30 * 1000; // 30 segundos

    if (cooldowns.has(cooldownKey)) {
      const expirationTime = cooldowns.get(cooldownKey) + cooldownAmount;

      if (now < expirationTime) return; // Sigue en cooldown, no sumar XP

      cooldowns.delete(cooldownKey);
    }

    cooldowns.set(cooldownKey, now);

    // Sumar XP normalmente:
    const xpToAdd = 10;

    try {
      let userLevel = await UserLevel.findOne({ guildId: message.guild.id, userId: message.author.id });

      if (!userLevel) {
        userLevel = new UserLevel({
          guildId: message.guild.id,
          userId: message.author.id,
          xp: 0,
          level: 1,
        });
      }

      userLevel.xp += xpToAdd;

      const xpNeeded = Math.floor(100 * Math.pow(1.5, userLevel.level - 1));

      if (userLevel.xp >= xpNeeded) {
        userLevel.level++;
        userLevel.xp = userLevel.xp - xpNeeded;

        message.channel.send(`${message.author}, ¡subiste al nivel ${userLevel.level}! 🎉`);
      }

      await userLevel.save();
    } catch (error) {
      console.error('Error en sistema de niveles:', error);
    }
  }
};
