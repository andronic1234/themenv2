const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder} = require("discord.js");
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
    let player = interaction.options._hoistedOptions[0].value
    let character = interaction.options._hoistedOptions[1].value
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
      const width = 184;
      const height = 46;

      const canvas = createCanvas(width, height);
      const context = canvas.getContext("2d");

      context.fillStyle = "#00000000";
      context.fillRect(0, 0, width, height);

      loadImage(
        `https://realmeye-api.glitch.me/player/${player}/${character}/weapon`
      ).then((image) => {
        context.drawImage(image, 0, 0, 46, 46);
        loadImage(
          `https://realmeye-api.glitch.me/player/${player}/${character}/ability`
        ).then((image) => {
          context.drawImage(image, 46, 0, 46, 46);
          loadImage(
            `https://realmeye-api.glitch.me/player/${player}/${character}/armor`
          ).then((image) => {
            context.drawImage(image, 92, 0, 46, 46);
            loadImage(
              `https://realmeye-api.glitch.me/player/${player}/${character}/ring`
            ).then((image) => {
              context.drawImage(image, 138, 0, 46, 46);
              const buffer = canvas.toBuffer("image/png");
              const attachment = new AttachmentBuilder(buffer, {name: 'ItemSet.png'})
                const SetEmbed = new EmbedBuilder()
                .setTitle(`Set of ${player}'s ${character}`)
              interaction.editReply({
                embeds: [SetEmbed],
                files: [attachment]
              });
            });
          });
        });
      });
    }
  },
};
