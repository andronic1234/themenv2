module.exports = {
  name: "err",
  execute(err) {
    console.log(`Failed to connect to Mongo with the following error:\n${err}`);
  },
};
