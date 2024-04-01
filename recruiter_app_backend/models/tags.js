const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tagSchema = new Schema(
  {
    name: String,
    category: String,
  },
  {timestamps: true, versionKey: false}
);
tagSchema.index({name: "text"});
const TagModel = mongoose.model("Tag", tagSchema);

module.exports = TagModel;
