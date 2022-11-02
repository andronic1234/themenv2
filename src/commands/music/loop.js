const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder().setName("loop").setDescription("Loops Queue"),
  async execute(interaction, client) {
    const message = await interaction.deferReply({
      fetchReply: true,
    });

    let newMessage;

    let Options = fs.readFileSync("options.json", "utf8");
    Options = JSON.parse(Options);


    if (Options[0].loop == false) {
      console.log('passes')
      Options[0].loop = true;
      newMessage = "Looping is enabled.";
    } else {
      Options[0].loop = false;
      newMessage = "Looping is disabled.";
    }

    let SaveOpt = JSON.stringify(Options);

    fs.writeFile("options.json", SaveOpt, function (err) {
      if (err) {
        console.log("Error while saving options.");
        return console.log(err);
      }
    });

    await interaction.editReply({
      content: newMessage,
      ephemeral: true,
    });
  },
};
