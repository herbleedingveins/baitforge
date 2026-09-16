import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { requireAllowedChannel, requireOwner } from '../security/permissions';
import { downloadAttachment, validateAudioAttachment, cleanupTempDirectory } from '../audio/download';
import { inspectAudio } from '../audio/inspect';
import { createBait, getBaitByName } from '../storage/baitRepository';
import { createErrorEmbed, createSuccessEmbed } from '../embeds/errorEmbed';
import { logger } from '../utils/logger';
import { config } from '../config';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

export const data = new SlashCommandBuilder()
  .setName('end')
  .setDescription('Add an end bait to the shared bait list (owner only)')
  .addStringOption(option =>
    option.setName('name').setDescription('Name of the end bait').setRequired(true)
  )
  .addAttachmentOption(option =>
    option.setName('audio').setDescription('Audio file').setRequired(true)
  );

export async function execute(interaction: CommandInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: false });

  if (!(await requireAllowedChannel(interaction))) return;
  if (!(await requireOwner(interaction))) return;

  const name = interaction.options.getString('name', true);
  const attachment = interaction.options.getAttachment('audio', true);

  try {
    if (name.length < 1 || name.length > 50) {
      throw new Error('Bait name must be between 1 and 50 characters');
    }

    const existing = await getBaitByName(name, 'end');
    if (existing) {
      throw new Error(`An end bait named "${name}" already exists`);
    }

    await validateAudioAttachment(attachment);

    const jobId = `end-${Date.now()}`;
    const { filePath: downloadedPath, fileName } = await downloadAttachment(attachment, jobId);

    const audioInfo = await inspectAudio(downloadedPath);

    const fileData = await fs.readFile(downloadedPath);
    const checksum = crypto.createHash('sha256').update(fileData).digest('hex');

    const storageDir = path.join(config.storage.path, 'end-baits');
    await fs.mkdir(storageDir, { recursive: true });
    const finalPath = path.join(storageDir, `${jobId}-${fileName}`);
    await fs.cp(downloadedPath, finalPath);

    const bait = await createBait({
      name,
      type: 'end',
      filePath: finalPath,
      originalFilename: fileName,
      fileSizeBytes: fileData.length,
      durationSeconds: audioInfo.durationSeconds,
      highestPeakDbfs: audioInfo.highestPeakDbfs,
      creatorUserId: interaction.user.id,
      enabled: true,
      checksum,
    });

    await cleanupTempDirectory(jobId);

    const embed = createSuccessEmbed(
      '🏁 End Bait Added',
      `Successfully added "${name}" to the end bait list.`
    ).addFields(
      { name: 'Duration', value: `${audioInfo.durationSeconds.toFixed(2)}s`, inline: true },
      { name: 'File Size', value: `${(fileData.length / 1024).toFixed(2)} KB`, inline: true }
    );

    await interaction.editReply({ embeds: [embed] });
    logger.info({ baitId: bait.id, name }, 'End bait added successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const embed = createErrorEmbed('Error', message);
    await interaction.editReply({ embeds: [embed] });
    logger.error({ error, name }, 'Failed to add end bait');
  }
}
