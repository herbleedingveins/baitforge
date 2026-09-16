import { CommandInteraction, ModalSubmitInteraction, StringSelectMenuInteraction, ButtonInteraction } from 'discord.js';
import { config } from '../config';
import { logger } from '../utils/logger';

export function isAllowedChannel(channelId: string): boolean {
  return channelId === config.channel.allowedId;
}

export function isOwner(userId: string): boolean {
  return userId === config.owner.userId;
}

export async function requireAllowedChannel(
  interaction: CommandInteraction | ModalSubmitInteraction | StringSelectMenuInteraction | ButtonInteraction
): Promise<boolean> {
  if (!isAllowedChannel(interaction.channelId || '')) {
    const ephemeralReply = {
      content: '🚫 BaitForge commands can only be used in the designated audio channel.',
      ephemeral: true,
    };

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(ephemeralReply);
    } else {
      await interaction.reply(ephemeralReply);
    }

    logger.warn(
      { userId: interaction.user.id, channelId: interaction.channelId, command: 'interaction' },
      'Command attempted in wrong channel'
    );
    return false;
  }
  return true;
}

export async function requireOwner(
  interaction: CommandInteraction | ModalSubmitInteraction | StringSelectMenuInteraction | ButtonInteraction
): Promise<boolean> {
  // Always use the authenticated Discord user ID from the interaction
  if (!isOwner(interaction.user.id)) {
    const ephemeralReply = {
      content: '🔐 Only the BaitForge owner can add or manage bait clips.',
      ephemeral: true,
    };

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(ephemeralReply);
    } else {
      await interaction.reply(ephemeralReply);
    }

    logger.warn(
      { userId: interaction.user.id, attemptedCommand: 'owner-only' },
      'Non-owner attempted owner-only command'
    );
    return false;
  }
  return true;
}
