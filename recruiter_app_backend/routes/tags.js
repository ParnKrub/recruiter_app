const {Router} = require("express");
const Tag = require("../models/tags");
const {authenticateUser} = require("./auth_middleware");
const router = Router();

router.get("/", (req, res) => {
  res.send("this is systems route");
});

router.get("/tags", async (req, res) => {
  const tags = await Tag.find({});
  res.json(tags);
});

router.get("/tags/:id", async (req, res) => {
  const {id} = req.params;

  try {
    const tag = await Tag.findById(id);
    res.json(tag);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/tags", async (req, res) => {
  const payload = req.body;
  try {
    const tag = new Tag(payload);
    await tag.save();
    res.status(201).end();
  } catch (error) {
    res.status(400).json(error);
  }
});

router.put("/tags/:id", async (req, res) => {
  const payload = req.body;
  const {id} = req.params;

  try {
    const tag = await Tag.findByIdAndUpdate(id, {$set: payload});
    res.json(tag);
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
