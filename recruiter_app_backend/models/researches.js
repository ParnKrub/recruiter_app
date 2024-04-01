const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const researchSchema = new Schema(
  {
    title: String,
    author_user_id: ObjectId,
    location: String,
    date: Date,
    description: String,
    status: String,
    min_age: String,
    max_age: String,
    gender: String,
    tags: [String],
    participants: {type: [ObjectId], default: []},
    announcements_list: {
      type: [
        {
          announcement: String,
          date: Date,
        },
      ],
      default: [],
    },
    message_list: {
      type: [
        {
          message: String,
          date: Date,
        },
      ],
      default: [],
    },
  },
  {timestamps: true, versionKey: false}
);

const researchModel = mongoose.model("Research", researchSchema);

module.exports = researchModel;
