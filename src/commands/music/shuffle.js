const { SlashCommandBuilder } = require("discord.js");
const GetOptions = require("./play");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffles Queue"),
  async execute(interaction, client) {
    const message = await interaction.deferReply({
      fetchReply: true,
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
      if (Options[result].shuffle == false) {
        Options[result].shuffle = true;
        newMessage = "Shuffling is enabled";
      } else {
        Options[result].shuffle = false;
        newMessage = "Shuffling is disabled";
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
