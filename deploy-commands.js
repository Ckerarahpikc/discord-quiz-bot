// deploying slash commands

import { REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName("start")
    .setDescription("Start a quiz on a selected topic")
    .addStringOption((option) =>
      option
        .setName("topic")
        .setDescription("Choose a topic")
        .setRequired(true)
        .addChoices(
          { name: "JavaScript", value: "js" },
          { name: "Node.js", value: "node" },
          { name: "Express", value: "express" },
          { name: "React", value: "react" },
          { name: "MongoDB", value: "mongodb" }
        )
    ),
].map((command) => command.toJSON());

// restapi
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );
    console.log("Commands registered!");
  } catch (error) {
    console.error(error);
  }
})();
