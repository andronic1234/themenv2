const { Schema, model } = require("mongoose");
const profileSchema = new Schema({
  userID: { type: String, require: true, unique: true },
  serverID: { type: String, require: true },
  men: { type: Number, default: 0 },
});

module.exports = model("ProfileModels", profileSchema);
