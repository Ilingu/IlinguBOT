const { Client, RichEmbed } = require("discord.js");
const { config } = require("dotenv");
const { promptMessage } = require("./functions");
const randomPuppy = require("random-puppy");

// Config
const client = new Client({
  disableEveryone: true,
});
config({
  path: __dirname + "/.env",
});

// Var
const chooseArr = ["⛰", "🧻", "✂"];
// let ignored = false;

// Fn
const getUserFromMention = (mention) => {
  if (!mention) return;

  if (mention.startsWith("<@") && mention.endsWith(">")) {
    mention = mention.slice(2, -1);

    if (mention.startsWith("!")) {
      mention = mention.slice(1);
    }

    return client.users.get(mention);
  }
};

client.on("ready", () => {
  console.log(`I'm now online, my name is ${client.user.username}`);
  client.user.setActivity(
    "++++++++++[>+>+++>+++++++>++++++++++<<<<-]>>>>-----.+++++++.+++++++++++++++.------------------.++++++++.",
    {
      type: "LISTENING",
    }
  );
});

client.on("guildMemberAdd", async (member) => {
  const role = member.guild.roles.find("name", "Gros gamer");
  member.addRole(role);
  const subReddits = ["dankmeme", "meme", "me_irl", "PewdiepieSubmissions"];
  const random = subReddits[Math.floor(Math.random() * subReddits.length)];
  const img = await randomPuppy(random);
  const embed = new RichEmbed()
    .setColor("RANDOM")
    .setImage(img)
    .setTitle(`From r/${random} (Reddit)`)
    .setURL(`https://reddit.com/r/${random}`);

  const channel = member.guild.channels.find((ch) => ch.name === "🖐bienvenue");

  channel.send(`Bienvenue <@${member.user.id}> !`);
  channel.send(embed);
});

client.on("emojiCreate", async (emoji) => {
  const channel = emoji.guild.channels.find((ch) => ch.name === "annonces");
  const Author = await emoji.fetchAuthor();
  channel.send(
    `Un nouveau emoji a été ajouté ( emoji: <:${emoji.name}:${emoji.id}> ajouter par: <@${Author.id}> )`
  );
});

