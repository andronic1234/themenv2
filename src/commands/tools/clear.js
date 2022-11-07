const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clears the specified amount of messages")
    .addIntegerOption((option) =>
      option
        .setName("messages")
        .setDescription("Specify number of messages you want to remove")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Specify a user")
        .setRequired(false)
    ),
  async execute(interaction, client) {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageMessages
      )
    ) {
      return interaction.reply("You don't have the permission for that");
    }
    // console.log(interaction.options._hoistedOptions)
    const { channel, options } = interaction;

    const amount = interaction.options._hoistedOptions[0].value;
    var target = interaction.options._hoistedOptions[1];
    if (target) {
      target = interaction.options._hoistedOptions[1].user;
    }
    if (amount > 100)
      return interaction.reply("Limit is 100 messages at a time.");
    const messages = await channel.messages.fetch({
      limit: amount + 1,
    });

    const res = new EmbedBuilder().setColor("DarkAqua");

    if (target) {
      let i = 0;
      const filtered = [];
      (await messages).filter((msg) => {
        if (msg.author.id === target.id && amount > i) {
          filtered.push(msg);
          i++;
        }
      });
      await channel.bulkDelete(filtered).then((messages) => {
        res.setDescription(`Deleted ${messages.size} messages from ${target}.`);
        interaction.reply({ embeds: [res] });
      });
    } else {
      await channel.bulkDelete(amount, true).then((messages) => {
        res.setDescription(
          `Deleted ${messages.size} messages from the channel.`
        );
        interaction.reply({ embeds: [res] });
      });
    }
    await delay(10000);
    channel.bulkDelete(1);
  },
};
