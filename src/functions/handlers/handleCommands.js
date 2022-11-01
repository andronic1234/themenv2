const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");

module.exports = (client) => {
  client.handleCommands = async () => {
    const commandFolders = fs.readdirSync("./src/commands");
    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));
      const { commands, commandArray } = client;
      for (const file of commandFiles) {
        const command = require(`../../commands/${folder}/${file}`);
        commands.set(command.data.name, command);
        if (Array.isArray(commandArray)) {
          commandArray.push(command.data.toJSON());
        } else {
          return;
        }
        console.log(
          `Command: ${command.data.name} has passed through the handler`
        );
      }
    }

    const clientId = "911728437394292796";
    const rest = new REST({ version: "9" }).setToken('OTExNzI4NDM3Mzk0MjkyNzk2.YZlnRg.TLMPR0zypba8KKv-R-RyUpuxE38');
    try {
      console.log("Started refreshing application (/) commands.");

      await rest.put(Routes.applicationCommands(clientId), {
        body: client.commandArray,
      });

      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  };
};
