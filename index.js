const { Client, MessageEmbed } = require("discord.js");
const { config } = require("dotenv");
const firebase = require("firebase/app");
const admin = require("firebase-admin");
const { promptMessage } = require("./functions");
const randomPuppy = require("random-puppy");

// Initialize Firebase
const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Config
const client = new Client({
  disableMentions: "everyone",
});
config({
  path: __dirname + "/.env",
});

// Var
const chooseArr = ["⛰", "🧻", "✂"];
// let ignored = false;

// Fn
const POSTMessage = (AllMessage, channel, MessageID, guild) => {
  // 172800000 -> Ms of 2day
  db.collection("guilds")
    .doc(guild)
    .update({
      messageImageToSuppr:
        AllMessage === false
          ? [{ channel, MessageID, TimeStamp: Date.now() + 172800000 }]
          : [
              ...AllMessage,
              { channel, MessageID, TimeStamp: Date.now() + 172800000 },
            ],
    });
};

const UpdateMessageVar = (Data, guild) => {
  db.collection("guilds").doc(guild).update({
    messageImageToSuppr: Data,
  });
};

// BOT
client.on("ready", () => {
  console.log(`I'm now online, my name is ${client.user.username}`);
  client.user.setActivity(
    "++++++++++[>+>+++>+++++++>++++++++++<<<<-]>>>>-----.+++++++.+++++++++++++++.------------------.++++++++.",
    {
      type: "COMPETING",
    }
  );
});

client.on("guildMemberAdd", async (member) => {
  const role = member.guild.roles.cache.find(
    (role) => role.name === "Gros gamer"
  );
  member.roles.add(role);
  const subReddits = ["dankmeme", "meme", "me_irl", "PewdiepieSubmissions"];
  const random = subReddits[Math.floor(Math.random() * subReddits.length)];
  const img = await randomPuppy(random);
  const embed = new MessageEmbed()
    .setColor("RANDOM")
    .setImage(img)
    .setTitle(`From r/${random} (Reddit)`)
    .setURL(`https://reddit.com/r/${random}`);

  const channel = member.guild.channels.cache.find(
    (ch) => ch.name === "🖐bienvenue"
  );

  channel.send(`Bienvenue <@${member.user.id}> !`);
  channel.send(embed);
});

client.on("emojiCreate", async (emoji) => {
  const channel = emoji.guild.channels.cache.find(
    (ch) => ch.name === "annonces"
  );
  const Author = await emoji.fetchAuthor();
  channel.send(
    `Un nouveau emoji a été ajouté ( emoji: <:${emoji.name}:${emoji.id}> ajouter par: <@${Author.id}> )`
  );
});

client.on("guildCreate", async (gData) => {
  db.collection("guilds").doc(gData.id).set({
    guildID: gData.id,
    guildName: gData.name,
    messageImageToSuppr: [],
  });
});

