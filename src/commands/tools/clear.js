const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

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
    // if (!interaction.member.permissions.has("MANAGE_MESSAGES")) {
    //   return interaction.reply("You don't have the permission for that");
    // }
    // console.log(interaction.options._hoistedOptions)
    const { channel, options } = interaction;

    const amount = interaction.options._hoistedOptions[0].value;
    var target = interaction.options._hoistedOptions[1]
    if(target) {
        target = interaction.options._hoistedOptions[1].user;
    }

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
        res.setDescription(`Deleted ${messages.size} messages from the channel.`);
        interaction.reply({ embeds: [res] });
      });
    }
  },
};
