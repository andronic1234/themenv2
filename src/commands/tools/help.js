const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows the bot's Help Menu."),
  async execute(interaction, client) {
    if (interaction.channel === null)
      return interaction.reply({
        content: "This command doesn't work in DMs",
      });
    const MainBtn = uuidv4();
    const MusicBtn = uuidv4();
    const Helpembed = new EmbedBuilder()
      .setTitle(`**Help Menu**`)
      .setColor("DarkGreen")
      .setThumbnail(interaction.guild.iconURL())
      .setTimestamp(Date.now())
      .setAuthor({
        iconURL: interaction.user.displayAvatarURL(),
        name: interaction.user.tag,
      })
      .setFooter({
        text: `Bot made by LilB`,
      })
      .addFields([
        {
          name: `__/ping__`,
          value: `Shows the bot's latency.`,
          inline: false,
        },
        {
          name: `__/clear__`,
          value: `Clears messages from the channel`,
          inline: false,
        },
        {
          name: `__/darryn__`,
          value: `Call Ben and ask him a question.`,
          inline: false,
        },
        {
          name: `__/men__`,
          value: `Display the Men Counter.`,
          inline: false,
        },
        {
          name: `__/leaderboard__`,
          value: `Display the Men Leaderboards.`,
          inline: false,
        },
        {
          name: `__/search__`,
          value: `Searches for a Guild or Player on RealmEye.`,
          inline: false,
        },
        {
          name: `__/set__`,
          value: `Makes an image with a character's item set from RealmEye`,
          inline: false,
        },
      ]);
    const Musicembed = new EmbedBuilder()
      .setTitle(`**Music Menu**`)
      .setColor("DarkBlue")
      .setThumbnail(interaction.guild.iconURL())
      .setTimestamp(Date.now())
      .setAuthor({
        iconURL: interaction.user.displayAvatarURL(),
        name: interaction.user.tag,
      })
      .setFooter({
        text: `Bot made by LilB`,
      })
      .addFields([
        {
          name: `__/join__`,
          value: `Makes the Men join a Voice Channel.`,
          inline: false,
        },
        {
          name: `__/leave__`,
          value: `Makes the Men leave a Voice Channel.`,
          inline: false,
        },
        {
          name: `__/play__`,
          value: `Makes the Men play a song.`,
          inline: false,
        },
        {
          name: `__/pause__`,
          value: `Pauses current song.`,
          inline: false,
        },
        {
          name: `__/skip__`,
          value: `Skips current song.`,
          inline: false,
        },
        {
          name: `__/queue__`,
          value: `Shows the list of songs.`,
          inline: false,
        },
        {
          name: `__/np__`,
          value: `Shows information of the current song.`,
          inline: false,
        },
        {
          name: `__/remove__`,
          value: `Removes song from the queue`,
          inline: false,
        },
        {
          name: `__/shuffle__`,
          value: `Toggle Queue shuffle`,
          inline: false,
        },
        {
          name: `__/loop__`,
          value: `Toggle Queue loop`,
          inline: false,
        },
        {
          name: `__/options__`,
          value: `Shows music options`,
          inline: false,
        },
      ]);

    let HelpEnd = new EmbedBuilder()
      .setTitle("Interaction timed out")
      .setColor("DarkGrey");

    const Helpbtns = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`${MainBtn}`)
        .setEmoji("🛠️")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId(`${MusicBtn}`)
        .setEmoji(`🎶`)
        .setStyle(ButtonStyle.Primary)
    );
    const helpButtonCollector =
      interaction.channel.createMessageComponentCollector({ time: 180000 });
    helpButtonCollector.on("collect", async (i) => {
      try {
        let id = i.customId;

        if (id === `${MainBtn}`) {
          await interaction.editReply({
            embeds: [Helpembed],
            components: [Helpbtns],
            ephemeral: true,
          });
        } else if (id === `${MusicBtn}`) {
          await interaction.editReply({
            embeds: [Musicembed],
            components: [Helpbtns],
            ephemeral: true,
          });
        }
        try {
          await i.deferUpdate();
        } catch {}
      } catch (e) {
        return console.log(e);
      }
    });
    helpButtonCollector.on("end", async () => {
      try {
        await interaction.editReply({
          embeds: [HelpEnd],
          components: [],
        });
      } catch {}
    });

    await interaction.reply({
      embeds: [Helpembed],
      components: [Helpbtns],
      ephemeral: true,
    });
  },
};
