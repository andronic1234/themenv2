const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");
const GetQueue = require("./play");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Shows all requested songs."),
  async execute(interaction, client) {
    const message = await interaction.deferReply({
      fetchReply: true,
    });
    var song_queue = GetQueue.Queue.get(interaction.guild.id);
    var noQueue = "There is no queue men sorri 😔";

    if (
      getVoiceConnection(interaction.guild.id) == undefined ||
      !song_queue ||
      !song_queue.songs ||
      getVoiceConnection(interaction.guild.id)._state.subscription.player._state
        .status == "idle"
    )
      return interaction.editReply({
        content: noQueue,
      });

    let newDesc = [];
    for (let i = 0; i < song_queue.songs.length; i++) {
      newDesc.push(
        `**#${i + 1}** [${song_queue.songs[i].title}](${
          song_queue.songs[i].url
        })`
      );
    }

    let queuePage = 1;

    let QueueEmbed = new EmbedBuilder()
      .setTitle("List of songs:")
      .setColor("Gold")
      .setThumbnail(
        "https://cdn.discordapp.com/attachments/551056320250249219/1036588835661938699/8q8yqy33c7f71.jpg"
      )
      .setAuthor({
        iconURL: interaction.user.displayAvatarURL(),
        name: interaction.user.tag,
      })
      .setDescription(`${newDesc.slice(0, 10).join("\n\n")}`)
      .setFooter({
        text: `Page ${queuePage} out of ${Math.ceil(newDesc.length / 10)}`,
      });

    let QueueEnd = new EmbedBuilder()
      .setTitle("Interaction timed out")
      .setColor("DarkGrey");

    const Queuebtns = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("queue-btn-first")
        .setEmoji("<:647553ccfcb3406e8e0d4814ab9bd01d:951511553222520872>")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("queue-btn-previous")
        .setEmoji(`<:IMG_20220310_180047:951517086159613992>`)
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("queue-btn-next")
        .setEmoji("<:IMG_20220310_180053:951517086159626240>")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("queue-btn-last")
        .setEmoji("<:647553ccfcb3406e8e0d4814ab9bd01d:951511564098359336>")
        .setStyle(ButtonStyle.Success)
    );

    //First Queue page

    const filter = (i) => i.user.id === interaction.user.id;

    const queueButtonCollector =
      message.channel.createMessageComponentCollector({ filter, time: 60000 });
    //Switch pages
    queueButtonCollector.on("collect", async (i) => {
      try {
        let id = i.customId;

        if (id === "queue-btn-first") {
          queuePage = 1;
        } else if (id === "queue-btn-last") {
          queuePage = Math.ceil(newDesc.length / 10);
        } else if (id === "queue-btn-next") {
          if (queuePage < Math.ceil(newDesc.length / 10)) {
            queuePage++;
          } else {
            await i.deferUpdate();
          }
        } else if (id === "queue-btn-previous") {
          if (queuePage > 1) {
            queuePage--;
          }
        }
        try {
          await i.deferUpdate();
        } catch {}
      } catch (e) {
        return console.log(e);
      }
      QueueEmbed.setDescription(
        `${newDesc.slice((queuePage - 1) * 10, queuePage * 10).join("\n\n")}`
      );
      QueueEmbed.setFooter({
        text: `Page ${queuePage} out of ${Math.ceil(newDesc.length / 10)}`,
      });
      await interaction.editReply({
        embeds: [QueueEmbed],
      });
    });
    queueButtonCollector.on("end", async () => {
      await interaction.editReply({
        embeds: [QueueEnd],
        components: [],
      });
    });
    await interaction.editReply({
      embeds: [QueueEmbed],
      components: [Queuebtns],
      ephemeral: true,
    });
  },
};
