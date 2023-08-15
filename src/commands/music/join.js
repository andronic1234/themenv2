const { SlashCommandBuilder, ChannelType } = require("discord.js");
const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Makes the Men join the Voice Channel.")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Specify a channel")
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildVoice)
    ),
  async execute(interaction, client) {
    if (interaction.channel === null)
      return interaction.reply({
        content: "This command doesn't work in DMs",
      });
    let voiceChannel = interaction.options.getChannel("channel");
    if (!voiceChannel) {
      voiceChannel = interaction.member.voice.channel;
    }
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    let joinMessage;
    const connected = getVoiceConnection(voiceChannel.guild.id);
    if (!connected) {
      joinMessage = `I am already in a vc men`;
    } else {
      connection;
      joinMessage = `Hello how are you i am in vc now`;
    }

    await interaction.reply({
      content: joinMessage,
    });
  },
};