client.on("message", async (message) => {
  const prefix = "_";
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (message.attachments.size > 0) {
    if (message.deletable) message.delete(3600000);
  }
  if (message.channel.name === "annonces") {
    const EmojiVu = message.guild.emojis.find((emoji) => emoji.name == "Vu");
    message.react(message.guild.emojis.get(EmojiVu.id));
  }
  if (message.author.bot) {
    // if (message.channel.name === "annonces-prog") {
    //   const channel = message.guild.channels.find(
    //     (ch) => ch.name === "annonces"
    //   );
    //   channel.send(
    //     `Une nouvelle version de mon site https://myanimchecker.netlify.app/ vient d'être uploadé !`
    //   );
    // } else if (message.channel.name === "sortie-animes" && !ignored) {
    //   ignored = true;
    //   const Role = message.guild.roles.find((r) => r.name === "Anime");
    //   message.channel.send(`${Role} un nouvelle épisode d'anime est sortie !`);
    // } else {
    //   if (ignored) ignored = false;
    //   return;
    // }
    return;
  }
  if (!message.guild) {
    // DM
    if (!message.content.startsWith(prefix))
      return message.reply(
        "Comment te dire que t'es dans mon espace privée là... Baaaaaka\n Genre on ta jamais appris à respecter la vie privée des gens."
      );

    if (cmd === "fuck") {
      return message.reply(
        `Yaaaaa !\nDe 1 Bravo Pour Avoir Trouvé Le Résultat Du Brain Fuck (#DecodeurEnLigne...)\nDe 2 ça ne s'arrête pas là... (ça serait trop simple uwu)\nhttps://www.gillmeister-software.com/online-tools/text/encrypt-decrypt-text.aspx\nfwByNN8BGRJfJreYo4JDcjEt/kV4i1GF7Dio1a51KoIB0xwRyamFZMRc49anKviYFraz4i8knUsL1G/JBepTKlWmURqFgFTRzySjoDZ7Ms7NFRHqCZprcCW1CU4BcKnX`
      );
    }

    if (cmd === "seins") {
      return message.reply(
        `Ok ok GG, franchement GG fallait le trouver... je suis tellement étonné que je suis presque sûr que personne ne liras ce message, c'est paradoxale vu que t'es entrain de le lire\nBref envoie moi (Ilingu) ce message et je te donnerais ce que tu veux DANS LA LIMITE DU RESONNABLE (genre un rôle discord ou jsp quoi).\n Code: ${Date.now()}, Utilisateur qui as trouvé: ${
          message.author.username
        }`
      );
    }
    return;
  }
  if (
    typeof message.content === "string" &&
    (message.content
      .split("/")[0]
      .slice(0, message.content.split("/")[0].length - 1) === "http" ||
      message.content
        .split("/")[0]
        .slice(0, message.content.split("/")[0].length - 1) === "https" ||
      message.content.split(".")[0] === "www") &&
    message.channel.name !== "🔗partage" &&
    !message.content.includes("tenor")
  ) {
    const channelPartage = message.guild.channels.find(
      (ch) => ch.name === "🔗partage"
    );

    channelPartage.send(
      `(Message de <@${message.author.id}>)\n${message.content}`
    );

    message
      .reply(
        `Votre message a été déplacé dans <#${channelPartage.id}> car il s'agit d'un lien.`
      )
      .then((m) => m.delete(7000));
    if (message.deletable) message.delete();
    return;
  }
  // Distribué
  // const EmojiDistri = message.guild.emojis.find(
  //   (emoji) => emoji.name == "distribuer"
  // );
  // message
  //   .react(message.guild.emojis.get(EmojiDistri.id))
  //   .then((messageReaction) => {
  //     setTimeout(() => {
  //       messageReaction.remove();
  //     }, 1000);
  //   });
  // ------
  if (!message.content.startsWith(prefix)) {
    if (message.channel.name === "sondages") {
      if (message.deletable) message.delete();
      const Embed = new RichEmbed()
        .setColor(0xffc300)
        .setTitle("Initialisation du sondage")
        .setDescription("_vote <ton sondage?>: pour initialiser ton sondage");
      return message.reply(Embed);
    }
    // if (message.channel.name === "meme") {
    //   const channel = message.guild.channels.find(
    //     (ch) => ch.name === "général"
    //   );
    //   channel.send(`<@${message.author.id}> a dit:\n${message.content}`);
    //   if (message.deletable) message.delete();
    //   message.channel.send(
    //     "Ce message n'a pas lieu d'être dans ce channel veuillez le mettre dans un channel approprié (exemple: dans le #meme on met toujours des commande _meme et pas de message normal qui eu sont destinés au #insulte)"
    //   );
    //   return;
    // } else {
    //   return;
    // }
    return;
  }

  if (cmd === "ping") {
    if (message.deletable) message.delete();
    const msg = await message.channel.send(`🏓 Pinging...`);
    const ping = Date.now() - message.createdTimestamp;

    msg.edit(
      `🏓 Pong\n✔✔ Ping est donc de **${ping} ms** ✔✔\nPS: Un ping supérieur à 125ms devient problèmatique\n*(Ping client **${Math.floor(
        msg.createdAt - message.createdAt
      )} ms** -> à part si vous connaissez il ne vous servira à rien...)*`
    );
  } else if (cmd === "vote") {
    // Add Vote sans oui ou non juste on vote se qu'on préfère
    let argsVote = message.content.substring(prefix.length).split(" ");
    let msgArgs;
    let Neutrale = false;
    const Embed = new RichEmbed()
      .setColor(0xffc300)
      .setTitle("Initialisation du sondage")
      .setDescription("_vote <ton sondage?>: pour initialiser ton sondage");

    if (!argsVote[1]) {
      return message.reply(Embed).then((m) => m.delete(5000));
    }

    if (argsVote[1].toLowerCase() === "neutrale") {
      msgArgs = argsVote.slice(2).join(" ");
      Neutrale = true;
    } else {
      msgArgs = argsVote.slice(1).join(" ");
    }

    message.channel
      .send(
        `📝 **${msgArgs}** ( Sondage de <@${message.author.id}> )${
          Neutrale ? `\n🅰 pour l'option 1 et 🅱 pour l'option 2` : ""
        }`
      )
      .then((messageReaction) => {
        if (Neutrale) {
          messageReaction.react("🅰");
          messageReaction.react("🅱");
        } else {
          messageReaction.react("👍");
          messageReaction.react("👎");
        }

        if (message.deletable) message.delete().catch(console.error);
      });
  } else if (cmd === "rename") {
    if (args.length < 1)
      return message
        .reply(
          "No name ? => _rename (bot, others) <ton nouveaux pseudo> (ex: _rename Ilingu)"
        )
        .then((m) => m.delete(5000));

    if (args[0].toLowerCase() === "bot") {
      if (!args[1])
        return message
          .reply(
            "No name ? => _rename bot <nouveaux pseudo du bot> (ex: _rename bot Ilingu)"
          )
          .then((m) => m.delete(5000));
      message.guild.members
        .get(client.user.id)
        .setNickname(args.slice(1).join(" "));
      return message.channel.send(
        `<@${client.user.id}> votre nouveaux pseudo est: ${args
          .slice(1)
          .join(
            " "
          )}\n(J'suis littéralement entrain de me parler à moi même 😥)\n(De plus je sais même pas si le pseudo qu'on m'a donné est bien ou pas vu que je suis pas un IA)`
      );
    } else if (args[0].toLowerCase() === "others") {
      if (!args[1] || !args[2])
        return message
          .reply(
            "No name ? => _rename others <@personne> <nouveaux pseudo du bot> (ex: _rename others @Ilingu être suprême)"
          )
          .then((m) => m.delete(5000));

      const user = getUserFromMention(args[1]);
      if (!user) {
        return message
          .reply(
            `👻Personne fantôme👻\nJe cite: "${args[1]}" est inexistant sur ce serveur !`
          )
          .then((m) => m.delete(5000));
      }
      message.guild.members.get(user.id).setNickname(args.slice(2).join(" "));
      user.send("Pseudo changé dans GameTeam");
      return message.channel.send(
        `<@${user.id}> votre nouveaux pseudo est: ${args
          .slice(2)
          .join(
            " "
          )}\n(En espérant qu'on t'a pas donné un pseudo trop rincé 😥)`
      );
    }

    message.member.setNickname(args.join(" "));
    message.channel.send(
      `<@${message.author.id}> votre nouveaux pseudo est: ${args.join(
        " "
      )}\n(Mais tu le savais déjà, donc je suis inutile 😥)`
    );
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
    if (message.deletable) message.delete();
    const Embed = new RichEmbed()
      .setColor(0xffc300)
      .setTitle("Comment utiliser IlinguBOT ?")
      .setDescription(
        `
      _ping: affiche ton ping
      _say <ton message>: dit un message de façon anonyme
      _rename <ton nouveaux pseudo> : change ton pseudo (ex: _rename Ilingu)
      \t_rename bot <nouveaux pseudo du bot> : Change le pseudo du bot (ex: _rename bot Ilingu)
      \t_rename others <@personne> <nouveaux pseudo de la personne mentionné> : change le pseudo de la personne mentionné (ex: _rename others @Ilingu être suprême)
      \t_say embed <ton message>: dit un message avec un embed
      \t_say embedimg <ton message>: dit in message avec un embed imagé
      _rps: fait un fueilles-papier-ciseaux avec le bot*
      _vote <ton sondage>: crée un sondage avec une réponse oui et une réponse non (soit d'accord soit pas d'accord)
      \t_vote neutrale <ton sondage>: crée un sondage avec une option A et une option B (choisir l'option que vous préférez,ex: Snk ou One Piece)
      _meme: (à faire dans le salon meme) met un meme aléatoirement
      _rda x x: te donne un nombre aléatoirement entre le 1er x et le 2ème, ex: _rda 5 8 (nombre aléatoire entre 5 et 8)
    `
      )
      .setTimestamp()
      .setAuthor(message.author.username, message.author.displayAvatarURL)
      .setFooter(client.user.username, client.user.displayAvatarURL);

    return message.reply(Embed);
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
    if (message.deletable) message.delete();
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
          `Résutat du nombre aléatoire entre ${Biggest[0]} et ${Biggest[1]}:
              ${Biggest[1] + Math.round(Math.random() * toRandomised)}
          `
        )
        .setTimestamp()
        .setAuthor(message.author.username, message.author.displayAvatarURL)
        .setFooter(client.user.username, client.user.displayAvatarURL);
      message.channel.send(embed);
    } else {
      message.channel
        .send(
          "_rda est un commande demandant 2 chiffres.\n\t En outre ça doit ressembler à ça: _rda x x\n EXEMPLE: _rda 5 9 (nombres aléatoire en 5 et 9)"
        )
        .then((m) => m.delete(15000));
    }
  } else {
    if (message.deletable) message.delete();
  }
});

client.login(process.env.TOKEN);
