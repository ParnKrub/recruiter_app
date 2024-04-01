const {Router} = require("express");
const User = require("../models/users");
const Research = require("../models/researches");
const router = Router();

router.get("/", (req, res) => {
  res.send("this is systems route");
});

router.get("/users", async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

router.get("/users/:id", async (req, res) => {
  const {id} = req.params;
  try {
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.put("/users/:id", async (req, res) => {
  const {id} = req.params;
  const payload = req.body;
  try {
    const user = await User.findByIdAndUpdate(id, {$set: payload});
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/users/:userId/message/:researchId", async (req, res) => {
  const {userId, researchId} = req.params;
  const {message} = req.body;
  try {
    const research = await Research.findById(researchId);
    research.message_list.push({
      message: message,
      user_id: userId,
      date: Date.now(),
    });
    await research.save();
    res.status(201).end();
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/users/:userId/messages", async (req, res) => {
  const {userId} = req.params;
  try {
    const user = await User.findById(userId);
    const messages = [];
    user.research_involved.forEach((research) => {
      research.message_list.forEach((message) => {
        messages.push({
          research_id: research.research_id,
          message: message.message,
          date: message.date,
        });
      });
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
