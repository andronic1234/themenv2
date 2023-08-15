const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");
const GetQueue = require("./play");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips current song"),
  async execute(interaction, client) {
    const message = await interaction.deferReply({
      fetchReply: true,
    });
    if (interaction.channel === null)
      return interaction.editReply({
        content: "This command doesn't work in DMs",
      });
    const song_queue = GetQueue.Queue.get(interaction.guild.id);
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    var noQueue = "There is no song to skip men sorri 😔";
    if (
      !song_queue ||
      song_queue.songs.length < 2 ||
      getVoiceConnection(interaction.guild.id) == undefined
    ) {
      return interaction.editReply({
        content: noQueue,
      });
    }

    var playerconnection = getVoiceConnection(interaction.guild.id)._state
      .subscription.player;

    song_queue.songs[0].skipped = true;

    await delay(500);
    playerconnection.pause();

    var newMessage = "Song has been skipped";
    await interaction.editReply({
      content: newMessage,
      ephemeral: true,
    });
  },
};
