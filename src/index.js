require("dotenv").config();
const { connect } = require("mongoose");
const {
  Client,
  Collection,
  GatewayIntentBits,
  VoiceState,
} = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");
const fs = require("fs");
const profileModel = require("./schema/profileSchema");
const GetQueue = require("./commands/music/play");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

client.commands = new Collection();
client.commandArray = [];

const functionFolders = fs.readdirSync(`./src/functions`);
for (const folder of functionFolders) {
  const functionFiles = fs
    .readdirSync(`./src/functions/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of functionFiles)
    require(`./functions/${folder}/${file}`)(client);
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  let messagearray = message.content.split(" ");
  let add = 0;
  for (var i = 0; i < messagearray.length; i++) {
    if (messagearray[i].toLowerCase() == "men") {
      add++;
    }
  }
  const rewrite = await profileModel.findOneAndUpdate(
    {
      userID: message.author.id,
    },
    {
      $inc: {
        men: add,
      },
    }
  );
  if (!rewrite) {
    let profile = await profileModel.create({
      userID: message.author.id,
      serverID: message.guild.id,
      men: 0,
    });
    profile.save();
  }
});
async () => {
  let profileData;
  try {
    profileData = await profileModel.findOne({
      userID: interaction.author.id,
    });
    if (!profileData) {
      let profile = await profileModel.create({
        userID: interaction.author.id,
        serverID: interaction.guild.id,
        men: 0,
      });
      profile.save();
    }
  } catch (err) {
    console.log(err);
  }
};
//VoiceStateUpdate event
client.on("voiceStateUpdate", async (oldState, newState) => {
  // var song_queue = GetQueue.Queue.get(newState.guild.id);
  let curVoiceChan = client.channels.cache.get(newState.channelId);
  if (curVoiceChan == null) {
    curVoiceChan = client.channels.cache.get(oldState.channelId);
  }
  // if(curVoiceChan.members.get(process.env.BOT_ID) == undefined && song_queue.connection) {
  //   song_queue.connection.destroy()
  // }
  try {
    if (curVoiceChan.members.size == 1) {
      let getchannid = newState.guild.id;
      const connection = getVoiceConnection(getchannid);
      if (connection) {
        await delay(300000);
        if (curVoiceChan.members.size == 1) {
          connection.destroy();
          GetQueue.Queue.delete(newState.guild.id);
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
});

client.handleEvents();
client.handleCommands();
client.login(process.env.BOT_TOKEN);
(async () => {
  await connect(process.env.DB_TOKEN).catch(console.error);
})();
