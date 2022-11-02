const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const yts = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");

const queue = new Map();
module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays a song from YouTube.")
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription("send a YouTube link or text.")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const message = await interaction.deferReply({
      fetchReply: true,
    });
    message.delete(200);

    let SaveQueue;

    // Box Input, basically the args
    let input = interaction.options._hoistedOptions[0].value;
    let voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      PlayMessage = `You need to be in a voice channel men! 😡`;
      return message.channel.send(PlayMessage);
    }

    const server_queue = queue.get(interaction.guild.id);

    //Searches string with ytsearch
    const r = await yts(input);
    const videos = r.videos.slice(0, 1);
    //Get song info
    const song = {
      title: videos[0].title,
      url: videos[0].url,
      time: videos[0].timestamp,
      chann: videos[0].author.name,
      thumb: videos[0].thumbnail,
      skipped: false,
    };

    //Create queue constructor
    const video_player = async (guild, song) => {
      var song_queue = queue.get(guild.id);
      try {
        var stream = ytdl(song.url, { filter: "audioonly" });

        var player = createAudioPlayer();
        const resource = createAudioResource(stream);
        player.play(resource);
      } catch {}
      song_queue.connection.subscribe(player);

      SaveQueue = JSON.stringify(song_queue.songs);

      fs.writeFile("queue.json", SaveQueue, function (err) {
        if (err) {
          console.log("Error while saving queue.");
          return console.log(err);
        }
      });

      player.on(AudioPlayerStatus.Paused, () => {
        let Queue = fs.readFileSync("queue.json", "utf8");
        let CheckSkip = JSON.parse(Queue);
        if (CheckSkip[0].skipped == true) {
          song_queue.songs.shift();
          video_player(guild, song_queue.songs[0]);
          player.unpause();


        }
      });

      player.on(AudioPlayerStatus.Idle, () => {
        console.log(song_queue.songs[0]);
        if (song_queue.songs.length != 0) {
          song_queue.songs.shift();
          video_player(guild, song_queue.songs[0]);
        }
      });
      let NowPlaying = new EmbedBuilder()
        .setTitle("🎶 **Now Playing** 🎶")
        .setColor("DarkGreen")
        .setThumbnail(song_queue.songs[0].thumb)
        .addFields([
          {
            name: `Song Information:`,
            value: `[${song_queue.songs[0].title}](${song_queue.songs[0].url})\n\n**Channel: __${song_queue.songs[0].chann}__\nLength: __${song_queue.songs[0].time}__**`,
            inline: false,
          },
        ]);

      await song_queue.text_channel.send({ embeds: [NowPlaying] });
    };

    if (
      !server_queue ||
      getVoiceConnection(interaction.guild.id) == undefined
    ) {
      var queue_constructor = {
        voice_channel: voiceChannel,
        text_channel: interaction.channel,
        connection: null,
        songs: [],
      };
      queue.set(interaction.guild.id, queue_constructor);
      queue_constructor.songs.push(song);

      try {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: interaction.guildId,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });
        queue_constructor.connection = connection;
        video_player(interaction.guild, queue_constructor.songs[0]);
      } catch (err) {
        queue.delete(interaction.guild.id);
        message.channel.send("Error while trying to establish connection.");
        throw err;
      }
      SaveQueue = JSON.stringify(queue_constructor.songs);

      fs.writeFile("queue.json", SaveQueue, function (err) {
        if (err) {
          console.log("Error while saving queue.");
          return console.log(err);
        }
      });
    } else {
      server_queue.songs.push(song);
      message.channel.send(`🎶**${song.title}** added to the queue.`);

      SaveQueue = JSON.stringify(server_queue.songs);

      fs.writeFile("queue.json", SaveQueue, function (err) {
        if (err) {
          console.log("Error while saving queue.");
          return console.log(err);
        }
      });
    }
  },
};
