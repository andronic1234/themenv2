const { ActivityType } = require("discord.js");
module.exports = (client) => {
  client.pickPresence = async () => {
    const options = [
      {
        type: ActivityType.Watching,
        text: "ur mom take shower",
        status: "dnd",
      },
      {
        type: ActivityType.Listening,
        text: "Talking Ben",
        status: "idle",
      },
      {
        type: ActivityType.Playing,
        text: "with Lil B's cat",
        status: "online",
      },
      {
        type: ActivityType.Playing,
        text: "with GoDSlayeR",
        status: "online",
      },
      {
        type: ActivityType.Playing,
        text: "Minecraft",
        status: "online",
      },
      {
        type: ActivityType.Listening,
        text: "Vsama's aramb (help)",
        status: "idle",
      },
    ];
    const option = Math.floor(Math.random() * options.length);

    client.user.setPresence({
      activities: [
        {
          name: options[option].text,
          type: options[option].type,
        },
      ],
      status: options[option].status,
    });
  };
};
