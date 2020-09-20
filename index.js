const { Client, RichEmbed } = require("discord.js");
const { config } = require("dotenv");
const { promptMessage } = require("./functions");
const randomPuppy = require("random-puppy");

const chooseArr = ["⛰", "🧻", "✂"];

const client = new Client({
  disableEveryone: true,
});

config({
  path: __dirname + "/.env",
});

client.on("ready", () => {
  console.log(`I'm now online, my name is ${client.user.username}`);
  client.user.setActivity("Gardien du Server", { url: "https://tytoux.yj.fr" });
  client.user.setPresence({
    status: "online",
    game: {
      name: "_help",
      type: "PLAYING",
    },
  });
});

client.on("guildMemberAdd", async (member) => {
  const role = member.guild.roles.find("name", "Petit Frère");
  member.addRole(role);
  const subReddits = ["dankmeme", "meme", "me_irl", "PewdiepieSubmissions"];
  const random = subReddits[Math.floor(Math.random() * subReddits.length)];

  const img = await randomPuppy(random);
  const embed = new RichEmbed()
    .setColor("RANDOM")
    .setImage(img)
    .setTitle(`From r/${random} (Reddit)`)
    .setURL(`https://reddit.com/r/${random}`);

  member.sendMessage(`Bienvenue ${member.user.username} !\n${embed}`);
});

client.on("guildMemberRemove", (member) => {
  member.addRole("Petit Frère");
  member.sendMessage(
    `Au revoir ${member.user.username}\nCe fût de très bon moment que l'on a passé ensemble (non c'est totalement faux)`
  );
});

