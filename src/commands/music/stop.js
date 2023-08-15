const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const { getVoiceConnection } = require("@discordjs/voice");
const GetQueue = require("./play");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stops playing songs"),
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
    var playerconnection = getVoiceConnection(interaction.guild.id)._state
      .subscription.player;
    playerconnection.stop();
    GetQueue.Queue.delete(interaction.guild.id);

    await interaction.editReply({
      content: "Player has stopped.",
    });
  },
};
