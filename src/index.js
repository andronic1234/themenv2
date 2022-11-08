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
client.buttons = new Collection();
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
  let curVoiceChan = client.channels.cache.get(newState.channelId);
  if (curVoiceChan == null) {
    curVoiceChan = client.channels.cache.get(oldState.channelId);
  }
  try {
    if (curVoiceChan.members.size == 1) {
      let getchannid = newState.guild.id;
      const connection = getVoiceConnection(getchannid);
      if (connection) {
        await delay(300000);
        if (curVoiceChan.members.size == 1) {
          connection.destroy();
        }
      }
    }
  } catch {
    console.log("failed");
  }
});

client.handleEvents();
client.handleCommands();
client.login("OTExNzI4NDM3Mzk0MjkyNzk2.YZlnRg.TLMPR0zypba8KKv-R-RyUpuxE38");
(async () => {
  await connect(
    "mongodb+srv://Andronic:pizzayolo12@themen.jazbs.mongodb.net/Men?retryWrites=true&w=majority"
  ).catch(console.error);
})();
