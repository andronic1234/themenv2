const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder().setName("skip").setDescription("WIP"),
  async execute(interaction, client) {
    const message = await interaction.deferReply({
      fetchReply: true,
    });

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    let Queue = fs.readFileSync("queue.json", "utf8");
    Queue = JSON.parse(Queue);
    var noQueue = "There is no song to skip men sorri 😔";
    if (!Queue || Queue.length < 2 || getVoiceConnection(interaction.guild.id) == undefined) {
      return interaction.editReply({
        content: noQueue,
      });
    }

    var playerconnection = getVoiceConnection(interaction.guild.id)._state
      .subscription.player;

    Queue[0].skipped = true;
    let SaveQueue = JSON.stringify(Queue);

    fs.writeFile("queue.json", SaveQueue, function (err) {
      if (err) {
        console.log("Error while saving queue.");
        return console.log(err);
      }
    });
    await delay(500);
    playerconnection.pause();

    var newMessage = "Song has been skipped";
    await interaction.editReply({
      content: newMessage,
      ephemeral: true,
    });
  },
};