client.on("message", async (message) => {
  const prefix = "_";

  if (message.author.bot) return;
  if (!message.guild) return;
  if (!message.content.startsWith(prefix)) {
    if (
      message.content.toLowerCase() === "ugay" ||
      message.content.toLowerCase() === "you gay" ||
      message.content.toLowerCase() === "yougay" ||
      message.content.toLowerCase() === "you mom gay" ||
      message.content.toLowerCase() === "u mom gay" ||
      message.content.toLowerCase() === "u mom's gay" ||
      message.content.toLowerCase() === "u gay"
    ) {
      message.channel.send("No u");
      return;
    } else {
      return;
    }
  }

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (cmd === "ping") {
    if (message.deletable) message.delete();
    const msg = await message.channel.send(`🏓 Pinging...`);
    const ping = Math.round(client.ping);

    if (ping <= 50) {
      msg.edit(
        `🏓 Pong\n✔✔Ping client ${Math.floor(
          msg.createdAt - message.createdAt
        )}\n✔✔Ton ping est donc de ${ping}ms soit ${
          ping / 1000
        }s => Ta un très bon ping`
      );
    } else if (ping > 50 && ping <= 100) {
      msg.edit(
        `🏓 Pong\n✔Ping client ${Math.floor(
          msg.createdAt - message.createdAt
        )}\n✔Ton ping est donc de ${ping}ms soit ${
          ping / 1000
        }s => Ta un bon ping`
      );
    } else if (ping > 100 && ping <= 350) {
      msg.edit(
        `🏓 Pong\n🆗Ping client ${Math.floor(
          msg.createdAt - message.createdAt
        )}\n🆗Ton ping est donc de ${ping}ms soit ${
          ping / 1000
        }s => Ton ping est moyen`
      );
    } else {
      msg.edit(
        `🏓 Pong\n ❌ ouïe ça doit piquer ton ping est de ${ping}ms\n soit ${
          ping / 1000
        }s ❌ pour faire une requête et que la réponse te parvienne 😢😢😢`
      );
    }
  } else if (cmd === "say") {
    if (message.deletable) message.delete();

    if (args.length < 1)
      return message.reply("Nothings to say ?").then((m) => m.delete(5000));

    const roleColor = message.guild.me.displayHexColor;

    if (args[0].toLowerCase() === "embed") {
      const embed = new RichEmbed()
        .setColor(roleColor)
        .setDescription(args.slice(1).join(" "))
        .setTimestamp()
        .setAuthor(message.author.username, message.author.displayAvatarURL)
        .setFooter(client.user.username, client.user.displayAvatarURL);
      message.channel.send(embed);
    } else if (args[0].toLowerCase() === "embedimg") {
      const embed = new RichEmbed()
        .setColor(roleColor)
        .setDescription(args.slice(1).join(" "))
        .setTimestamp()
        .setImage(client.user.displayAvatarURL)
        .setAuthor(message.author.username, message.author.displayAvatarURL)
        .setFooter(client.user.username, client.user.displayAvatarURL);

      message.channel.send(embed);
    } else {
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
  } else if (cmd === "help") {
    const embed = `
      _ping: affiche ton ping
      _say <ton message>: dit un message de façon anonyme
        _say embed <ton message>: dit un message avec un embed
        _say embedimg <ton message>: dit in message avec un embed imagé
      _rps: fait un fueilles-papier-ciseaux avec le bot
      _meme: (à faire dans le salon meme) met un meme aléatoirement
      _rda x x: te donne un nombre aléatoirement entre le 1er x et le 2ème, ex: _rda 5 8 (nombre aléatoire entre 5 et 8)

    `;
    message.channel.send(embed);
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
  } else if (cmd === "rda") {
    if (message.deletable) message.delete();

    const roleColor = message.guild.me.displayHexColor;

    if (
      args[0] !== undefined &&
      args[1] !== undefined &&
      args.length <= 2 &&
      typeof parseInt(args[0]) === "number" &&
      typeof parseInt(args[1]) === "number"
    ) {
      const Biggest = [parseInt(args[0]), parseInt(args[1])].sort();
      const toRandomised = Biggest[0] - Biggest[1];

      const embed = new RichEmbed()
        .setColor(roleColor)
        .setDescription(
          `Résutat du nombre aléatoire entre ${
            Biggest[0] < 0 && Biggest[1] < 0
              ? Biggest[0]
              : Biggest[0] < 0 || Biggest[1] < 0
              ? Biggest[0]
              : Biggest[1]
          } et ${
            Biggest[0] < 0 && Biggest[1] < 0
              ? Biggest[1]
              : Biggest[0] < 0 || Biggest[1] < 0
              ? Biggest[1]
              : Biggest[0]
          }:
              ${Biggest[1] + Math.round(Math.random() * toRandomised)}
          `
        )
        .setTimestamp()
        .setAuthor("Anonymous", message.author.displayAvatarURL)
        .setFooter(client.user.username, client.user.displayAvatarURL);
      message.channel.send(embed);
    } else {
      message.channel
        .send(
          "_rda est un commande demandant 2 chiffres.\n\t En outre ça doit ressembler à ça: _rda x x\n EXEMPLE: _rda 5 9 (nombres aléatoire en 5 et 9)"
        )
        .then((m) => m.delete(15000));
    }
  } else if (cmd === "kick") {
    const logChannel =
      message.guild.channels.find((c) => c.name === "logs") || message.channel;

    if (message.deletable) message.delete();

    // No Args
    if (!args[0]) {
      return message
        .reply("Please provide a reason to kick")
        .then((m) => m.delete(5000));
    }
    // No reason
    if (!args[1]) {
      return message
        .reply("Please provide a reason to kick")
        .then((m) => m.delete(5000));
    }
    // No author permissons
    if (!message.member.hasPermission("KICK_MEMBERS")) {
      return message
        .reply(
          "❌ You do not have permissions to kick members. Please contact a staff member ❌"
        )
        .then((m) => m.delete(5000));
    }
    // No bot permissions
    if (!message.guild.me.hasPermission("KICK_MEMBERS")) {
      return message
        .reply(
          "❌ This bot haven't permissions to kick members please upgrade this grade into this server if you want he does this. ❌"
        )
        .then((m) => m.delete(5000));
    }

    const toKick =
      message.mentions.members.first() || message.guild.members.get(args[0]);

    // No member found
    if (!toKick) {
      return message
        .reply("Couldn't find that member, try again!")
        .then((m) => m.delete(5000));
    }
    // Can't kick urself
    if (message.author.id === toKick.id) {
      return message
        .reply("Can't kick yourself, smartboii")
        .then((m) => m.delete(5000));
    }
    // Kickable
    if (!toKick.kickable) {
      return message
        .reply("I can't kick that person due to role hietatchy, I suppose.")
        .then((m) => m.delete(5000));
    }
    if (toKick === "@Ilingu") {
      return message
        .reply(
          "You couldn't kick my creators now I ban u (no that a fucking joke because you can't kick me or kick the bot of you're server hahaha)"
        )
        .then((m) => m.delete(5000));
    }
    const embed = new RichEmbed()
      .setColor("#ff0000")
      .setThumbnail(toKick.user.displayAvatarURL)
      .setFooter(message.member.displayName, message.author.displayAvatarURL)
      .setTimestamp()
      .setDescription(
        `❌ Kicked member: **${toKick}** ❌\nKicked by : **${
          message.author
        }** (${message.author.id})✔\nReason : **${args.slice(1).join(" ")}**`
      );

    const promptEmbed = new RichEmbed()
      .setColor("GREEN")
      .setAuthor("This verification becomes invalid after 30s")
      .setDescription(`Do you want to kick ${toKick}`);

    message.channel.send(promptEmbed).then(async (msg) => {
      const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

      if (emoji === "✅") {
        msg.delete();

        toKick.kick(args.slice(1).join(" ")).catch((err) => {
          if (err)
            return message.channel.send(`Well..... Something went wrong?`);
        });

        logChannel.send(embed);
      } else if (emoji === "❌") {
        msg.delete();

        message.reply("Kick canceled...").then((m) => m.delete(5000));
      }
    });
  } else if (cmd === "ban") {
    const logChannel =
      message.guild.channels.find((c) => c.name === "logs") || message.channel;

    if (message.deletable) message.delete();

    // No Args
    if (!args[0]) {
      return message
        .reply("Please provide a reason to ban")
        .then((m) => m.delete(5000));
    }
    // No reason
    if (!args[1]) {
      return message
        .reply("Please provide a reason to ban")
        .then((m) => m.delete(5000));
    }
    // No author permissons
    if (!message.member.hasPermission("BAN_MEMBERS")) {
      return message
        .reply(
          "❌ You do not have permissions to ban members. Please contact a staff member ❌"
        )
        .then((m) => m.delete(5000));
    }
    // No bot permissions
    if (!message.guild.me.hasPermission("BAN_MEMBERS")) {
      return message
        .reply(
          "❌ This bot haven't permissions to ban members please upgrade this grade into this server if you want he does this. ❌"
        )
        .then((m) => m.delete(5000));
    }

    const toBan =
      message.mentions.members.first() || message.guild.members.get(args[0]);

    // No member found
    if (!toBan) {
      return message
        .reply("Couldn't find that member, try again!")
        .then((m) => m.delete(5000));
    }
    // Can't kick urself
    if (message.author.id === toBan.id) {
      return message
        .reply("Can't ban yourself, smartboii")
        .then((m) => m.delete(5000));
    }
    // Kickable
    if (!toBan.kickable) {
      return message
        .reply("I can't ban that person due to role hietatchy, I suppose.")
        .then((m) => m.delete(5000));
    }
    if (toBan === "@Ilingu") {
      return message
        .reply(
          "You couldn't ban my creators now I ban u (no that a fucking joke because you can't ban me or ban the bot of you're server hahaha)"
        )
        .then((m) => m.delete(5000));
    }
    const embed = new RichEmbed()
      .setColor("#ff0000")
      .setThumbnail(toBan.user.displayAvatarURL)
      .setFooter(message.member.displayName, message.author.displayAvatarURL)
      .setTimestamp()
      .setDescription(
        `❌ Baned member: **${toBan}** ❌\nBaned by : **${message.author}** (${
          message.author.id
        })✔\nReason : **${args.slice(1).join(" ")}**`
      );

    const promptEmbed = new RichEmbed()
      .setColor("GREEN")
      .setAuthor("This verification becomes invalid after 30s")
      .setDescription(`Do you want to ban ${toBan}`);

    message.channel.send(promptEmbed).then(async (msg) => {
      const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

      if (emoji === "✅") {
        msg.delete();

        toBan.kick(args.slice(1).join(" ")).catch((err) => {
          if (err)
            return message.channel.send(`Well..... Something went wrong?`);
        });

        logChannel.send(embed);
      } else if (emoji === "❌") {
        msg.delete();

        message.reply("Ban canceled...").then((m) => m.delete(5000));
      }
    });
  } else {
    if (message.deletable) message.delete();
  }
});

client.login(process.env.TOKEN);
