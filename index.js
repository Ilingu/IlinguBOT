const { Client, MessageEmbed, APIMessage } = require("discord.js");
const { config } = require("dotenv");
const firebase = require("firebase/app");
const admin = require("firebase-admin");
const { promptMessage } = require("./functions");
const randomPuppy = require("random-puppy");
const Brainfuck = require("brainfuck-compiler/brainfuck");
const ping = require("web-pingjs");

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
Brainfuck.config({ memorySize: 256, bits: 16 });

// Init CheckUrl
const nvt = require("node-virustotal");
const defaultTimedInstance = nvt.makeAPI();
defaultTimedInstance.setKey(process.env.VIRUSTOTALTOKEN); // SetKey

// Var
const chooseArr = ["⛰", "🧻", "✂"];
const guildCommandsID = "823815537138073610";
// Fn
const POSTMessage = (AllMessage, channel, MessageID, guild) => {
  // 172800000 -> Ms of 2days
  // 432000000 => Ms of 5days
  db.collection("guilds")
    .doc(guild)
    .update({
      messageImageToSuppr:
        AllMessage === false
          ? [
              {
                channel,
                MessageID,
                TimeStamp: Date.now() + 432000000,
              },
            ]
          : [
              ...AllMessage,
              {
                channel,
                MessageID,
                TimeStamp: Date.now() + 432000000,
              },
            ],
    });
};

const UpdateMessageVar = (Data, guild) => {
  db.collection("guilds").doc(guild).update({
    messageImageToSuppr: Data,
  });
};

const GetLevel = (guild) => {
  return new Promise((resolve, reject) => {
    db.collection("guilds")
      .doc(guild)
      .get()
      .then((doc) => {
        if (doc.exists) {
          resolve(doc.data().levels);
        } else {
          reject("No such document!");
        }
      })
      .catch(reject);
  });
};

const XpByDefault = (MessageLength) => {
  if (MessageLength <= 100) return 10;
  if (MessageLength <= 200) return 12;
  if (MessageLength <= 350) return 15;
  if (MessageLength <= 500) return 25;
  if (MessageLength <= 1000) return 50;
  if (MessageLength <= 2000) return 100;
  return 200;
};

const LevelUp = (User, guild, Data, MessageLength) => {
  let AllData = { ...Data };
  // If last user message is under 1min -> return
  if (
    AllData[User].LastMessageTime &&
    Date.now() - AllData[User].LastMessageTime < 60000
  )
    return;
  // ADD
  AllData[User].xp +=
    Math.round(Math.random() * 20) + XpByDefault(MessageLength);
  AllData[User].nbMsg += 1;
  AllData[User].LastMessageTime = Date.now();

  if (
    AllData[User].xp >= 150 * AllData[User].lvl &&
    Math.round(Math.random() * 10) <= 5
  ) {
    AllData[User].xp = 0;
    AllData[User].lvl += 1;
    const channel = client.channels.cache.find((ch) => ch.name === "annonces");
    const EmojiGG = client.emojis.cache.find((emoji) => emoji.name == "GG");
    channel.send(
      `✅ <:${EmojiGG.name}:${EmojiGG.id}> ${
        client.users.cache.find((us) => us.id === User).username
      }, Tu passes niveau ${AllData[User].lvl}!`
    );
  }

  db.collection("guilds").doc(guild).update({
    levels: AllData,
  });
};

const CheckLevelUpUser = async (User, guild, MessageLength) => {
  try {
    const Level = await GetLevel(guild);
    if (Level[User]) LevelUp(User, guild, Level, MessageLength);
    else
      db.collection("guilds")
        .doc(guild)
        .update({
          levels: {
            ...Level,
            [User]: {
              xp: Math.round(Math.random() * 20) + 10,
              lvl: 0,
              nbMsg: 1,
              LastMessageTime: Date.now(),
            },
          },
        });
  } catch (err) {
    console.error(err);
  }
};

function isValidHttpUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

const getApp = (guildID) => {
  const app = client.api.applications(client.user.id);
  if (guildID) {
    app.guilds(guildID);
  }
  return app;
};

const replyToCommand = async (interaction, replyText) => {
  let data = {
    content: replyText,
  };

  // Check For Embed
  if (typeof replyText === "object") {
    data = await createAPIMessage(interaction, replyText);
  }

  client.api.interactions(interaction.id, interaction.token).callback.post({
    data: {
      type: 4,
      data,
    },
  });
};

