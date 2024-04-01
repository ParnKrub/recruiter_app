const {Router} = require("express");
const Test = require("../models/test");
const router = Router();
const {authenticateUser} = require("./auth_middleware");

router.get("/", (req, res) => {
  res.send("this is systems route");
});

router.get("/tests", authenticateUser, async (req, res) => {
  const tests = await Test.find({});
  try {
    res.json(tests);
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
