const {Router} = require("express");
const Research = require("../models/researches");
const User = require("../models/users");
const {authenticateUser} = require("./auth_middleware");
const ResearchInvite = require("../models/research_invites");
const router = Router();

router.get("/", (req, res) => {
  res.send("this is systems route");
});

router.get("/researches", async (req, res) => {
  const researches = await Research.find({});
  res.json(researches);
});

router.get("/researches/:id", async (req, res) => {
  const {id} = req.params;

  try {
    const research = await Research.findById(id);
    res.json(research);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/researches/user/:id", async (req, res) => {
  const {id} = req.params;

  try {
    const research = await Research.find({author_user_id: id});
    res.json(research);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/researches", async (req, res) => {
  const payload = req.body;
  try {
    const research = new Research(payload);
    await research.save();
    res.status(201).end();
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/researches/:researchId/announcements", async (req, res) => {
  const {researchId} = req.params;
  const payload = req.body.announcement;

  try {
    const research = await Research.findById(researchId);
    research.announcements_list.push({announcement: payload, date: Date.now()});
    await research.save();
    res.status(201).end();
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post(
  "/researches/:researchId/add-participant/:userId",
  async (req, res) => {
    const {researchId, userId} = req.params;

    try {
      const research = await Research.findById(researchId);
      if (research.participants.includes(userId)) {
        return res.status(400).json({error: "User already applied"});
      }
      research.participants.push(userId);
      const user = await User.findOneAndUpdate(
        {_id: userId, "research_involved.research_id": researchId},
        {$set: {"research_involved.$.status": "accepted"}}
      );
      const research_invite = await ResearchInvite.findOneAndUpdate(
        {
          research_id: researchId,
          "volunteer_request_list.volunteer_id": userId,
        },
        {$set: {"volunteer_request_list.$.status": "accepted"}}
      );
      await research_invite.save();
      await user.save();
      await research.save();
      res.json(research);
    } catch (error) {
      res.status(400).json(error);
    }
  }
);

router.post(
  "/researches/:researchId/update-status/:userId",
  async (req, res) => {
    const {researchId, userId} = req.params;
    const status = req.body.status;
    try {
      const user = await User.findOneAndUpdate(
        {_id: userId, "research_involved.research_id": researchId},
        {$set: {"research_involved.$.status": status}}
      );
      const research_invite = await ResearchInvite.findOneAndUpdate(
        {
          research_id: researchId,
          "volunteer_request_list.volunteer_id": userId,
        },
        {$set: {"volunteer_request_list.$.status": status}}
      );
      await research_invite.save();
      await user.save();
      res.status(201).end();
    } catch (error) {
      res.status(400).json(error);
    }
  }
);

router.post("/researches/:researchId/message/:userId", async (req, res) => {
  const {researchId, userId} = req.params;
  const payload = req.body.message;
  try {
    const user = await User.findById(userId);
    user.research_involved.forEach((research) => {
      console.log(research.research_id.toString());
      if (research.research_id.toString() === researchId) {
        research.message_list.push({message: payload, date: Date.now()});
      }
    });
    await user.save();
    res.status(201).end();
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.put("/researches/:id", async (req, res) => {
  const payload = req.body;
  const {id} = req.params;

  try {
    const research = await Research.findByIdAndUpdate(id, {$set: payload});
    res.json(research);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/researches/:researchId/apply/:userId", async (req, res) => {
  const {researchId, userId} = req.params;
  try {
    const research = await Research.findById(researchId);
    if (research.participants.includes(userId)) {
      return res.status(200).json({message: "User already applied"});
    }
    return res.status(400).json({message: "User not applied"});
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/researches/:userId/joined", async (req, res) => {
  const {userId} = req.params;
  try {
    const user = await User.findById(userId);
    const research_list = user.research_involved;
    const researches = [];
    for (let i = 0; i < research_list.length; i++) {
      const research = await Research.findById(research_list[i].research_id);
      research.status = research_list[i].status;
      researches.push(research);
    }
    res.json(researches);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/researches/:researchId/users_recommendation", async (req, res) => {
  const {researchId} = req.params;
  try {
    const research = await Research.findById(researchId);
    const researchTags = research.tags;
    const researchTagsCleaned = researchTags.map((tag) => tag.name);
    const researchGender = research.gender;
    myAggregate = [
      {
        $addFields: {
          score: {
            $sum: [
              {$size: {$setIntersection: ["$tags", researchTagsCleaned]}},
              //? If user is in gender requirement, add 1 to the score
              {
                $cond: [
                  {
                    $or: [
                      {$eq: ["$gender", "all"]},
                      {$eq: ["$gender", researchGender]},
                    ],
                  },
                  1,
                  0,
                ],
              },
            ],
          },
        },
      },
      {
        $sort: {
          score: -1,
        },
      },
      {
        $project: {
          score: 0,
          password: 0,
        },
      },
    ];
    const result = await User.aggregate(myAggregate).limit(10);
    res.json(result);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/researches/:userId/joined/announcements", async (req, res) => {
  const {userId} = req.params;
  try {
    const user = await User.findById(userId);
    const research_list = user.research_involved;
    const researches = [];
    for (let i = 0; i < research_list.length; i++) {
      const research = await Research.findById(research_list[i].research_id);
      research.status = research_list[i].status;
      researches.push(research);
    }
    const announcementList = [];
    researches.map((research) => {
      research.announcements_list.forEach((announcement) => {
        announcementList.push({
          announcement: announcement.announcement,
          date: announcement.date,
          research_title: research.title,
        });
      });
    });
    res.json(announcementList.sort((a, b) => b.date - a.date));
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