const createAPIMessage = async (interaction, content) => {
  const { data, files } = await APIMessage.create(
    client.channels.resolve(interaction.channel_id),
    content
  )
    .resolveData()
    .resolveFiles();

  return { ...data, files };
};

// BOT
client.on("ready", async () => {
  console.log(`I'm now online, my name is ${client.user.username}`);
  client.user.setActivity("du porno ^^", {
    type: "WATCHING",
  });

  const commands = await getApp(guildCommandsID).commands.get();

  // Add
  await getApp(guildCommandsID).commands.post({
    data: {
      name: "ping",
      description: "Fait un ping pong avec le bot !",
    },
  });
  await getApp(guildCommandsID).commands.post({
    data: {
      name: "say",
      description: "Parle à travers le Bot",
      options: [
        {
          name: "message",
          description: "Ton Message",
          required: true,
          type: 3, // String
        },
        {
          name: "embed",
          description: `"oui" ou "non"`,
          required: false,
          type: 3, // String
        },
      ],
    },
  });
  await getApp(guildCommandsID).commands.post({
    data: {
      name: "help",
      description: "Toutes les commandes du bot",
    },
  });

  client.ws.on("INTERACTION_CREATE", async (interaction) => {
    const { name, options } = interaction.data;
    const command = name.toLowerCase();

    const args = {};

    if (options) {
      for (const option of options) {
        const { name, value } = option;
        args[name] = value;
      }
    }

    if (command === "ping") {
      ping("https://google.com/")
        .then((delta) => {
          replyToCommand(
            interaction,
            `🏓 Pong\n✔✔ Votre Ping: **__${delta}__ ms** ✔✔\n(PS: Un ping supérieur à 125ms devient problèmatique)`
          );
        })
        .catch((err) => {
          replyToCommand(interaction, "pong🏓");
        });
    } else if (command === "say") {
      if (args.embed && args.embed === "oui") {
        const embed = new MessageEmbed()
          .setTitle("ANNONCE:")
          .addField("Message", args.message, true)
          .setTimestamp();
        replyToCommand(interaction, embed);
      } else {
        replyToCommand(interaction, args.message);
      }
    } else if (command === "help") {
      const embed = new MessageEmbed()
        .setColor(0xffc300)
        .setTitle("Comment utiliser IlinguBOT ?")
        .setDescription(
          `
      _ping: affiche ton ping
      _lvl: affiche ton niveau sur le serv
      _say <ton message>: dit un message de façon anonyme
      _check <url>: Vérifie si cette url est dangereuse ou nan
      \t_say embed <ton message>: dit un message avec un embed
      \t_say embedimg <ton message>: dit in message avec un embed imagé
      _rps: fait un pierre-feuilles-ciseaux avec le bot
      _meme: (à faire dans le salon meme) met un meme aléatoirement
      _rda x x: te donne un nombre aléatoirement entre le 1er x et le 2ème, ex: _rda 5 8 (nombre aléatoire entre 5 et 8)
      _timer <time> (ex: _timer 1min30s / _timer 120s), MAXIMUN = 2H/MINIMUM = 10S
    `
        )
        .setTimestamp();
      replyToCommand(interaction, embed);
    }
  });
});

client.on("guildMemberAdd", async (member) => {
  const role = member.guild.roles.cache.find(
    (role) => role.name === "Epic G@m3r"
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

  const channel = client.channels.cache.find((ch) => ch.name === "🔥général");

  channel.send(`<@everyone>\nBienvenue <@${member.user.id}> !`);
  channel.send(embed);
});

client.on("guildMemberRemove", async (member) => {
  const channel = client.channels.cache.find((ch) => ch.name === "🔥général");
  channel.send(
    `<@everyone>\nSayonara <@${member.user.id}> 😥 (tu nous manqueras pas ^^)`
  );
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
  db.collection("guilds")
    .doc(gData.id)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        db.collection("guilds").doc(gData.id).set({
          guildID: gData.id,
          guildName: gData.name,
          messageImageToSuppr: [],
          levels: {},
        });
      }
    })
    .catch(console.error);
});

