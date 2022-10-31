const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Makes the Men leave the Voice Channel."),
  async execute(interaction, client) {
    let voiceChannel = interaction.member.voice.channel;
    const connection = getVoiceConnection(voiceChannel.guild.id);
    if (connection) {
      connection.destroy();
      var leaveMessage = `Bye have a great time men`;
    } else {
      var leaveMessage = `I am not in the vc men`;
    }
    await interaction.reply({
      content: leaveMessage,
    });
  },
};
