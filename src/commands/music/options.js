const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const GetOptions = require("./play");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("options")
    .setDescription("Checks music options"),
  async execute(interaction, client) {
    let Options = GetOptions.options;

    let search = Options.findIndex(
      (ID) => ID.guildID == `${interaction.guild.id}`
    );

    if (search == -1) {
      Options.push({
        guildID: interaction.guild.id,
        shuffle: false,
        loop: false,
      });
    }
    search = Options.findIndex((ID) => ID.guildID == `${interaction.guild.id}`);

    let a, b;
    if (Options[search].shuffle == false) {
      a = "**off**";
    } else {
      a = "**on**";
    }
    if (Options[search].loop == false) {
      b = "**off**";
    } else {
      b = "**on**";
    }

    const OptionsEmbed = new EmbedBuilder()
      .setTitle("Options Config")
      .setColor("Fuchsia")
      .setThumbnail(
        "https://cdn.discordapp.com/attachments/551056320250249219/1036588835661938699/8q8yqy33c7f71.jpg"
      )
      .addFields([
        {
          name: `shuffle:`,
          value: a,
          inline: true,
        },
        {
          name: `loop:`,
          value: b,
          inline: true,
        },
      ]);

    await interaction.reply({
      embeds: [OptionsEmbed],
      ephemeral: true,
    });
  },
};
