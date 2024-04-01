const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");

const TagRouter = require("./routes/tags");
const SearchRouter = require("./routes/search");
const ResearchRouter = require("./routes/researches");
const AuthRouter = require("./routes/auth");
const UserRouter = require("./routes/users");
const ResearchInviteRouter = require("./routes/research_invite");

// set up environment variables for MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/RecruiterApp";
const PORT = process.env.PORT || 9000;

// connect to MongoDB
mongoose.connect(MONGODB_URI);
mongoose.connection.on("error", (err) => {
  console.error("MongoDB error", err);
});

app.use(express.json());
app.use(cors());
app.use(TagRouter);
app.use(SearchRouter);
app.use(ResearchRouter);
app.use(AuthRouter);
app.use(UserRouter);
app.use(ResearchInviteRouter);

app.listen(PORT, () => {
  console.log(`Application is running on port ${PORT}`);
});
