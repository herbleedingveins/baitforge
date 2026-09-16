import { REST, Routes } from 'discord.js';
import { config } from '../config';
import { logger } from '../utils/logger';

import { data as frontData } from './front';
import { data as endData } from './end';
import { data as loudData } from './loud';
import { data as baitData } from './bait';

const commands = [
  frontData.toJSON(),
  endData.toJSON(),
  loudData.toJSON(),
  baitData.toJSON(),
];

async function registerCommands(): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(config.discord.token);

  try {
    logger.info('Registering slash commands...');

    await rest.put(
      Routes.applicationCommands(config.discord.applicationId),
      { body: commands }
    );

    logger.info({ count: commands.length }, 'Slash commands registered');
  } catch (error) {
    logger.error({ error }, 'Failed to register commands');
    throw error;
  }
}

registerCommands();
