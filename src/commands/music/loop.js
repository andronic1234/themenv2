const { SlashCommandBuilder } = require("discord.js");
const GetOptions = require("./play");

module.exports = {
  data: new SlashCommandBuilder().setName("loop").setDescription("Loops Queue"),
  async execute(interaction, client) {
    const message = await interaction.deferReply({
      fetchReply: true,
    });
    if (interaction.channel === null)
      return interaction.editReply({
        content: "This command doesn't work in DMs",
      });

    let newMessage;
    let Options = GetOptions.options;
    let result = -1;

    let search = Options.findIndex(
      (ID) => ID.guildID == `${interaction.guild.id}`
    );
    if (search > result) {
      result = search;
    }

    try {
      if (result == -1) {
        Options.push({
          guildID: interaction.guild.id,
          shuffle: false,
          loop: false,
        });
        result = Options.length - 1;
      }
      if (Options[result].loop == false) {
        Options[result].loop = true;
        newMessage = "Looping is enabled";
      } else {
        Options[result].loop = false;
        newMessage = "Looping is disabled";
      }
    } catch (err) {
      console.log(err);
      newMessage = "There was an error while trying to execute this command";
    }

    await interaction.editReply({
      content: newMessage,
      ephemeral: true,
    });
  },
};