client.on("message", async (message) => {
  const prefix = "_";
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  // Img Suppr
  const guild = message.guild.id,
    channel = message.channel.id,
    MessageID = message.id;
  if (message.attachments.size > 0) {
    db.collection("guilds")
      .doc(guild)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const Data = doc.data().messageImageToSuppr;
          if (Data) POSTMessage(Data, channel, MessageID, guild);
          else POSTMessage(false, channel, MessageID, guild);
        } else {
          console.log("No such document!");
        }
      })
      .catch(console.error);
  } else {
    // Check MsgImg
    db.collection("guilds")
      .doc(guild)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const Data = doc.data().messageImageToSuppr;
          if (Data) {
            Data.forEach((Msg, i) => {
              if (Msg.TimeStamp <= Date.now()) {
                const channelOfMessage = client.channels.cache.find(
                  (ch) => ch.id === Msg.channel
                );
                channelOfMessage.messages
                  .fetch(Msg.MessageID)
                  .then((msgSupp) => {
                    msgSupp.delete();
                  });
                Data.splice(i, 1);
                UpdateMessageVar(Data, guild);
              }
            });
          }
        } else {
          console.log("No such document!");
        }
      })
      .catch(console.error);
  }

  // Other
  if (message.channel.name === "annonces") {
    const EmojiVu = message.guild.emojis.cache.find(
      (emoji) => emoji.name == "Vu"
    );
    message.react(message.guild.emojis.cache.get(EmojiVu.id));
  }
  if (message.author.bot) return;
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
    const channelPartage = message.guild.channels.cache.find(
      (ch) => ch.name === "🔗partage"
    );

    channelPartage.send(
      `(Message de <@${message.author.id}>)\n${message.content}`
    );

    message
      .reply(
        `Votre message a été déplacé dans <#${channelPartage.id}> car il s'agit d'un lien.`
      )
      .then((m) => m.delete({ timeout: 7000 }));
    if (message.deletable) message.delete();
    return;
  }
  // Distribué
  // const EmojiDistri = message.guild.emojis.cache.find(
  //   (emoji) => emoji.name == "distribuer"
  // );
  // message
  //   .react(message.guild.emojis.cache.get(EmojiDistri.id))
  //   .then((messageReaction) => {
  //     setTimeout(() => {
  //       messageReaction.remove();
  //     }, 1000);
  //   });
  // ------
  if (!message.content.startsWith(prefix)) {
    if (message.channel.name === "📝sondages") {
      if (message.deletable) message.delete();
      const Embed = new MessageEmbed()
        .setColor(0xffc300)
        .setTitle("Initialisation du sondage")
        .setDescription("_vote <ton sondage?>: pour initialiser ton sondage");
      return message.reply(Embed);
    }
    return;
  }

  if (cmd === "ping") {
    if (message.deletable) message.delete();
    const msg = await message.channel.send(`🏓 Pinging...`);
    const ping = Date.now() - message.createdTimestamp;

    msg.edit(
      `🏓 Pong\n✔✔ <@${
        message.author.id
      }> votre Ping est de **${ping} ms** ✔✔\nPS: Un ping supérieur à 125ms devient problèmatique\n*(Ping client **${Math.floor(
        msg.createdAt - message.createdAt
      )} ms** -> à part si vous connaissez il ne vous servira à rien...)*`
    );
  } else if (cmd === "vote") {
    // Add Vote sans oui ou non juste on vote se qu'on préfère
    let argsVote = message.content.substring(prefix.length).split(" ");
    let msgArgs;
    let Neutrale = false;
    const Embed = new MessageEmbed()
      .setColor(0xffc300)
      .setTitle("Initialisation du sondage")
      .setDescription("_vote <ton sondage?>: pour initialiser ton sondage");

    if (!argsVote[1]) {
      return message.reply(Embed).then((m) => m.delete({ timeout: 5000 }));
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
  } else if (cmd === "say") {
    if (message.deletable) message.delete();

    if (args.length < 1)
      return message
        .reply("Nothings to say ?")
        .then((m) => m.delete({ timeout: 5000 }));

    const roleColor = message.guild.me.displayHexColor;

    if (args[0].toLowerCase() === "embed") {
      const embed = new MessageEmbed()
        .setColor(roleColor)
        .setDescription(args.slice(1).join(" "))
        .setTimestamp()
        .setAuthor(message.author.username, message.author.displayAvatarURL())
        .setFooter(client.user.username, client.user.displayAvatarURL());
      message.channel.send(embed);
    } else if (args[0].toLowerCase() === "embedimg") {
      const embed = new MessageEmbed()
        .setColor(roleColor)
        .setDescription(args.slice(1).join(" "))
        .setTimestamp()
        .setImage(client.user.displayAvatarURL())
        .setAuthor(message.author.username, message.author.displayAvatarURL())
        .setFooter(client.user.username, client.user.displayAvatarURL());

      message.channel.send(embed);
    } else {
      message.channel.send(args.join(" "));
    }
  } else if (cmd === "rps") {
    const roleColor = message.guild.me.displayHexColor;

    const embed = new MessageEmbed()
      .setColor(roleColor)
      .setFooter(message.guild.me.displayName, client.user.displayAvatarURL())
      .setDescription(
        "Ajoute une réaction à un des ces emojis to play the game !"
      )
      .setTimestamp();

    const m = await message.channel.send(embed);
    const reacted = await promptMessage(m, message.author, 30, chooseArr);

    const botChoise = chooseArr[Math.floor(Math.random() * chooseArr.length)];

    const result = await getResult(reacted, botChoise);
    await m.reactions.removeAll();

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
    const Embed = new MessageEmbed()
      .setColor(0xffc300)
      .setTitle("Comment utiliser IlinguBOT ?")
      .setDescription(
        `
      _ping: affiche ton ping
      _say <ton message>: dit un message de façon anonyme
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
      .setAuthor(message.author.username, message.author.displayAvatarURL())
      .setFooter(client.user.username, client.user.displayAvatarURL());

    return message.reply(Embed);
  } else if (cmd === "meme") {
    const subReddits = ["dankmeme", "meme", "me_irl", "PewdiepieSubmissions"];
    const random = subReddits[Math.floor(Math.random() * subReddits.length)];

    const img = await randomPuppy(random);
    const embed = new MessageEmbed()
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

      const embed = new MessageEmbed()
        .setColor(roleColor)
        .setDescription(
          `Résutat du nombre aléatoire entre ${Biggest[0]} et ${Biggest[1]}:
              ${Biggest[1] + Math.round(Math.random() * toRandomised)}
          `
        )
        .setTimestamp()
        .setAuthor(message.author.username, message.author.displayAvatarURL())
        .setFooter(client.user.username, client.user.displayAvatarURL());
      message.channel.send(embed);
    } else {
      message.channel
        .send(
          "_rda est un commande demandant 2 chiffres.\n\t En outre ça doit ressembler à ça: _rda x x\n EXEMPLE: _rda 5 9 (nombres aléatoire en 5 et 9)"
        )
        .then((m) => m.delete({ timeout: 15000 }));
    }
  } else {
    if (message.deletable) message.delete();
  }
});

client.login(process.env.TOKEN);
