const {Router} = require("express");
const ResearchInvite = require("../models/research_invites");
const User = require("../models/users");
const Research = require("../models/researches");
const router = Router();

router.get("/", (req, res) => {
  res.send("this is research invite route");
});

router.get("/researches/:researchId/invites-requests", async (req, res) => {
  const {researchId} = req.params;
  try {
    const researchInvite = await ResearchInvite.findOne({
      research_id: researchId,
    });
    if (!researchInvite) {
      res
        .status(404)
        .json({
          research_id: researchId,
          volunteer_invite_list: [],
          volunteer_request_list: [],
        });
    } else {
      res.status(200).json(researchInvite);
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/researches/:researchId/invites/:userId", async (req, res) => {
  const {researchId, userId} = req.params;
  try {
    let researchInvite = await ResearchInvite.findById(researchId);
    const user = await User.findById(userId);
    if (researchInvite == null) {
      console.log("creating new research invite");
      researchInvite = new ResearchInvite({
        research_id: researchId,
        volunteer_invite_list: [],
        volunteer_request_list: [],
      });
    }
    if (user.research_involved.some((v) => v.research_id == researchId)) {
      res.status(400).json({message: "User already invited"});
      return;
    }
    researchInvite.volunteer_invite_list.push({
      volunteer_id: userId,
      status: "invited",
    });
    user.research_involved.push({
      research_id: researchId,
      status: "invited",
    });

    console.log(researchInvite);
    console.log(user);

    await researchInvite.save();
    await user.save();
    res.status(200).end();
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/researches/:researchId/requests/:userId", async (req, res) => {
  const {researchId, userId} = req.params;

  try {
    let researchInvite = await ResearchInvite.findById(researchId);
    const user = await User.findById(userId);
    if (researchInvite == null) {
      researchInvite = new ResearchInvite({
        research_id: researchId,
        volunteer_invite_list: [],
        volunteer_request_list: [],
      });
    }
    if (
      researchInvite.volunteer_request_list.some(
        (v) => v.volunteer_id == userId
      )
    ) {
      res.status(400).json({message: "User already requested"});
      return;
    }
    researchInvite.volunteer_request_list.push({
      volunteer_id: userId,
      status: "waiting",
    });
    user.research_involved.push({
      research_id: researchId,
      status: "waiting",
    });
    await researchInvite.save();
    await user.save();
    res.status(200).end();
  } catch (error) {
    res.status(400).json(error);
  }
});

router.put("/researches/:researchId/requests/:userId", async (req, res) => {
  const {researchId, userId} = req.params;
  const status = req.body.status;
  try {
    const researchInvite = await ResearchInvite.findOneAndUpdate(
      {
        research_id: researchId,
        "volunteer_request_list.volunteer_id": userId,
      },
      {
        $set: {"volunteer_request_list.$.status": status},
      }
    );
    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        "research_involved.research_id": researchId,
      },
      {
        $set: {"research_involved.$.status": status},
      }
    );

    if (status === "accepted") {
      const research = await Research.findById(researchId);
      research.participants.push(userId);
      await research.save();
    }

    await researchInvite.save();
    await user.save();
    res.status(200).end();
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
