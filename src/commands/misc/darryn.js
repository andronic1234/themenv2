const { SlashCommandBuilder, channelLink } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("darryn").setDescription("Ask Ben a question."),
  async execute(interaction, client) {
    const answers = ["Yees? 🥰", "Noo 😔", "Ughhhh 😩", "HoHoHo! 🎅"];
    const answer = Math.floor(Math.random() * answers.length);
    const message = await interaction.deferReply({
      fetchReply: true,
    });

    const benMessage = `*Ben?*`;
    await interaction.editReply({
      content: benMessage,
    });
    const collector = interaction.channel.createMessageCollector({
      time: 30000,
      max: 1,
    });
    collector.on("collect", (m) => {
      interaction.followUp({
        content: answers[answer],
      });
    });
  },
};
