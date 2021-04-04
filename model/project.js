const mongoose = require("mongoose")


const issueSchema = new mongoose.Schema({
  issue_title: { type: String, required: true },
  created_by: { type: String, required: true },
  issue_text: {type: String, default: ""},
  assigned_to: {type: String, default: ""},
  status_text: {type: String, default: ""},
  open: {type: Boolean, default: true},
}, { timestamps: { createdAt: "created_on", updatedAt: "updated_on" } });

const projectSchema = new mongoose.Schema({
  project_name: { type: String, required: true, unique: true },
  issues: [issueSchema]
})

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;