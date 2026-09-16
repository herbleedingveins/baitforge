import { EmbedBuilder } from 'discord.js';

export interface AudioEmbedData {
  originalFilename: string;
  durationSeconds: number;
  loudnessDb: number;
  highestPeakDbfs: number;
  fileSizeBytes: number;
  frontBaitName: string;
  endBaitName: string;
  outputFormat: string;
  sampleRate?: number;
  channels?: number;
}

export function createAudioEmbed(data: AudioEmbedData): EmbedBuilder {
  const minutes = Math.floor(data.durationSeconds / 60);
  const seconds = Math.round(data.durationSeconds % 60);
  const durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const fileSizeMb = (data.fileSizeBytes / (1024 * 1024)).toFixed(2);

  const embed = new EmbedBuilder()
    .setColor('#FF6B6B')
    .setTitle('🎵 BaitForge Audio Complete')
    .setDescription('Your audio has been forged successfully.')
    .addFields(
      {
        name: '🎵 File',
        value: data.originalFilename,
        inline: false,
      },
      {
        name: '⏱ Duration',
        value: durationStr,
        inline: true,
      },
      {
        name: '🔊 Loudness Boost',
        value: `+${data.loudnessDb} dB`,
        inline: true,
      },
      {
        name: '📈 Highest Peak',
        value: `${data.highestPeakDbfs.toFixed(1)} dBFS`,
        inline: true,
      },
      {
        name: '📦 File Size',
        value: `${fileSizeMb} MB`,
        inline: true,
      },
      {
        name: '🎬 Front Bait',
        value: data.frontBaitName,
        inline: true,
      },
      {
        name: '🏁 End Bait',
        value: data.endBaitName,
        inline: true,
      },
      {
        name: '🎧 Output Format',
        value: data.outputFormat,
        inline: true,
      }
    );

  if (data.sampleRate) {
    embed.addFields({
      name: '🎼 Sample Rate',
      value: `${(data.sampleRate / 1000).toFixed(1)} kHz`,
      inline: true,
    });
  }

  if (data.channels) {
    embed.addFields({
      name: '🔈 Channels',
      value: data.channels === 1 ? 'Mono' : data.channels === 2 ? 'Stereo' : `${data.channels}-channel`,
      inline: true,
    });
  }

  embed.setFooter({ text: 'Made by slurz · BaitForge' });

  return embed;
}
