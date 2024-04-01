const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const userSchema = new Schema(
  {
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    date_of_birth: Date,
    gender: String,
    role: {
      type: String,
      enum: ["volunteer", "researcher"],
      default: "volunteer",
    },
    weight: Number,
    height: Number,
    blood_type: String,
    is_smoker: Boolean,
    is_twins: Boolean,
    tags: [String],
    research_involved: [
      {
        research_id: ObjectId,
        status: String,
        message_list: [
          {
            message: String,
            date: Date,
          },
        ],
      },
    ],
  },
  {timestamps: true, versionKey: false}
);

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
