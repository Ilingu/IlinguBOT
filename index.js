const { Client, RichEmbed } = require("discord.js");
const { config } = require("dotenv");
const { promptMessage } = require("./functions");
const randomPuppy = require("random-puppy");

const chooseArr = ["⛰", "🧻", "✂"];

const client = new Client({
  disableEveryone: true
});

config({
  path: __dirname + "/.env"
});

client.on("ready", () => {
  console.log(`I'm now online, my name is ${client.user.username}`);

  client.user.setPresence({
    status: "online",
    game: {
      name: "Tes ambitions",
      type: "LISTENING"
    }
  });
});

client.on("message", async message => {
  const prefix = "_";

  if (message.author.bot) return;
  if (!message.guild) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (cmd === "ping") {
    const msg = await message.channel.send(`🏓 Pinging...`);
    const ping = Math.round(client.ping);

    if (ping <= 50) {
      msg.edit(
        `🏓 Pong\nTon ping client est de ${Math.floor(
          msg.createdAt - message.createdAt
        )}\nTon ping server (ton vrai ping) est de ${ping}ms => Ta un très bon ping`
      );
    } else if (ping > 50 && ping <= 100) {
      msg.edit(
        `🏓 Pong\nTon ping client est de ${Math.floor(
          msg.createdAt - message.createdAt
        )}\nTon ping server (ton vrai ping) est de ${ping}ms => Ta un bon ping`
      );
    } else if (ping > 100 && ping <= 350) {
      msg.edit(
        `🏓 Pong\nTon ping client est de ${Math.floor(
          msg.createdAt - message.createdAt
        )}\nTon ping server (ton vrai ping) est de ${ping}ms => Ton ping est moyen`
      );
    } else {
      msg.edit(
        `🏓 Pong\n A mais là c'est pas un ping que ta ptn : ${ping}ms\n, c'est à dire que tes amis t'entendent ${ping /
          1000}s après que tu ait parlé\n, non vraiment arrête de jouer c'est un masacre !\nPing client : ${Math.floor(
          msg.createdAt - message.createdAt
        )}`
      );
    }
  } else if (cmd === "say") {
    if (message.deletable) message.delete();

    if (args.length < 1)
      return message.reply("Nothings to say ?").then(m => m.delete(5000));

    const roleColor = message.guild.me.displayHexColor;

    if (args[0].toLowerCase() === "embed") {
      const embed = new RichEmbed()
        .setColor(roleColor)
        .setDescription(args.slice(1).join(" "))
        .setTimestamp()
        .setAuthor(message.author.name, message.author.displayAvatarURL)
        .setFooter(client.user.username, client.user.displayAvatarURL);
      message.channel.send(embed);
    } else if (args[0].toLowerCase() === "embedimg") {
      const embed = new RichEmbed()
        .setColor(roleColor)
        .setDescription(args.slice(1).join(" "))
        .setTimestamp()
        .setImage(client.user.displayAvatarURL)
        .setAuthor(message.author.name, message.author.displayAvatarURL)
        .setFooter(client.user.username, client.user.displayAvatarURL);

      message.channel.send(embed);
    } else {
      console.log(args[0].toLowerCase());
      message.channel.send(args.join(" "));
    }
  } else if (cmd === "rps") {
    const roleColor = message.guild.me.displayHexColor;

    const embed = new RichEmbed()
      .setColor(roleColor)
      .setFooter(message.guild.me.displayName, client.user.displayAvatarURL)
      .setDescription(
        "Ajoute une réaction à un des ces emojis to play the game !"
      )
      .setTimestamp();

    const m = await message.channel.send(embed);
    const reacted = await promptMessage(m, message.author, 30, chooseArr);

    const botChoise = chooseArr[Math.floor(Math.random() * chooseArr.length)];

    const result = await getResult(reacted, botChoise);
    await m.clearReactions();

    embed.setDescription("").addField(result, `${reacted} vs ${botChoise}`);
    m.edit(embed);

    function getResult(me, clientChosen) {
      if (
        (me === "⛰" && clientChosen === "✂") ||
        (me === "🧻" && clientChosen === "⛰") ||
        (me === "✂" && clientChosen === "🧻")
      ) {
        return "Tu as gagné(e) !";
      } else if (me === clientChosen) {
        return "C'est une égalité";
      } else {
        return "Ooooo non, tu as perdu(e) !";
      }
    }
  } else if (cmd === "meme") {
    const subReddits = ["dankmeme", "meme", "me_irl", "PewdiepieSubmissions"];
    const random = subReddits[Math.floor(Math.random() * subReddits.length)];

    const img = await randomPuppy(random);
    const embed = new RichEmbed()
      .setColor("RANDOM")
      .setImage(img)
      .setTitle(`From r/${random} (Reddit)`)
      .setURL(`https://reddit.com/r/${random}`);
    message.channel.send(embed);
  }
});

client.login(process.env.TOKEN);
