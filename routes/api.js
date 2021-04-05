'use strict';
const Project = require("../model/project");
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
          const query = Object.fromEntries(Object.entries(req.query).map(([key, value]) => [`issues.${key}`, value]));
          const project = (await Project
            .aggregate()
            .match({ project_name })
            .project("issues project_name")
            .unwind("$issues")
            .match(query)
            .exec()).map(el => el.issues);
          return res.json(project ? project : []);
        }
        const project = await Project.findOne({ project_name }).lean();
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
        const updatedProject = await Project.findOneAndUpdate({ project_name }, { $push: { issues: { ...issue, _id } } }, { new: true, upsert: true }).lean()
        return res.json(updatedProject.issues.find(issue => String(issue._id) === String(_id)));
      } catch (error) {
        console.error("[POST failed for Project]: ", error);
      }
    })

    .put(async function (req, res) {
      try {
        let project_name = req.params.project;
        let { _id, issue_text, created_by, assigned_to, status_text, issue_title, open } = req.body;
        if (!_id) {
          return res.json({ error: 'missing _id' })
        }
        else if (Object.entries(req.body).length === 1) {
          return res.json({ error: 'no update field(s) sent', _id })
        }
        await Project.updateOne({ project_name, "issues._id": _id }, {
          $set: {
            "issues.$.issue_title": issue_title || undefined,
            "issues.$.issue_text": issue_text || undefined,
            "issues.$.created_by": created_by || undefined,
            "issues.$.assigned_to": assigned_to || undefined,
            "issues.$.status_text": status_text || undefined,
            "issues.$.open": open || undefined,
          }
        }, { multi: false, runValidators: true, omitUndefined: true })
        res.json({ result: "successfully updated", _id });
      } catch (error) {
        console.error("[PUT failed for Project]: ", error);
        res.json({ error: 'could not update', _id: req.body._id });
      }
    })

    .delete(async function (req, res) {
      const _id = req.body._id;
      try {
        let project_name = req.params.project;
        if (!_id) {
          return res.json({ error: 'missing _id' });
        }
        await Project.updateOne({ project_name, "issues._id": _id }, { $pull: { issues: { _id } } }, { multi: false })
        res.json({ result: "successfully deleted", _id })
      } catch (error) {
        console.error("[DELETE failed for Project]: ", error);
        res.json({ error: 'could not delete', _id })
      }
    });

};
