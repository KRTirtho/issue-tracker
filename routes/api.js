'use strict';
const Project = require("../model/project");
const Issue = require("../model/issue");
const mongoose = require("mongoose");
module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(async function (req, res) {
      try {
        let project_name = req.params.project;
        if (Object.entries(req.query).length !== 0) {
          const open = req.query.open;
          if (open !== undefined) {
            req.query.open = open === "true";
          }
          const project = await Project.findOne({ project_name })
            .populate({ path: "issues", match: req.query, select: "-project" });
          return res.json(project && project.issues ? project.issues : []);
        }
        const project = await Project.findOne({ project_name }).populate("issues").lean();
        res.json(project && project.issues ? project.issues : []);
      } catch (error) {
        console.error("[GET failed for Project]: ", error);
        res.end();
      }
    })

    .post(async function (req, res) {
      try {
        let project_name = req.params.project;
        let issue = req.body;
        if (!(issue.issue_title && issue.issue_text && issue.created_by)) {
          return res.json({ error: 'required field(s) missing' });
        }
        const _id = mongoose.Types.ObjectId();
        const project = await Project.findOne({ project_name }).populate("issues");
        if (!project) {
          const newIssue = new Issue({ ...issue, project: _id });
          await Project.create({ project_name, _id, issues: [newIssue._id] });
          await newIssue.save();
          return res.json(newIssue);
        }
        const { _doc: { project: l, __v, ...newIssue } } = await Issue.create({ ...issue, project: { _id: project._id } });
        project.issues.push(newIssue._id);
        await project.save();
        return res.json(newIssue);
      } catch (error) {
        console.error("[POST failed for Project]: ", error);
      }
    })

    .put(async function (req, res) {
      try {
        let { _id, ...fields } = req.body;
        if (!_id) {
          return res.json({ error: 'missing _id' })
        }
        else if (Object.entries(fields).length === 0) {
          return res.json({ error: 'no update field(s) sent', _id })
        }
        await Issue.updateOne({ _id }, fields, { multi: false, runValidators: true, omitUndefined: true })
        res.json({ result: "successfully updated", _id });
      } catch (error) {
        console.error("[PUT failed for Project]: ", error);
        res.json({ error: 'could not update', _id: req.body._id });
      }
    })

    .delete(async function (req, res) {
      const _id = req.body._id;
      try {
        if (!_id) {
          return res.json({ error: 'missing _id' });
        }
        await Issue.deleteOne({ _id });
        res.json({ result: "successfully deleted", _id })
      } catch (error) {
        console.error("[DELETE failed for Project]: ", error);
        res.json({ error: 'could not delete', _id })
      }
    });

};
