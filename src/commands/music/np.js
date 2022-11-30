const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("np")
    .setDescription("Shows current song"),
  async execute(interaction, client) {
    const message = await interaction.deferReply({
      fetchReply: true,
    });

    let Queue = fs.readFileSync("queue.json", "utf8");
    var noQueue = "Nothing is playing men";
    if (!Queue || getVoiceConnection(interaction.guild.id) == undefined)
      return interaction.editReply({
        content: noQueue,
      });

    Queue = JSON.parse(Queue);

    if (interaction.guild.id != Queue[Queue.length - 1].id) {
      let Errmsg = "Error while fetching queue, try again later";
      return interaction.editReply({
        content: Errmsg,
      });
    }

    let NowPlaying = new EmbedBuilder()
      .setTitle("🎶 **Now Playing** 🎶")
      .setColor("DarkGreen")
      .setThumbnail(Queue[0].thumb)
      .addFields([
        {
          name: `Song Information:`,
          value: `[${Queue[0].title}](${Queue[0].url})\n\n**Channel: __${Queue[0].chann}__\nLength: __${Queue[0].time}__**`,
          inline: false,
        },
      ]);

    await interaction.editReply({
      embeds: [NowPlaying],
      ephemeral: true,
    });
  },
};