client.on("message", async (message) => {
  const prefix = "_";
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (!message.guild) {
    // DM
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix))
      return message.reply(
        "Comment te dire que t'es dans mon espace privée là... Baaaaaka\n Genre on ta jamais appris à respecter la vie privée des gens."
      );
    return;
  }

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
                  })
                  .catch(console.error);
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

  if (message.channel.name === "annonces" && message.author.bot) {
    const EmojiVu = message.guild.emojis.cache.find(
      (emoji) => emoji.name == "Vu"
    );
    message.react(message.guild.emojis.cache.get(EmojiVu.id));
    return;
  }
  if (message.author.bot) return;
  // Leveling Sys
  CheckLevelUpUser(message.author.id, guild, message.content.length);

  if (
    typeof message.content === "string" &&
    isValidHttpUrl(message.content) &&
    message.channel.name !== "🔗partage" &&
    !message.content.includes(".gif") &&
    !message.content.includes("-gif") &&
    !message.content.includes("discord.com")
  ) {
    const channelPartage = message.guild.channels.cache.find(
      (ch) => ch.name === "🔗partage"
    );

    channelPartage
      .send(`(Message de <@${message.author.id}>)\n${message.content}`)
      .then((mRedirect) => {
        message
          .reply(
            `Votre message a été déplacé dans <#${channelPartage.id}> car il s'agit d'un lien.\n__Votre Message:__ https://discord.com/channels/${guild}/${channelPartage.id}/${mRedirect.id}`
          )
          .then((m) => {
            setTimeout(
              () =>
                m.edit(
                  `Lien redirigé sur <#${channelPartage.id}>\n__Votre Message:__ https://discord.com/channels/${guild}/${channelPartage.id}/${mRedirect.id}`
                ),
              6000
            );
          });
      });

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

  if (!message.content.startsWith(prefix)) return;

  if (cmd === "ping") {
    if (message.deletable) message.delete();
    const msg = await message.channel.send(`🏓 Pinging...`);

    ping("https://google.com/")
      .then((delta) => {
        msg.edit(
          `🏓 Pong\n✔✔ <@${message.author.id}> votre Ping est de **__${delta}__ ms** ✔✔\n(PS: Un ping supérieur à 125ms devient problèmatique)`
        );
      })
      .catch((err) => {
        msg.edit(
          `❌ERREUR❌, je n'ai pas réussie à calculer ton ping, réessaye.`
        );
      });
  } else if (cmd === "check") {
    if (message.channel.name !== "🤖commandes-bot") {
      if (message.deletable) message.delete();
      const channelCmdBotID = message.guild.channels.cache.find(
        (ch) => ch.name === "🤖commandes-bot"
      ).id;
      return message
        .reply(
          `Cette commande ce fait dans le <#${channelCmdBotID}>, merci de le respecter 😊`
        )
        .then((m) => m.delete({ timeout: 12000 }));
    }
    if (args.length < 1)
      return message
        .reply("Comment veut tu que je vérifie une url inexistante -_- ?!")
        .then((m) => m.delete({ timeout: 5000 }));

    if (
      typeof args[0] === "string" &&
      args[0].trim().length !== 0 &&
      isValidHttpUrl(args[0])
    ) {
      const hashed = nvt.sha256(args[0]);
      const msg = await message.channel.send(
        `Processing..., vérification de l'url en cours, veuillez patienté (~30s)`
      );
      const URLChecker = defaultTimedInstance.urlLookup(hashed, (err, res) => {
        if (err) {
          msg.edit(
            `( <@${message.author.id}> )\n❌ERREUR❌pour une raison inconnu, il m'est impossible de vérifier cette url, réessaie ultérieument.`
          );
          if (message.deletable) message.delete();
          console.log(err);
          return;
        }

        try {
          const {
            last_analysis_stats: result,
            last_analysis_results: allAnalyses,
            total_votes: CommuVotes,
          } = JSON.parse(res).data.attributes;
          msg.edit(
            `<@${message.author.id}>\nSur les ${
              Object.keys(allAnalyses).length
            } tests pour cette url:\n-**${result.harmless}** ${
              result.harmless > 1
                ? "l'ont trouvé"
                : "seule l'a trouvé (donc vraiment pas ouf)"
            } __INOFFENSIF__ 🔰\n-**${result.suspicious}** ${
              result.suspicious > 1 ? "l'ont trouvé" : "seule l'a trouvé"
            } __SUSPICIEUX__ ⭕\n-**${result.malicious}** ${
              result.malicious > 1 ? "l'ont trouvé" : "seule l'a trouvé"
            } __TRÉS DANGEREUSE__ ❌\n-(et ${
              result.undetected + result.timeout
            } n'ont/n'a rien renvoyé ❔)`
          );
          message.channel.send(
            `Vote de la communautée (la communauté d'internet te disent si ils ont trouvé cette url dangereuse ou nan, cette info ne sera pas prise en compte dans la conclusion, c'est à titre indicatif) ->\n__INOFFENSIF__: ${CommuVotes.harmless} 🔰\n__TRÉS DANGEREUSE__: ${CommuVotes.malicious} ❌`
          );
          message.channel.send(
            `<@${message.author.id}>, Au final:\n${
              result.malicious >= 1
                ? "❌**TRÉS DANGEREUSE ET INFÉCTÉE !!!**❌, je te conseillerais de ❌**NE SURTOUT PAS L'OUVRIR !**❌"
                : result.suspicious >= 1
                ? "⭕**SUSPECTE**⭕, je te conseille de jetée un coup d'oeil à se quand pense la communauté (message qui est juste avant) et si tu veux y allé, __vasi avec un anti-virus et n'y rentre aucune infos perso__"
                : result.harmless >=
                    Math.round(Object.keys(allAnalyses).length / 2) &&
                  result.harmless <
                    Math.round(Object.keys(allAnalyses).length / 1.5)
                ? "🔰**PLUTOT SÛR**🔰, c'est à dire qu'il n'y devrais avoir aucun problème mais fait attention car il n'y a que entre 50% et 75% des test qui disent qu'elle est inoffensif, les autres tests n'ont rien renvoyé."
                : result.harmless >=
                    Math.round(Object.keys(allAnalyses).length / 1.5) &&
                  result.harmless <
                    Math.round(Object.keys(allAnalyses).length / 1.1)
                ? "🔰**SÛR ET INOFFENSIF**🔰, entre 75% et 95% des test disent qu'elle est inoffensif. Cela doit être dû au cookies et autres...."
                : result.harmless >=
                  Math.round(Object.keys(allAnalyses).length / 1.1)
                ? "🔰**TRÉS SÛR ET INOFFENSIF**🔰, Aucun problème: url safe -> Plus de 95% des test disent qu'elle est inoffensif."
                : "❔ ERREUR ❔ Aucune données envoyées, réessaie ultérieument."
            }`
          );
          if (result.malicious >= 1 || result.suspicious >= 1)
            if (message.deletable) message.delete();
        } catch (err) {
          console.error(err);
          message.channel.send(
            `❌ERREUR❌ problème dans le script... <-- A BA NANNNNNN (UI là c'est de ma faute, je savais que j'étais le pire dev 💢)`
          );
          if (message.deletable) message.delete();
        }
      });
    } else {
      return message
        .reply("Merci de me donner une url **VALIDE**")
        .then((m) => m.delete({ timeout: 5000 }));
    }
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
    if (message.channel.name !== "🤖commandes-bot") {
      if (message.deletable) message.delete();
      const channelCmdBotID = message.guild.channels.cache.find(
        (ch) => ch.name === "🤖commandes-bot"
      ).id;
      return message
        .reply(
          `Cette commande ce fait dans le <#${channelCmdBotID}>, merci de le respecter 😊`
        )
        .then((m) => m.delete({ timeout: 12000 }));
    }
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
  } else if (cmd === "lvl") {
    if (message.channel.name !== "🤖commandes-bot") {
      if (message.deletable) message.delete();
      const channelCmdBotID = message.guild.channels.cache.find(
        (ch) => ch.name === "🤖commandes-bot"
      ).id;
      return message
        .reply(
          `Cette commande ce fait dans le <#${channelCmdBotID}>, merci de le respecter 😊`
        )
        .then((m) => m.delete({ timeout: 12000 }));
    }
    let UserLvl = null;
    let Mention = false;
    if (args[0] && message.mentions) {
      Mention = true;
      UserLvl = (await GetLevel(guild))[message.mentions.users.first().id];
    } else UserLvl = (await GetLevel(guild))[message.author.id];

    const Embed = new MessageEmbed()
      .setColor(0xffc300)
      .setTitle(
        `⭕Niveau de ${
          !Mention
            ? message.author.username
            : message.mentions.users.first().username
        }⭕`
      )
      .setDescription(
        `**Ton niveau**: __${UserLvl.lvl}__\n**Ton XP**: __${
          UserLvl.xp
        }__\n**Info**:\n- XP minimum pour lvl supérieur: __${
          150 * UserLvl.lvl
        }__\n- Progression: __${Math.round(
          (UserLvl.xp / (150 * UserLvl.lvl)) * 100
        )}%__\n- Nombres de messages au total: __${UserLvl.nbMsg}__`
      )
      .setTimestamp()
      .setAuthor(message.author.username, message.author.displayAvatarURL())
      .setFooter(client.user.username, client.user.displayAvatarURL());

    message.channel.send(Embed);
  } else if (cmd === "encrypt") {
    if (message.deletable) message.delete();
    if (args.length < 1)
      return message
        .reply("Encrypter/Decrypter Rien ?!")
        .then((m) => m.delete({ timeout: 5000 }));

    const Compiled = Brainfuck.compile(args[0]);
    let buf = [];
    Compiled.run("", (num, char) => {
      buf = [...buf, char];
    });
    message.channel.send(buf.join(""));
  } else if (cmd === "help") {
    if (message.deletable) message.delete();
    const Embed = new MessageEmbed()
      .setColor(0xffc300)
      .setTitle("Comment utiliser IlinguBOT ?")
      .setDescription(
        `
      _ping: affiche ton ping
      _lvl: affiche ton niveau sur le serv
      _say <ton message>: dit un message de façon anonyme
      _check <url>: Vérifie si cette url est dangereuse ou nan
      \t_say embed <ton message>: dit un message avec un embed
      \t_say embedimg <ton message>: dit in message avec un embed imagé
      _rps: fait un pierre-feuilles-ciseaux avec le bot
      _meme: (à faire dans le salon meme) met un meme aléatoirement
      _rda x x: te donne un nombre aléatoirement entre le 1er x et le 2ème, ex: _rda 5 8 (nombre aléatoire entre 5 et 8)
      _timer <time> (ex: _timer 1min30s / _timer 120s), MAXIMUN = 2H/MINIMUM = 10S
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
  } else if (cmd === "timer") {
    const Time = args[0];

    if (message.deletable) message.delete();

    if (!Time)
      return message
        .reply("No Time for a Timer ? Are u serious ?")
        .then((m) => m.delete({ timeout: 6000 }));

    const filter = (reaction, user) => {
      return (
        ["❌", "🛑"].includes(reaction.emoji.name) &&
        user.id === message.author.id
      );
    };

    if (Time.split("min").length > 1 && Time.split("min")[1] === "") {
      const Minutes = parseInt(Time.split("min")[0]);

      if (isNaN(Minutes))
        return message
          .reply("This is not a valide time")
          .then((m) => m.delete({ timeout: 6000 }));

      if (Minutes > 120)
        return message
          .reply(
            "Merci de ne pas exéder un temps de 2H max pour ne pas trop surchager mon BOT"
          )
          .then((m) => m.delete({ timeout: 10000 }));
      if (Minutes < 1)
        return message
          .reply(
            "Merci de mettre au minimum un temps de 1min quand vous utiliser les minutes"
          )
          .then((m) => m.delete({ timeout: 10000 }));

      let MinutesInS = Minutes * 60;
      const InMs = Minutes * 60000;
      const NumberToSoustracteAtEachInterval = Math.round(MinutesInS / 10);

      const m = await message.channel.send(
        `<@${message.author.id}> : Fin du minuteur dans **${MinutesInS}** secondes\n(PS: react avec ❌ ou 🛑 pour stop le timer)`
      );
      const TheInterval = setInterval(() => {
        MinutesInS -= NumberToSoustracteAtEachInterval;
        m.edit(
          `<@${message.author.id}> : Fin du minuteur dans **${MinutesInS}** secondes\n(PS: react avec ❌ ou 🛑 pour stop le timer)`
        );
      }, Math.round(MinutesInS / 10) * 1000);
      const TheTimeout = setTimeout(() => {
        clearInterval(TheInterval);
        message.channel.send(
          `<@${message.author.id}> : Fin du minuteur ! Temps écoulé.`
        );
        if (m.deletable) m.delete();
      }, InMs);
      m.awaitReactions(filter, {
        max: 1,
        time: MinutesInS * 1000,
        errors: ["time"],
      })
        .then((collected) => {
          clearInterval(TheInterval);
          clearTimeout(TheTimeout);
          message.channel.send(
            `<@${message.author.id}> : Fin du minuteur ! Minuteur annulé.`
          );
          if (m.deletable) m.delete();
        })
        .catch(console.error);
    } else if (Time.split("min").length > 1 && Time.split("min")[1] !== "") {
      const Minutes = parseInt(Time.split("min")[0]);
      const Secondes = parseInt(Time.split("min")[1]);

      if (isNaN(Minutes) || isNaN(Secondes))
        return message
          .reply("This is not a valide time")
          .then((m) => m.delete({ timeout: 6000 }));
      if (Minutes * 60 + Secondes > 7200)
        return message
          .reply(
            "Merci de ne pas exéder un temps de 2H max pour ne pas trop surchager mon BOT"
          )
          .then((m) => m.delete({ timeout: 10000 }));
      if (Minutes * 60 + Secondes < 10)
        return message
          .reply("Merci de mettre au minimum un temps de 10s")
          .then((m) => m.delete({ timeout: 10000 }));

      let InS = Minutes * 60 + Secondes;
      const InMs = Minutes * 60000 + Secondes * 1000;
      const NumberToSoustracteAtEachInterval = Math.round(InS / 10);

      const m = await message.channel.send(
        `<@${message.author.id}> : Fin du minuteur dans **${InS}** secondes\n(PS: react avec ❌ ou 🛑 pour stop le timer)`
      );
      const TheInterval = setInterval(() => {
        InS -= NumberToSoustracteAtEachInterval;
        m.edit(
          `<@${message.author.id}> : Fin du minuteur dans **${InS}** secondes\n(PS: react avec ❌ ou 🛑 pour stop le timer)`
        );
      }, Math.round(InS / 10) * 1000);
      const TheTimeout = setTimeout(() => {
        clearInterval(TheInterval);
        message.channel.send(
          `<@${message.author.id}> : Fin du minuteur ! Temps écoulé.`
        );
        if (m.deletable) m.delete();
      }, InMs);
      m.awaitReactions(filter, {
        max: 1,
        time: InS * 1000,
        errors: ["time"],
      })
        .then((collected) => {
          clearInterval(TheInterval);
          clearTimeout(TheTimeout);
          message.channel.send(
            `<@${message.author.id}> : Fin du minuteur ! Minuteur annulé.`
          );
          if (m.deletable) m.delete();
        })
        .catch(console.error);
    } else {
      let Secondes = parseInt(Time.split("s"));

      if (isNaN(Secondes))
        return message
          .reply("This is not a valide time")
          .then((m) => m.delete({ timeout: 6000 }));

      if (Secondes > 7200)
        return message
          .reply(
            "Merci de ne pas exéder un temps de 2H max pour ne pas trop surchager mon BOT"
          )
          .then((m) => m.delete({ timeout: 10000 }));
      if (Secondes < 10)
        return message
          .reply("Merci de mettre au minimum un temps de 10s")
          .then((m) => m.delete({ timeout: 10000 }));

      const InMs = Secondes * 1000;
      const NumberToSoustracteAtEachInterval = Math.round(Secondes / 10);

      const m = await message.channel.send(
        `<@${message.author.id}> : Fin du minuteur dans **${Secondes}** secondes\n(PS: react avec ❌ ou 🛑 pour stop le timer)`
      );
      const TheInterval = setInterval(() => {
        Secondes -= NumberToSoustracteAtEachInterval;
        m.edit(
          `<@${message.author.id}> : Fin du minuteur dans **${Secondes}** secondes\n(PS: react avec ❌ ou 🛑 pour stop le timer)`
        );
      }, Math.round(Secondes / 10) * 1000);
      const TheTimeout = setTimeout(() => {
        clearInterval(TheInterval);
        message.channel.send(
          `<@${message.author.id}> : Fin du minuteur ! Temps écoulé.`
        );
        if (m.deletable) m.delete();
      }, InMs);
      m.awaitReactions(filter, {
        max: 1,
        time: Secondes * 1000,
        errors: ["time"],
      })
        .then((collected) => {
          clearInterval(TheInterval);
          clearTimeout(TheTimeout);
          message.channel.send(
            `<@${message.author.id}> : Fin du minuteur ! Minuteur annulé.`
          );
          if (m.deletable) m.delete();
        })
        .catch(console.error);
    }
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
