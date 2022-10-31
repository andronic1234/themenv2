const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows the bot's Help Menu."),
  async execute(interaction, client) {
    const Helpembed = new EmbedBuilder()
      .setTitle(`**Help Menu**`)
      .setColor("DarkGreen")
      .setThumbnail(interaction.guild.iconURL())
      .setTimestamp(Date.now())
      .setAuthor({
        iconURL: interaction.user.displayAvatarURL(),
        name: interaction.user.tag,
      })
      .setFooter({
        text: `Bot made by LilB & PopoChan`,
      })
      .addFields([
        {
          name: `__/ping__`,
          value: `Shows the bot's latency.`,
          inline: false,
        },
        {
          name: `__/darryn__`,
          value: `Call Ben and ask him a question.`,
          inline: false,
        },
        {
          name: `__/men__`,
          value: `Display the Men Counter.`,
          inline: false,
        },
        {
          name: `__/leaderboard__`,
          value: `Display the Men Leaderboards.`,
          inline: false,
        },
        {
          name: `__/join__`,
          value: `Makes the Men join a Voice Channel.`,
          inline: false,
        },
        {
          name: `__/leave__`,
          value: `Makes the Men leave a Voice Channel.`,
          inline: false,
        },
        {
          name: `__/play__`,
          value: `Makes the Men play a song.`,
          inline: false,
        },
      ]);
    await interaction.reply({
      embeds: [Helpembed],
      ephemeral: true,
    });
  },
};
