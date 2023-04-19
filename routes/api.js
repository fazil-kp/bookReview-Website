const express = require("express");
const Book = require("../models/book");

const router = express.Router();

router.get("/auto-complete", async (req, res) => {
  let books = [];
  if (req.query.search !== null && req.query.search !== "") {
    const reg = new RegExp(req.query.search, "i");

    if (req.query.by && req.query.by !== "All") {
      books = await Book.find({ [req.query.by.toLowerCase()]: reg }, null, {
        limit: 10,
      });
    } else {
      books = await Book.find({
        $or: [
          { title: reg },
          { genre: reg },
          { author: reg },
          { language: reg },
        ],
      });
    }
  }
  res.send(books);
});

module.exports = router;
