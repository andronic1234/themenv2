const ProfileModel = require("../../schema/profileSchema");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("men")
    .setDescription("Shows your men counter!"),
  async execute(interaction, client) {
    let profileData = await ProfileModel.findOne({
      userID: interaction.user.id,
    });
    if (!profileData) {
      profileData = await new ProfileModel({
        userID: interaction.user.id,
        serverID: interaction.guild.id,
        men: 0,
      });
      await profileData.save().catch(console.error);
    }
    const message = await interaction.deferReply({
      fetchReply: true,
    });
    const menMessage = `**${interaction.user.username}**, you have said men a total of **${profileData.men}** times! Letsgooo!`;
    await interaction.editReply({
      content: menMessage,
    });
  },
};
