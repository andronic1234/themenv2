const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const fetch = require("node-fetch");
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
          Name.push(json[0].Player);
          newDesc.push(
            `**Player:** __${json[0].Player}__ \n**Characters:** __${json[0].Characters}__ \n**Skins:** __${json[0].Skins}__ \n**Exaltations:** __${json[0].Exaltations}__ \n**Fame:** __${json[0].Fame}__ \n**Rank:** __${json[0].Rank}__ \n**Account Fame:** __${json[0].AccountFame}__`
          );
          for (let i = 0; i < json[0].CharacterList.length; i++) {
            Chars.push(`**Character: ${json[0].CharacterList[i].character} 
                Level: ${json[0].CharacterList[i].level} 
                Fame: ${json[0].CharacterList[i].fame} 
                Ranking: ${json[0].CharacterList[i].pos} 
                Items: \n
                __1__. [${json[0].CharacterList[i].items[0].title}](${json[0].CharacterList[i].items[0].url})  
                __2__. [${json[0].CharacterList[i].items[1].title}](${json[0].CharacterList[i].items[1].url})
                __3__. [${json[0].CharacterList[i].items[2].title}](${json[0].CharacterList[i].items[2].url})  
                __4__. [${json[0].CharacterList[i].items[3].title}](${json[0].CharacterList[i].items[3].url})**\n\n`);
          }
        } else {
          Name.push(json[0].Guild);
          newDesc.push(`**Guild:** ${json[0].Guild} \n**Members:** ${json[0].Members} \n**Characters:** ${json[0].Characters} \n**Fame:** ${json[0].Fame} \n**Most Active on:** ${json[0].MostActiveOn} \n
                `);

          for (let i = 0; i < json[0].GuildMemberData.length; i++) {
            if (json[0].GuildMemberData[i].name === "Private") return;
            Chars.push(`**Member: ${json[0].GuildMemberData[i].name} 
            Guild Rank: ${json[0].GuildMemberData[i].guild_rank} 
            Fame: ${json[0].GuildMemberData[i].fame} 
            Star Rank: ${json[0].GuildMemberData[i].star_rank} 
            Characters: ${json[0].GuildMemberData[i].characters}**\n\n`);
          }
        }
      });
    if (error == true) return;
    let ResultsEmbed = new EmbedBuilder()
      .setTitle(`Data Found:`)
      .setDescription(`${newDesc}`);
    let SecondEmbed = new EmbedBuilder()
      .setTitle(`Data of ${Name}:`)
      .setDescription(`${Chars.slice(Page - 1, Page)}`)
      .setFooter({
        text: `Page ${Page} out of ${Chars.length}`,
      });

    const SearchbtnPrimary = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("main-menu")
        .setEmoji(`<:realmeye:1056306647041069066>`)
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("previous")
        .setEmoji(`<:IMG_20220310_180047:951517086159613992>`)
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("next")
        .setEmoji("<:IMG_20220310_180053:951517086159626240>")
        .setStyle(ButtonStyle.Success)
    );
    const SearchbtnSecondary = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("secondary-menu")
        .setEmoji(`<:Knight:1056305882750799953>`)
        .setStyle(ButtonStyle.Primary)
    );
    const filter = (i) => i.user.id === interaction.user.id;

    const searchButtonCollector =
      interaction.channel.createMessageComponentCollector({
        filter,
        time: 60000,
      });
    searchButtonCollector.on("collect", async (i) => {
      try {
        let id = i.customId;

        if (id === "main-menu") {
          Page = 1;
          SecondEmbed.setDescription(`${Chars.slice(Page - 1, Page)}`);
          SecondEmbed.setFooter({
            text: `Page ${Page} out of ${Chars.length}`,
          });
          await interaction.editReply({
            embeds: [ResultsEmbed],
            components: [SearchbtnSecondary],
            ephemeral: true,
          });
        } else if (id === "secondary-menu") {
          await interaction.editReply({
            embeds: [SecondEmbed],
            components: [SearchbtnPrimary],
            ephemeral: true,
          });
        } else if (id === "next") {
          if (Page < Math.ceil(Chars.length)) {
            Page++;
          }
        } else if (id === "previous") {
          if (Page > 1) {
            Page--;
          }
        }
        if (id === "previous" || id === "next") {
          SecondEmbed.setDescription(`${Chars.slice(Page - 1, Page)}`);
          SecondEmbed.setFooter({
            text: `Page ${Page} out of ${Chars.length}`,
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
      Page = 1;
      await interaction.editReply({
        components: [],
      });
      Chars = [];
    });
    await interaction.editReply({
      embeds: [ResultsEmbed],
      components: [SearchbtnSecondary],
    });
    newDesc = [];
    Name = [];
  },
};
