import { EmbedBuilder } from 'discord.js';

export function createErrorEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: 'Made by slurz · BaitForge' });
}

export function createWarningEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor('#FFA500')
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: 'Made by slurz · BaitForge' });
}

export function createSuccessEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: 'Made by slurz · BaitForge' });
}
