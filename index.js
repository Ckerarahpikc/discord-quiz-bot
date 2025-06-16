import {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  InteractionType,
} from "discord.js";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// creating bot client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// this will track active quizzes
const activeQuizzes = {};

// just ready event
client.on("ready", async () => {
  const app = await client.application.fetch();
  console.log(`Logged in as ${client.user.tag}`);
  console.log(`✅ App owner is ${app.owner?.tag || app.owner?.username}`);
});

// interactions
client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "start") {
      const topic = interaction.options.getString("topic");

      if (!fs.existsSync(`./questions/${topic}.json`)) {
        await interaction.reply({
          content: `Sorry the ${topic} topic is not yet available. Coming soon.`,
        });
        return;
      }

      const questions = JSON.parse(
        fs.readFileSync(`./questions/${topic}.json`)
      );

      // initialize user status
      activeQuizzes[interaction.user.id] = {
        questions,
        current: 0,
        score: 0,
      };

      const question = questions[0];
      const buttons = new ActionRowBuilder();

      // create button for each question
      question.options.forEach(async (opt, i) => {
        buttons.addComponents(
          new ButtonBuilder()
            .setCustomId(`${i}`)
            .setLabel(opt)
            .setStyle(ButtonStyle.Primary)
        );
      });

      // send question and answers (buttons)
      await interaction.reply({
        content: question?.question,
        components: [buttons],
      });
    }
  } else if (interaction.isButton()) {
    const userId = interaction.user.id;
    const quiz = activeQuizzes[userId];

    if (!quiz)
      return interaction.reply({
        content: "No active quiz found.",
        ephemeral: true,
      });

    const selected = parseInt(interaction.customId);
    const currentQ = quiz.questions[quiz.current];

    // if answer is correct
    // info: in the future points will be measured in percent so 0-100 percent
    if (currentQ.answer === selected) {
      quiz.score++;
    }
    quiz.current++;

    // check if there are more questions
    if (quiz.current >= quiz.questions.length) {
      await interaction.update({
        content: `Quiz finished! Your score: ${quiz.score}/${quiz.questions.length}`,
        components: [],
      });
      delete activeQuizzes[userId];
    } else {
      const nextQ = quiz.questions[quiz.current];
      const buttons = new ActionRowBuilder();
      // new buttons
      nextQ.options.forEach((opt, i) => {
        buttons.addComponents(
          new ButtonBuilder()
            .setCustomId(`${i}`)
            .setLabel(opt)
            .setStyle(ButtonStyle.Primary)
        );
      });

      // and then answer
      await interaction.update({
        content: nextQ.question,
        components: [buttons],
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
