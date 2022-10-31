const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("amonga")
    .setDescription("amonga real"),
  async execute(interaction, client) {
    await interaction.reply({
      files: [
        {
          attachment: "https://pbs.twimg.com/media/EzsXbgtXMAEmqIr.jpg",
          name: "SPOILER_AMOGUS.jpg",
        },
      ],
      ephemeral: true,
    });
  },
};
