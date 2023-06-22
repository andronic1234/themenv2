const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const fetch = require("node-fetch");
const { v4: uuidv4 } = require("uuid");
let newDesc = [];
let Name = [];
let Chars = [];
let Page = 1;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Searches info from RealmEye")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Type what you want to search here.")
        .setRequired(true)
        .addChoices(
          { name: "Player", value: "player" },
          { name: "Guild", value: "guild" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Type the name you want to search here.")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const searchInstances = new Map();
    Chars = [];
    const message = await interaction.deferReply({
      fetchReply: true,
    });
    let input = interaction.options._hoistedOptions[0].value;
    let secondInput = interaction.options._hoistedOptions[1].value;

    let BufferEmbed = new EmbedBuilder()
      .setTitle("Buffering...")
      .setColor("DarkGrey");

    await interaction.editReply({
      embeds: [BufferEmbed],
      ephemeral: true,
    });
    let error = false;
    const InstanceID = uuidv4();
    if (input === "guild") {
      secondInput = secondInput.replace(/ /g, "%20");
    }
    await fetch(`https://realmeye-api.glitch.me/${input}/${secondInput}`)
      .then(async (res) => await res.json())
      .then((json) => {
        if (json.error) {
          error = true;
          interaction.editReply({
            content: `Error: ${json.error}`,
            embeds: [],
          });
          return;
        }
        if (input === "player") {
          Name.push(json.ProfileInfo?.PlayerName);
          newDesc.push(
            `**Player:** __${
              json.ProfileInfo?.PlayerName
            }__\n**Characters:** __${
              typeof json.ProfileInfo.Characters === "undefined"
                ? "hidden"
                : json.ProfileInfo.Characters
            }__\n**Skins:** __${
              typeof json.ProfileInfo.Skins === "undefined"
                ? "hidden"
                : json.ProfileInfo.Skins
            }__\n**Exaltations:** __${
              typeof json.ProfileInfo.Exaltations === "undefined"
                ? "hidden"
                : json.ProfileInfo.Exaltations
            }__\n**Fame:** __${
              typeof json.ProfileInfo.Fame === "undefined"
                ? "hidden"
                : json.ProfileInfo.Fame
            }__\n**Rank:** __${
              typeof json.ProfileInfo.Rank === "undefined"
                ? "hidden"
                : json.ProfileInfo.Rank
            }__\n**Account Fame:** __${
              typeof json.ProfileInfo.AccountFame === "undefined"
                ? "hidden"
                : json.ProfileInfo.AccountFame
            }__\n**Guild:** __${
              typeof json.ProfileInfo.Guild === "undefined"
                ? "hidden"
                : json.ProfileInfo.Guild
            }__\n**Guild Rank:** __${
              typeof json.ProfileInfo.GuildRank === "undefined"
                ? "hidden"
                : json.ProfileInfo.GuildRank
            }__\n**Created:** __${
              typeof json.ProfileInfo.Created === "undefined"
                ? "hidden"
                : json.ProfileInfo.Created
            }__\n**First seen:** __${
              typeof json.ProfileInfo.FirstSeen === "undefined"
                ? "hidden"
                : json.ProfileInfo.FirstSeen
            }__\n**Last seen:** __${
              typeof json.ProfileInfo.LastSeen === "undefined"
                ? "hidden"
                : json.ProfileInfo.LastSeen
            }__`
          );
          if (json.CharacterInfo.length == 0) {
            Chars.push(`No character data`);
          } else {
            for (let i = 0; i < json.CharacterInfo.length; i++) {
              const itemName = json.CharacterInfo[i].items;
              Chars.push(
                `**Character: ${json.CharacterInfo[i].character}\nLevel: ${
                  json.CharacterInfo[i].level
                } \nFame: ${json.CharacterInfo[i].fame} \nRanking: ${
                  json.CharacterInfo[i].pos
                } \nItems: \n__1__. ${
                  itemName[0].title === "No Item"
                    ? "No Item"
                    : `[${itemName[0].title}]`
                }${
                  itemName[0].title === "No Item" ? "" : `(${itemName[0].url})`
                } \n__2__.  ${
                  itemName[1].title === "No Item"
                    ? "No Item"
                    : `[${itemName[1].title}]`
                }${
                  itemName[1].title === "No Item" ? "" : `(${itemName[1].url})`
                } \n__3__. ${
                  itemName[2].title === "No Item"
                    ? "No Item"
                    : `[${itemName[2].title}]`
                }${
                  itemName[2].title === "No Item" ? "" : `(${itemName[2].url})`
                } \n__4__. ${
                  itemName[3].title === "No Item"
                    ? "No Item"
                    : `[${itemName[3].title}]`
                }${
                  itemName[3].title === "No Item" ? "" : `(${itemName[3].url})`
                }**\n\n`
              );
            }
          }
        } else {
          Name.push(json?.Guild);
          newDesc.push(
            `**Guild:** ${json.Guild}\n**Members:** ${json.Members}\n**Characters:** ${json.Characters}\n**Fame:** ${json.Fame}\n**Most Active on:** ${json.MostActiveOn}\n`
          );

          for (let i = 0; i < json.GuildMemberData.length; i++) {
            if (json.GuildMemberData[i].name !== "Private") {
              Chars.push(
                `**Member: ${json.GuildMemberData[i].name}\nGuild Rank: ${json.GuildMemberData[i].guild_rank}\nFame: ${json.GuildMemberData[i].fame}\nStar Rank: ${json.GuildMemberData[i].star_rank}\nCharacters: ${json.GuildMemberData[i].characters}**\n\n`
              );
            }
          }
        }
        const searchResults = {
          Name: Name,
          newDesc: newDesc,
          Chars: Chars,
          Page: Page,
        };

        searchInstances.set(InstanceID, searchResults);
      });
    if (error == true) return;
    const curInstance = searchInstances.get(InstanceID);

    let ResultsEmbed = new EmbedBuilder()
      .setTitle(`Data Found:`)
      .setDescription(`${curInstance?.newDesc}`);
    let SecondEmbed = new EmbedBuilder()
      .setTitle(`Data of ${curInstance?.Name}:`)
      .setDescription(
        `${curInstance?.Chars.slice(curInstance.Page - 1, curInstance.Page)}`
      )
      .setFooter({
        text: `Page ${curInstance.Page} out of ${curInstance.Chars.length}`,
      });
    const main_menu = uuidv4();
    const previous = uuidv4();
    const next = uuidv4();
    const second_menu = uuidv4();
    const SearchbtnPrimary = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`${main_menu}`)
        .setEmoji(`<:realmeye:1056306647041069066>`)
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId(`${previous}`)
        .setEmoji(`<:IMG_20220310_180047:951517086159613992>`)
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`${next}`)
        .setEmoji("<:IMG_20220310_180053:951517086159626240>")
        .setStyle(ButtonStyle.Success)
    );
    const SearchbtnSecondary = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`${second_menu}`)
        .setEmoji(`<:Knight:1056305882750799953>`)
        .setStyle(ButtonStyle.Primary)
    );
    const filter = (i) => i.user.id === interaction.user.id;

    const searchButtonCollector =
      interaction.channel.createMessageComponentCollector({
        filter,
        time: 180000,
      });
    searchButtonCollector.on("collect", async (i) => {
      try {
        let id = i.customId;

        if (id === `${main_menu}`) {
          Page = 1;
          SecondEmbed.setDescription(
            `${curInstance.Chars.slice(curInstance.Page - 1, curInstance.Page)}`
          );
          SecondEmbed.setFooter({
            text: `Page ${curInstance.Page} out of ${curInstance.Chars.length}`,
          });
          await interaction.editReply({
            embeds: [ResultsEmbed],
            components: [SearchbtnSecondary],
            ephemeral: true,
          });
        } else if (id === `${second_menu}`) {
          await interaction.editReply({
            embeds: [SecondEmbed],
            components: [SearchbtnPrimary],
            ephemeral: true,
          });
        } else if (id === `${next}`) {
          if (curInstance.Page < Math.ceil(curInstance.Chars.length)) {
            curInstance.Page++;
          }
        } else if (id === `${previous}`) {
          if (curInstance.Page > 1) {
            curInstance.Page--;
          }
        }
        if (id === `${previous}` || id === `${next}`) {
          SecondEmbed.setDescription(
            `${curInstance.Chars.slice(curInstance.Page - 1, curInstance.Page)}`
          );
          SecondEmbed.setFooter({
            text: `Page ${curInstance.Page} out of ${curInstance.Chars.length}`,
          });
          await interaction.editReply({
            embeds: [SecondEmbed],
            components: [SearchbtnPrimary],
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
    searchButtonCollector.on("end", async () => {
      try {
        await interaction.editReply({
          components: [],
        });
      } catch {}
      Chars = [];
      searchInstances.delete(curInstance);
    });
    await interaction.editReply({
      embeds: [ResultsEmbed],
      components: [SearchbtnSecondary],
    });
    newDesc = [];
    Name = [];
  },
};
