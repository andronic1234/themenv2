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
    message.delete(200);

    // Box Input, basically the args
    let input = interaction.options._hoistedOptions[0].value;
    let voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      PlayMessage = `You need to be in a voice channel men! 😡`;
      return message.channel.send(PlayMessage);
    }

    const server_queue = queue.get(interaction.guild.id);

    //Searches string with ytsearch
    let Guild_ID = { id: interaction.guild.id };
    let song;
    if (input.includes("playlist?list=")) {
      let listID = input.substr(input.search("list=") + 5, 34);
      const list = await yts({ listId: listID });
      var listarr = new Array();
      for (let i = 0; i < Math.min(list.videos.length, 100); i++) {
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
      const r = await yts(input);
      let svideos = r.videos.slice(0, 1);
      //Get song info
      song = {
        title: svideos[0].title,
        url: svideos[0].url,
        time: svideos[0].timestamp,
        chann: svideos[0].author.name,
        thumb: svideos[0].thumbnail,
      };
    }
    //Create queue constructor
    const video_player = async (guild, song) => {
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      var song_queue = queue.get(guild.id);
      try {
        //Gets yt stream and plays it
        var stream = ytdl(song.url, {
          filter: "audioonly",
          quality: "highestaudio",
          highWaterMark: 1 << 25,
        });

        var player = createAudioPlayer();
        const resource = createAudioResource(stream);
        player.play(resource, { highWaterMark: 1 });
      } catch {}
      song_queue.connection.subscribe(player);

      //Skipping event
      let search = Options.findIndex(
        (ID) => ID.guildID == `${interaction.guild.id}`
      );
      player.on(AudioPlayerStatus.Paused, () => {
        if (song_queue.songs[0].skipped == true) {
          if (Options[search] == undefined) {
            Options.push({
              guildID: interaction.guild.id,
              shuffle: false,
              loop: false,
            });
            search = Options.length - 1;
          }
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
        if (Options[search] == undefined) {
          Options.push({
            guildID: interaction.guild.id,
            shuffle: false,
            loop: false,
          });
          search = Options.length - 1;
        }

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
          } catch (err) {
            console.log(err);
          }
        }
      });
      //Now Playing embed
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
      } else {
        server_queue.songs.push(song);
      }

      message.channel.send(`🎶**${song.title}** added to the queue.`);
    }
  },
};
