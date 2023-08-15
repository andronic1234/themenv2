const ProfileModel = require("../../schema/profileSchema");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Shows the Men Leaderboard."),
  async execute(interaction, client) {
    if (interaction.channel === null)
      return interaction.reply({
        content: "This command doesn't work in DMs",
      });
    let profileBoard = await ProfileModel.find({});

    var members = [];

    interaction.guild.members.fetch().then((memb) => {
      let membid = memb.map((user) => user.id);
      for (let obj of profileBoard) {
        if (membid.includes(obj.userID)) {
          members.push(obj);
        }
      }

      const Lead = new EmbedBuilder()
        .setColor("DarkGreen")
        .setThumbnail(interaction.guild.iconURL())
        .setTitle("The Men Leaderboard")
        .setTimestamp();

      members = members.sort(function (b, a) {
        return a.men - b.men;
      });

      members = members.filter(function BigEnough(value) {
        return value.men > 0;
      });

      let pos = 0;
      for (let obj of members) {
        pos++;
        if (obj.userID == interaction.member.user.id) {
          Lead.setFooter({
            text: `You're No.${pos} in the Leaderboard`,
          });
        }
      }

      members = members.slice(0, 10);
      let desc = "";
      for (let i = 0; i < members.length; i++) {
        let val = members[i].men;
        desc += `**${i + 1}.** __<@${members[i].userID}>__ - ${val}\n`;
      }

      Lead.setDescription(desc);
      interaction.reply({
        embeds: [Lead],
      });
    });
  },
};
