const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");
const GetQueue = require("./play");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription(
      "Removes songs from queue, to remove multiple songs split song numbers with commas (,)"
    )
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("Specify number of song in Queue")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const message = await interaction.deferReply({
      fetchReply: true,
    });
    if (interaction.channel === null)
      return interaction.editReply({
        content: "This command doesn't work in DMs",
      });
    var song_queue = GetQueue.Queue.get(interaction.guild.id);
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    let input = interaction.options._hoistedOptions[0].value;

    let newMessage;
    let isnum = /^\d+$/.test(input);
    if (!song_queue || getVoiceConnection(interaction.guild.id) == undefined)
      return interaction.editReply({
        content: "There is no queue men.",
      });
    if (song_queue.songs.length < 2 == undefined) {
      return interaction.editReply({
        content: "There is no song to skip men sorri 😔",
      });
    }
    if (isnum == true) {
      if (input == 1) {
        let playerconnection = getVoiceConnection(interaction.guild.id)._state
          .subscription.player;

        song_queue.songs[0].skipped = true;

        await delay(500);
        playerconnection.pause();
      }

      if (input > song_queue.songs.length) {
        return interaction.editReply({
          content: "There are not that many songs in the queue men",
        });
      }
      song_queue.songs.splice(input - 1, 1);
      newMessage = `Removed song with number: ${input}`;
    } else {
      try {
        var b = input.split(",").map(Number);

        if (`${b}` == "NaN") {
          newMessage = "Please specify the number of song in queue";
        } else {
          newMessage = `Removed songs ${b} from the queue.`;
          b = b.filter(function (val) {
            return val !== 0;
          });

          for (let i = 0; i < b.length; i++) {
            b.sort((a, b) => b - a);
            if (b[i] == 1 && song_queue.songs.length < 2 == undefined) {
              return interaction.editReply({
                content: "There is no song to skip men sorri 😔",
              });
            } else if (b[i] == 1) {
              let playerconnection = getVoiceConnection(interaction.guild.id)
                ._state.subscription.player;

              song_queue.songs[0].skipped = true;

              await delay(500);
              playerconnection.pause();
            } else {
              if (b[i] > song_queue.songs.length) {
                return interaction.editReply({
                  content: "There are not that many songs in the queue men",
                });
              }
              song_queue.songs.splice(b[i] - 1, 1);
            }
          }
        }
      } catch {
        newMessage = `${input} is not a number men`;
      }
    }

    await interaction.editReply({
      content: newMessage,
      ephemeral: true,
    });
  },
};
