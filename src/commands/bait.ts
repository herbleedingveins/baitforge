import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { requireAllowedChannel } from '../security/permissions';
import { getAllBaitsOfType } from '../storage/baitRepository';
import { createErrorEmbed } from '../embeds/errorEmbed';
import { logger } from '../utils/logger';

export const data = new SlashCommandBuilder()
  .setName('bait')
  .setDescription('Create forged audio by combining front bait + audio + end bait');

export async function execute(interaction: CommandInteraction): Promise<void> {
  if (!(await requireAllowedChannel(interaction))) {
    await interaction.reply({
      content: 'BaitForge commands can only be used in the designated audio channel.',
      ephemeral: true,
    });
    return;
  }

  try {
    const frontBaits = await getAllBaitsOfType('front');
    const endBaits = await getAllBaitsOfType('end');

    if (frontBaits.length === 0 || endBaits.length === 0) {
      const embed = createErrorEmbed(
        'Missing Bait Clips',
        'The BaitForge owner needs to add front and end bait clips first.'
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    await interaction.reply({
      content: 'Bait wizard starting...',
      ephemeral: true,
    });

    logger.info({ userId: interaction.user.id }, 'Bait command executed');
  } catch (error) {
    logger.error({ error, userId: interaction.user.id }, 'Failed to start bait wizard');
    const embed = createErrorEmbed('Error', 'Failed to start the bait wizard');
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
