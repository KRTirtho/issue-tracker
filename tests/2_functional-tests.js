const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const Project = require("../model/project");
const { after } = require('mocha');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  after(() => {
    Project.deleteOne({ project_name: "spotube" })
      .then(() => {
        console.log("Successfully deleted test(spotube) project")
      })
      .catch(err => console.error("[Failed to delete test(spotube) project]: ", err))
  })
  test('Create an issue with every field', (done) => {
    chai
      .request(server)
      .post("/api/issues/spotube")
      .send({
        issue_title: "WaterMelon Sugar",
        issue_text: "Song.",
        created_by: "LiterallyNoOne",
        assigned_to: "Me",
        status_text: "Huh"
      })
      .end((_, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.body.issue_title, "WaterMelon Sugar")
        assert.equal(res.body.issue_text, "Song.")
        assert.equal(res.body.created_by, "LiterallyNoOne")
        assert.equal(res.body.assigned_to, "Me")
        assert.equal(res.body.status_text, "Huh")
        assert.equal(res.body.open, true)
        assert.property(res.body, "_id")
        assert.property(res.body, "created_on")
        assert.property(res.body, "updated_on")
        done()
      })
  })
  test('Create an issue with only required fields', (done) => {
    chai
      .request(server)
      .post("/api/issues/spotube")
      .send({
        issue_title: "WaterMelon Sugar",
        issue_text: "Song.",
        created_by: "LiterallyNoOne",
      })
      .end((_, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.body.issue_title, "WaterMelon Sugar")
        assert.equal(res.body.issue_text, "Song.")
        assert.equal(res.body.created_by, "LiterallyNoOne")
        assert.equal(res.body.assigned_to, "")
        assert.equal(res.body.status_text, "")
        assert.equal(res.body.open, true)
        assert.property(res.body, "_id")
        assert.property(res.body, "created_on")
        assert.property(res.body, "updated_on")
        done()
      })
  })
  test('Create an issue with missing required fields', (done) => {
    chai
      .request(server)
      .post("/api/issues/spotube")
      .send({
        issue_title: "WaterMelon Sugar",
      })
      .end((_, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.body.error, 'required field(s) missing');
        done()
      })
  })
  test('View issues on a project', (done) => {
    chai
      .request(server)
      .get("/api/issues/spotube")
      .end((_, res) => {
        assert.equal(res.status, 200)
        assert.isArray(res.body);
        done()
      })
  })
  test('View issues on a project with one filter', (done) => {
    chai
      .request(server)
      .get("/api/issues/spotube?open=true")
      .end((_, res) => {
        assert.equal(res.status, 200)
        assert.isArray(res.body);
        assert.equal(res.body.length, 3);
        done()
      })
  })
  test('View issues on a project with multiple filters', (done) => {
    chai
      .request(server)
      .get("/api/issues/spotube?open=true&assigned_to=Me")
      .end((_, res) => {
        assert.equal(res.status, 200)
        assert.isArray(res.body);
        assert.equal(res.body.length, 1);
        done()
      })
  })
  test('Update one field on an issue', (done) => {
    chai
      .request(server)
      .get("/api/issues/spotube")
      .end((_, res) => {
        const _id = res.body[0]._id;
        chai
          .request(server)
          .put("/api/issues/spotube")
          .send({
            _id,
            issue_title: "Slow Grenade"
          })
          .end((_, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.body.result, "successfully updated")
            assert.equal(res.body._id, _id);
            done()
          })
      })
  })
  test('Update multiple fields on an issue', (done) => {
    chai
      .request(server)
      .get("/api/issues/spotube")
      .end((_, res) => {
        const _id = res.body[0]._id;
        chai
          .request(server)
          .put("/api/issues/spotube")
          .send({
            _id,
            issue_text: "Its blowing up",
            created_by: "Lauv",
            open: false
          })
          .end((_, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.body.result, "successfully updated")
            assert.equal(res.body._id, _id);
            done()
          })
      })
  })
  test('Update an issue with missing _id', (done) => {
    chai
      .request(server)
      .put("/api/issues/spotube")
      .send({
        issue_title: "Slow Grenade"
      })
      .end((_, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.body.error, 'missing _id');
        done()
      })
  })
  test('Update an issue with no fields to update', (done) => {
    chai
      .request(server)
      .get("/api/issues/spotube")
      .end((_, res) => {
        const _id = res.body[0]._id;
        chai
          .request(server)
          .put("/api/issues/spotube")
          .send({ _id })
          .end((_, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.body.error, "no update field(s) sent")
            assert.equal(res.body._id, _id);
            done()
          })
      })
  })
  test('Update an issue with an invalid _id', (done) => {
    const _id = "1234i-skdad0a012mu402u412031i3c01v102";
    chai
      .request(server)
      .put("/api/issues/spotube")
      .send({
        _id,
        issue_title: "Dum"
      })
      .end((_, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.body.error, 'could not update');
        assert.equal(res.body._id, _id);
        done()
      })
  })
  test('Delete an issue', (done) => {
    chai
      .request(server)
      .get("/api/issues/spotube")
      .end((_, res) => {
        const _id = res.body[0]._id;
        chai
          .request(server)
          .delete("/api/issues/spotube")
          .send({ _id })
          .end((_, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.body.result, "successfully deleted")
            assert.equal(res.body._id, _id);
            done()
          })
      })
  })
  test('Delete an issue with an invalid _id', (done) => {
    const _id = "1234i-skdad0a012mu402u412031i3c01v102";
    chai
      .request(server)
      .delete("/api/issues/spotube")
      .send({ _id })
      .end((_, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.body.error, 'could not delete');
        assert.equal(res.body._id, _id);
        done()
      })
  })
  test('Delete an issue with missing _id', (done) => {
    chai
      .request(server)
      .delete("/api/issues/spotube")
      .end((_, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.body.error, 'missing _id');
        done()
      })
  })
});
