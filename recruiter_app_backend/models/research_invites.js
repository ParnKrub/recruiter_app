const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const researchInviteSchema = new Schema({
  research_id: ObjectId,
  volunteer_invite_list: [{volunteer_id: ObjectId, status: String}],
  volunteer_request_list: [{volunteer_id: ObjectId, status: String}],
});

const researchInviteModel = mongoose.model(
  "ResearchInvite",
  researchInviteSchema
);

module.exports = researchInviteModel;
