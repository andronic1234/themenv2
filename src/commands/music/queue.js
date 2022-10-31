const { SlashCommandBuilder } = require("discord.js");
const { getqueue } = require("./play");

module.exports = {
  data: new SlashCommandBuilder().setName("queue").setDescription("WIP"),
  async execute(interaction, client) {
    const message = await interaction.deferReply({
      fetchReply: true,
    });

    return;

    await interaction.editReply({
      content: newMessage,
      ephemeral: true,
    });
  },
};
