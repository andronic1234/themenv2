const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription(
      "(WIP) Removes songs from queue, to remove multiple songs split song numbers with commas (,)"
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

    let input = interaction.options._hoistedOptions[0].value;
    let isnum = /^\d+$/.test(input);
    if (isnum == true) {
      newMessage = `Removing song with number: ${input}`;
    } else {
      try {
      var b = input.split(',').map(Number);
      console.log(b)
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
