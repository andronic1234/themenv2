const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Shows the Bot's ping")
    .addStringOption((option) =>
      option
        .setName("messages")
        .setDescription("Specify number of messages you want to remove")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const message = await interaction.deferReply({
      fetchReply: true,
    });

    if (!interaction.member.permissions.has("MANAGE_MESSAGES")) {
        return interaction.reply('You don\'t have the permission for that');
    }
    let input = interaction.options._hoistedOptions[0].value;
    let isnum = /^\d+$/.test(input);
    if (isnum(input) == false || input < 0) {
      newMessage = "Please specify the number of messages to clear.";
    } else if ((input = 0)) {
      newMessage = "are u retarded men";
    } else if (input > 100) {
      newMessage = "I can only delete 100 messages at a time men";
    } else {
      newMessage`Deleted **${input}** messages.`;
    }
    await interaction.channel.messages
      .fetch({ limit: input })
      .then((messages) => {
        interaction.channel.bulkDelete(messages);
      });
    await interaction.editReply({
      content: newMessage,
      ephemeral: true,
    });
  },
};
