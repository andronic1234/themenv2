const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
let newDesc = [];
let errstr = "";
let Chars = [];
let charDesc;

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
        .setName("params")
        .setDescription("Type the name you want to search here.")
        .setRequired(true)
    ),
  async execute(interaction, client) {
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
    await fetch(`https://realmeye-api.glitch.me/${input}/${secondInput}`)
      .then(async (res) => await res.json())
      .then((json) => {
        if (json.error) {
          newDesc.push(`Error: ${json.error}`);
          errstr = "not ";
          return;
        }
        if (input === "player") {
          newDesc.push(
            `**Characters:** __${json[0].Characters}__ \n
                 **Skins:** __${json[0].Skins}__ \n 
                 **Exaltations:** __${json[0].Exaltations}__ \n 
                 **Fame:** __${json[0].Fame}__ \n 
                 **Rank:** __${json[0].Rank}__ \n 
                 **Account Fame:** __${json[0].AccountFame}__`
          );
          // for (let i = 0;i < json[0].CharacterList.length +1; i++){
          //     Chars.push
          //     (`Character: ${json[0].CharacterList[i].character} \n
          //       Level: ${json[0].CharacterList[i].level} \n
          //       Fame: ${json[0].CharacterList[i].fame} \n
          //       Ranking: ${json[0].CharacterList[i].pos} \n\n
          //       Items: \n
          //       __1.__ [${json[0].CharacterList[i].items[0].title}](${json[0].CharacterList[i].items[0].url}) \n
          //       __2.__ [${json[0].CharacterList[i].items[1].title}](${json[0].CharacterList[i].items[1].url}) \n
          //       __3.__ [${json[0].CharacterList[i].items[2].title}](${json[0].CharacterList[i].items[2].url}) \n
          //       __4.__ [${json[0].CharacterList[i].items[3].title}](${json[0].CharacterList[i].items[3].url})`)
          // }
          errstr = "";
        } else {
          newDesc.push(`
                **Guild:** ${json[0].Guild} \n
                **Members:** ${json[0].Members} \n
                **Characters:** ${json[0].Characters} \n
                **Fame:** ${json[0].Fame} \n
                **Most Active on:** ${json[0].MostActiveOn} \n
                `);
          errstr = "";
        }
      });

    let ResultsEmbed = new EmbedBuilder()
      .setTitle(`Data ${errstr}Found:`)
      .setDescription(`${newDesc}`);

    await interaction.editReply({
      embeds: [ResultsEmbed],
    });
    newDesc = [];
  },
};
