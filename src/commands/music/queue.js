const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Shows all requested songs."),
  async execute(interaction, client) {
    const message = await interaction.deferReply({
      fetchReply: true,
    });
    let Queue = fs.readFileSync("queue.json", "utf8");
    var noQueue = "There is no queue men sorri 😔";
    if (!Queue || getVoiceConnection(interaction.guild.id) == undefined)
      return interaction.editReply({
        content: noQueue,
      });

    Queue = JSON.parse(Queue);

    let newDesc = [];

    for (let i = 0; i < Queue.length; i++) {
      newDesc.push(`**#${i + 1}** [${Queue[i].title}](${Queue[i].url})`);
    }

    let QueueEmbed = new EmbedBuilder()
      .setTitle("List of songs:")
      .setColor("Gold")
      .setThumbnail(
        "https://cdn.discordapp.com/attachments/551056320250249219/1036588835661938699/8q8yqy33c7f71.jpg"
      )
      .setAuthor({
        iconURL: interaction.user.displayAvatarURL(),
        name: interaction.user.tag,
      })
      .setDescription(`${newDesc.slice(0, 10).join("\n\n")}`);

    await interaction.reply({
      embeds: [QueueEmbed],
      ephemeral: true,
    });
  },
};
