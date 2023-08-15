const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pauses and Unpauses current song"),
  async execute(interaction, client) {
    const message = await interaction.deferReply({
      fetchReply: true,
    });
    if (interaction.channel === null)
      return interaction.editReply({
        content: "This command doesn't work in DMs",
      });
    let pauseMessage;

    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection) {
      pauseMessage = "I am not in the vc men";
    } else {
      var playerconnection = getVoiceConnection(interaction.guild.id)._state
        .subscription.player;

      if (playerconnection._state.status == "playing") {
        playerconnection.pause();
        pauseMessage = "Player is now paused.";
      } else {
        playerconnection.unpause();
        pauseMessage = "Player is now unpaused.";
      }
    }

    await interaction.editReply({
      content: pauseMessage,
      ephemeral: true,
    });
  },
};
