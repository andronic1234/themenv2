const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const { getVoiceConnection } = require("@discordjs/voice");
const GetQueue = require("./play");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("np")
    .setDescription("Shows current song"),
  async execute(interaction, client) {
    const message = await interaction.deferReply({
      fetchReply: true,
    });

    let song_queue = GetQueue.Queue.get(interaction.guild.id);
    var noQueue = "Nothing is playing men";
    if (
      !song_queue ||
      !song_queue.songs ||
      getVoiceConnection(interaction.guild.id) == undefined ||
      song_queue?.songs[0]?.thumb == undefined
    )
      return interaction.editReply({
        content: noQueue,
      });

    let NowPlaying = new EmbedBuilder()
      .setTitle("🎶 **Now Playing** 🎶")
      .setColor("DarkGreen")
      .setThumbnail(song_queue.songs[0].thumb)
      .addFields([
        {
          name: `Song Information:`,
          value: `[${song_queue.songs[0].title}](${song_queue.songs[0].url})\n\n**Channel: __${song_queue.songs[0].chann}__\nLength: __${song_queue.songs[0].time}__**`,
          inline: false,
        },
      ]);

    await interaction.editReply({
      embeds: [NowPlaying],
      ephemeral: true,
    });
  },
};
