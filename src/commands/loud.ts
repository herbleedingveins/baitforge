import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { requireAllowedChannel } from '../security/permissions';
import { setUserLoudness } from '../storage/loudnessRepository';
import { logger } from '../utils/logger';

export const data = new SlashCommandBuilder()
  .setName('loud')
  .setDescription('Set the loudness boost for your next /bait job (0-18 dB)')
  .addIntegerOption(option =>
    option
      .setName('boost')
      .setDescription('Loudness boost in dB')
      .setMinValue(0)
      .setMaxValue(18)
      .setRequired(true)
  );

export async function execute(interaction: CommandInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  if (!(await requireAllowedChannel(interaction))) return;

  const boost = interaction.options.getInteger('boost', true);

  try {
    await setUserLoudness(interaction.user.id, boost);

    await interaction.editReply({
      content: `Loudness updated. Your next job will use +${boost} dB.`,
    });

    logger.info({ userId: interaction.user.id, boost }, 'User loudness updated');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to set loudness';
    await interaction.editReply({
      content: `Error: ${message}`,
    });
    logger.error({ error, userId: interaction.user.id, boost }, 'Failed to set loudness');
  }
}
