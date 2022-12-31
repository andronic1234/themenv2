const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const { createCanvas, loadImage } = require("canvas");
const fetch = require("node-fetch");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set")
    .setDescription("Gets a Player's set from RealmEye.")
    .addStringOption((option) =>
      option
        .setName("player")
        .setDescription("Specify a player.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("character")
        .setDescription("Specify a character.")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const message = await interaction.deferReply({
      fetchReply: true,
    });
    let player = interaction.options._hoistedOptions[0].value;
    let character = interaction.options._hoistedOptions[1].value;
    player = player.charAt(0).toUpperCase() + player.slice(1);
    character = character.charAt(0).toUpperCase() + character.slice(1);
    try {
      await fetch(
        `https://realmeye-api.glitch.me/player/${player}/${character}/weapon`
      )
        .then(async (res) => await res.json())
        .then((json) => {
          if (json.error) {
            interaction.editReply({ content: `Error: ${json.error}` });
            return;
          }
        });
    } catch {
      const ImgFound = new EmbedBuilder()
        .setTitle("Set Found.")
        .setDescription("**__Creating image__...**");
      interaction.editReply({ embeds: [ImgFound] });
      const width = 184;
      const height = 46;

      const canvas = createCanvas(width, height);
      const context = canvas.getContext("2d");

      context.fillStyle = "#00000000";
      context.fillRect(0, 0, width, height);
      const item = ["weapon", "ability", "armor", "ring"];
      for (let i = 0; i < item.length; i++) {
        await loadImage(
          `https://realmeye-api.glitch.me/player/${player}/${character}/${item[i]}`
        ).then((image) => {
          context.drawImage(image, 0 + i * 46, 0, 46, 46);
          if (i + 1 == item.length) {
            const buffer = canvas.toBuffer("image/png");
            const attachment = new AttachmentBuilder(buffer, {
              name: "ItemSet.png",
            });
            const SetEmbed = new EmbedBuilder()
              .setTitle(`Set of ${player}'s ${character}`)
              .setImage("attachment://ItemSet.png")
              .setColor("Gold");
            interaction.editReply({
              embeds: [SetEmbed],
              files: [attachment],
            });
          }
        });
      }
    }
  },
};
