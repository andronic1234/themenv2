const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} = require("@discordjs/voice");
const yts = require("yt-search");
const ytdl = require("ytdl-core");

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
    let time = videos[0].timestamp;
    let chann = videos[0].author.name;
    let thumb = videos[0].thumbnail;
    //Get song info
    var song = {
      title: videos[0].title,
      url: videos[0].url,
    };

    let NowPlaying = new EmbedBuilder()
      .setTitle("🎶 **Now Playing** 🎶")
      .setColor("DarkGreen")
      .setThumbnail(thumb)
      .addFields([
        {
          name: `Song Information:`,
          value: `[${song.title}](${song.url})\n\n**Channel: __${chann}__\nLength: __${time}__**`,
          inline: false,
        },
      ]);
    //Create queue constructor
    const video_player = async (guild, song) => {
      const song_queue = queue.get(guild.id);

      var stream = ytdl(song.url, { filter: "audioonly" });
      const player = createAudioPlayer();
      const resource = createAudioResource(stream);
      player.play(resource);
      song_queue.connection.subscribe(player);
      stream.on("finish", () => {
        console.log(song_queue.songs[0]);
        song_queue.songs.shift();
        video_player(guild, song_queue.songs[0]);
      });
      await song_queue.text_channel.send({ embeds: [NowPlaying] });
    };

    if (!server_queue) {
      const queue_constructor = {
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
    } else {
      server_queue.songs.push(song);
      message.channel.send(`🎶**${song.title}** added to the queue.`);
    }
  },
};
