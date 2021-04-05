const mongoose = require("mongoose")

const issueSchema = new mongoose.Schema({
  issue_title: { type: String, required: true },
  created_by: { type: String, required: true },
  issue_text: {type: String, default: ""},
  assigned_to: {type: String, default: ""},
  status_text: {type: String, default: ""},
  open: { type: Boolean, default: true },
  project: {type: mongoose.Schema.Types.ObjectId, ref: "Project"}
}, { timestamps: { createdAt: "created_on", updatedAt: "updated_on" } });

const Issue = mongoose.model("Issue", issueSchema);

module.exports = Issue;