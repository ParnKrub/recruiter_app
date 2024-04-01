const {Router} = require("express");
const Tag = require("../models/tags");
const User = require("../models/users");
const Research = require("../models/researches");
const {authenticateUser} = require("./auth_middleware");
const router = Router();

//* Search for a tag
router.get("/search/tag", async (req, res) => {
  const query = req.query.q;
  if (!query) {
    res.status(400).json({message: "Missing query parameter `q`"});
  } else {
    const newQuery = decodeURIComponent((query + "").replace(/\+/g, "%20"));
    try {
      const result = await Tag.find({name: {$regex: newQuery, $options: "i"}});
      res.json(result);
    } catch (error) {
      res.status(400).json(error);
    }
  }
});

router.get("/search/tagid", async (req, res) => {
  const query = req.query.q;
  if (!query) {
    res.status(400).json({message: "Missing query parameter `q`"});
  } else {
    const newQuery = decodeURIComponent((query + "").replace(/\+/g, "%20"));
    try {
      const result = await Tag.find({name: {$regex: newQuery, $options: "i"}});
      res.json(result[0]._id);
    } catch (error) {
      res.status(400).json(error);
    }
  }
});

//* Search for a research from tags and query
router.get("/search/research", async (req, res) => {
  let sort = "newest";
  const query = req.query.q;
  const tags = req.query.t;
  const userId = req.query.u;
  let queryObject = {};
  if (req.query.sort) {
    sort = req.query.sort;
  }
  try {
    let newQuery = "";
    let tagsCleaned = [];

    if (query || tags) {
      if (query) {
        newQuery = decodeURIComponent((query + "").replace(/\+/g, "%20"));
      }
      console.log(newQuery);
      if (tags) {
        tagsCleaned = decodeURIComponent(
          (tags + "").replace(/\+/g, "%20")
        ).split(",");
      }
      if (query && tags) {
        queryObject = {
          $and: [
            {
              $or: [{title: {$regex: newQuery, $options: "i"}}],
            },
            {
              tags: {
                $all: tagsCleaned,
              },
            },
          ],
        };
      } else if (!query) {
        queryObject = {
          tags: {
            $all: tagsCleaned,
          },
        };
      } else if (!tags) {
        queryObject = {
          $or: [{title: {$regex: newQuery, $options: "i"}}],
        };
      }
    } else {
      queryObject = {};
    }

    let mySort;
    let myAggregate;

    if (sort === "newest") {
      mySort = {createdAt: -1};
    } else if (sort === "oldest") {
      mySort = {createdAt: 1};
    } else if (sort === "recommended") {
      const user = await User.findById(userId);
      const userTags = user.tags;
      const userTagsCleaned = userTags.map((tag) => tag.toString());
      //? Calculate user age in years
      const userAge = Math.floor(
        (Date.now() - user.date_of_birth) / 31557600000
      );
      const userGender = user.gender;
      myAggregate = [
        {
          $addFields: {
            score: {
              $sum: [
                {$size: {$setIntersection: ["$tags", userTagsCleaned]}},
                {
                  //? If the user is in the age range, add 1 to the score
                  $cond: [
                    {
                      $and: [
                        {$lte: [{$toInt: "$min_age"}, userAge]},
                        {$gte: [{$toInt: "$max_age"}, userAge]},
                      ],
                    },
                    1,
                    0,
                  ],
                },
                //? If user is in gender requirement, add 1 to the score
                {
                  $cond: [
                    {
                      $or: [
                        {$eq: ["$gender", "all"]},
                        {$eq: ["$gender", userGender]},
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
          },
        },
      ];
    }

    let result;

    console.log(myAggregate);
    if (sort === "recommended" && queryObject != {}) {
      result = await Research.aggregate(myAggregate);
    } else if (sort === "recommended") {
      result = await Research.find(queryObject).aggregate(myAggregate);
    } else {
      result = await Research.find(queryObject).sort(mySort);
    }
    res.json(result);
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
