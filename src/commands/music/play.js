const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  AudioPlayerStatus,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
const yts = require("yt-search");
const ytdl = require("ytdl-core");

const queue = new Map();
let Options = [];
module.exports = {
  Queue: queue,
  options: Options,
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
    if (interaction.channel === null) {
      return interaction.editReply({
        content: "This command doesn't work in DMs",
      });
    } else {
      message.delete(200);
    }

    let search = Options.findIndex(
      (ID) => ID.guildID == `${interaction.guild.id}`
    );

    if (Options[search] == undefined) {
      Options.push({
        guildID: interaction.guild.id,
        shuffle: false,
        loop: false,
      });
      search = Options.length - 1;
    }

    // Box Input, basically the args
    let input = interaction.options._hoistedOptions[0].value;
    let voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      PlayMessage = `You need to be in a voice channel men! 😡`;
      return message.channel.send(PlayMessage);
    }

    const server_queue = queue.get(interaction.guild.id);

    //Searches string with ytsearch
    let song;
    let listData;
    if (input.includes("playlist?list=")) {
      let listID = input.substr(input.search("list=") + 5, 34);
      const list = await yts({ listId: listID });
      listData = {
        name: list.title,
        url: list.url,
        thumbnail: list.thumbnail,
        size: list.size,
      };
      var listarr = new Array();
      for (let i = 0; i < list.videos.length; i++) {
        song = {
          title: list.videos[i].title,
          url: "https://www.youtube.com/watch?v=" + list.videos[i].videoId,
          time: list.videos[i].duration.timestamp,
          chann: list.videos[i].author.name,
          thumb: list.videos[i].thumbnail,
        };
        listarr.push(song);
        if (i == 99) {
          interaction.channel.send(
            "Limit is 100 songs per list. Added the first 100 songs."
          );
        }
      }
    } else {
      let videoID;
      let svideos;
      let r;
      if (input.includes("watch?v=")) {
        videoID = input.substr(input.search("v=") + 2, +11);
      }
      if (input.includes("youtu.be/")) {
        videoID = input.substr(input.search("be/") + 3, +11);
      }
      if (videoID !== undefined) {
        r = await yts({ videoId: videoID });
        song = {
          title: r.title,
          url: r.url,
          time: r.timestamp,
          chann: r.author.name,
          thumb: r.thumbnail,
        };
      } else {
        r = await yts(input);
        svideos = r.videos.slice(0, 1);
        song = {
          title: svideos[0].title,
          url: svideos[0].url,
          time: svideos[0].timestamp,
          chann: svideos[0].author.name,
          thumb: svideos[0].thumbnail,
        };
      }
      //Get song info
    }
    //Create queue constructor
    const video_player = async (guild, song) => {
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      var song_queue = queue.get(guild.id);
      try {
        let stream;
        //Gets yt stream and plays it
        //If video is livestream
        if (song?.time === "0:00") {
          song.time = "Livestream";
          stream = ytdl(song?.url, {
            liveBuffer: 4900,
            quality: [91, 92, 93, 94, 95],
            highWaterMark: 1 << 25,
          });
        } else {
          //If video is not livestream
          stream = ytdl(song?.url, {
            filter: "audioonly",
            quality: "highestaudio",
            highWaterMark: 1 << 25,
          });
        }
        var player = await createAudioPlayer();
        const resource = await createAudioResource(stream);
        player.play(resource, { highWaterMark: 1 });
        song_queue.connection.subscribe(player);
        stream.on("error", (err) => {
          song_queue.text_channel.send(
            "There was an error with the song stream. Playing next song..."
          );
          song_queue.songs.shift();
          return video_player(guild, song_queue.songs[0]);
        });
        song_queue.connection.on(VoiceConnectionStatus.Disconnected, () => {
          return queue.delete(interaction.guild.id);
        });
      } catch (err) {
        console.log(err);
      }

      //Skipping event

      player.on(AudioPlayerStatus.Paused, () => {
        if (song_queue.songs[0].skipped == true) {
          //Shuffle & Loop on
          if (Options[search].loop == true && Options[search].shuffle == true) {
            song_queue.songs.push(song_queue.songs.shift());
            song_queue.songs.sort((a, b) => 0.5 - Math.random());
            video_player(guild, song_queue.songs[0]);
            player.unpause();
            return;
          }
          //Loop on
          if (Options[search].loop == true) {
            song_queue.songs.push(song_queue.songs.shift());
            video_player(guild, song_queue.songs[0]);
            player.unpause();
            return;
          } else if (song_queue.songs.length > 1) {
            //Shuffle on
            if (Options[search].shuffle == true) {
              song_queue.songs.shift();
              song_queue.songs.sort((a, b) => 0.5 - Math.random());
              video_player(guild, song_queue.songs[0]);
              player.unpause();
              return;
            }
            //Shift queue
          } else {
            song_queue.songs.shift();
            video_player(guild, song_queue.songs[0]);
            player.unpause();
            return;
          }
          song_queue.songs.shift();
          video_player(guild, song_queue.songs[0]);
          player.unpause();
          return;
        }
      });
      player.on(AudioPlayerStatus.Idle, async () => {
        await delay(500);

        //Shuffle & Loop on
        if (Options[search].loop == true && Options[search].shuffle == true) {
          song_queue.songs.push(song_queue.songs.shift());
          song_queue.songs.sort((a, b) => 0.5 - Math.random());
          return video_player(guild, song_queue.songs[0]);
        }
        //Loop on
        if (Options[search].loop == true) {
          song_queue.songs.push(song_queue.songs.shift());
          video_player(guild, song_queue.songs[0]);
        } else if (song_queue.songs.length > 1) {
          //Shuffle on
          if (Options[search].shuffle == true) {
            song_queue.songs.shift();
            song_queue.songs.sort((a, b) => 0.5 - Math.random());
            //Shift queue
          } else {
            song_queue.songs.shift();
          }
          video_player(guild, song_queue.songs[0]);
          //Last song before dc
        } else {
          song_queue.songs.shift();
          try {
            for (var i = 0; i < 60; i++) {
              await delay(2000);
              if (song_queue.songs.length != 0) {
                video_player(guild, song_queue.songs[0]);
                i = 61;
              }
            }
            if (song_queue.songs.length == 0) {
              song_queue.connection.destroy();
              queue.delete(interaction.guild.id);
            }
          } catch {}
        }
      });

      //Now Playing embed
      try {
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
      } catch {}
    };
    //Create server queue
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
      if (listarr != undefined) {
        queue_constructor.songs = listarr;
      } else {
        queue_constructor.songs.push(song);
      }
      try {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: interaction.guildId,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });
        queue_constructor.connection = connection;
        if (Options[search].shuffle == true)
          queue_constructor.songs.sort((a, b) => 0.5 - Math.random());
        video_player(interaction.guild, queue_constructor.songs[0]);
      } catch (err) {
        queue.delete(interaction.guild.id);
        message.channel.send("Error while trying to establish connection.");
        throw err;
      }
    } else {
      //If there's a server queue song is gonna get pushed at the end of the queue
      if (listarr != undefined) {
        server_queue.songs = server_queue.songs.concat(listarr);

        const AddedList = new EmbedBuilder()
          .setTitle("🎶 **Added Playlist** 🎶")
          .setColor("LuminousVividPink")
          .setThumbnail(listData?.thumbnail)
          .addFields([
            {
              name: `List Information:`,
              value: `[${listData.name}](${listData?.url})\n\n**Number of songs: __${listData?.size}__**`,
              inline: false,
            },
          ]);
        message.channel.send({ embeds: [AddedList] });
      } else {
        server_queue.songs.push(song);
        const AddedSong = new EmbedBuilder()
          .setTitle("🎶 **Added Song** 🎶")
          .setColor("Orange")
          .setThumbnail(song.thumb)
          .addFields([
            {
              name: `Song Information:`,
              value: `[${song?.title}](${song?.url})\n\n**Channel: __${song?.chann}__\nLength: __${song?.time}__**`,
              inline: false,
            },
          ]);
        message.channel.send({ embeds: [AddedSong] });
      }
    }
  },
};
