import { Client, GatewayIntentBits, Events } from 'discord.js';
import { config } from './config';
import { logger } from './utils/logger';
import { initializeDatabase, createTables, closeDatabase } from './storage/database';
import path from 'path';
import fs from 'fs/promises';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const commands = new Map();

client.once(Events.ClientReady, async (readyClient) => {
  logger.info({ username: readyClient.user.username, id: readyClient.user.id }, 'Bot is online');
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error({ error, commandName: interaction.commandName }, 'Command execution failed');
    const reply = {
      content: 'An error occurred while executing this command.',
      ephemeral: true,
    };
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

async function loadCommands(): Promise<void> {
  const commandsDir = path.join(process.cwd(), 'dist', 'commands');
  const files = await fs.readdir(commandsDir);

  for (const file of files) {
    if (file.endsWith('.js') && !file.startsWith('register')) {
      const command = await import(path.join(commandsDir, file));
      if (command.data && command.execute) {
        commands.set(command.data.name, command);
        logger.info({ command: command.data.name }, 'Loaded command');
      }
    }
  }
}

async function main(): Promise<void> {
  try {
    logger.info('Initializing BaitForge bot...');

    await initializeDatabase();
    await createTables();

    await loadCommands();

    await client.login(config.discord.token);

    logger.info('BaitForge bot started successfully');
  } catch (error) {
    logger.fatal({ error }, 'Failed to start bot');
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await closeDatabase();
  await client.destroy();
  process.exit(0);
});

main();
