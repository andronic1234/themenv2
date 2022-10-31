const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("skip").setDescription("WIP"),
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
