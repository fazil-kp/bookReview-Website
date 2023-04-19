const { render } = require("ejs");
const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Comment = require("../models/comment");
const Genre = require("../models/genre");
const auth = require("../middlewares/auth");

//Get all books
router.get("/", async (req, res) => {
  let books = [];

  if (req.query.search !== null && req.query.search !== "") {
    const reg = new RegExp(req.query.search, "i");
    if (req.query.by && req.query.by !== "All") {
      books = await Book.find({ [req.query.by.toLowerCase()]: reg });
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
    let user = req.session.user;
    res.render("books/index", {
      books: books,
      user: user,
      searchOptions: req.query,
    });
  } else {
    res.redirect("/books");
  }
});

//new book
router.get("/add", [auth], async(req, res) => {
  let user = req.session.user;
  const genres = await Genre.find()
  res.render("books/addBook", { book: new Book(), user: user ,genres:genres});
});

//Create a book
router.post("/", async (req, res) => {
  const book = new Book({
    userId: req.session.user._id,
    title: req.body.title,
    author: req.body.author,
    language: req.body.language,
    coverUrl: req.body.coverUrl,
    description: req.body.description,
    year: req.body.year,
    isbn: req.body.isbn,
    genre: req.body.genre,
    getBook: req.body.getBook,
  });
  try {
    const newBook = await book.save();
    res.redirect("books");
  } catch {
    res.render("books/addBook", {
      book: book,
      errorMessage: "Error creating book.",
    });
  }
});

router.get("/genres", async(req, res) => {
  let user = req.session.user;
  const genres = await Genre.find()
  res.render("books/genres", { book: new Book(), user: user ,genres:genres });
});

router.get("/genres/:genre", async (req, res) => {
  let user = req.session.user;
  const books = await Book.find({ genre: new RegExp(req.params.genre, "i") });
  res.render("books/index", { books: books, user: user });
});

//add comment
router.post("/:id", async (req, res) => {
  const comment = new Comment({
    userId: req.session.user._id,
    bookId: req.params.id,
    comment: req.body.comment,
  });

  try {
    const newComment = await comment.save();
    res.redirect("/books/" + req.params.id);
  } catch {}
});

//delete a comment
router.delete("/comment/:id", async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  const bookId = comment.bookId;
  comment.delete();
  res.redirect("/books/" + bookId);
});

//like a comment
router.post("/like/:id", async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!req.session.user) {
    return res.status(400).send("not signed in");
  }
  const user = comment.likes.find((u) => u == req.session.user._id);
  if (user) {
    const index = comment.likes.indexOf(user);
    comment.likes.splice(index, 1);
    res.send(JSON.stringify({ action: "removed" }));
  } else {
    comment.likes.push(req.session.user._id);
    res.send(JSON.stringify({ action: "liked" }));
  }
  await comment.save();
});

//rate a book
router.post("/rate/:id", async (req, res) => {
  const book = await Book.findById(req.params.id);
  let rating = book.rating.find((u) => u.user == req.session.user._id);

  if (rating) {
    const index = book.rating.indexOf(rating);
    book.rating[index].rate = req.query.star;
  } else {
    rating = {
      user: req.session.user._id,
      rate: req.query.star,
    };
    book.rating.push(rating);
  }
  await book.save();
  res.send("ok");
});

//get book by id
router.get("/:id", async (req, res) => {
  try {
    let user = req.session.user;
    const comments = await Comment.find({ bookId: req.params.id }).populate(
      "userId"
    );
    const book = await Book.findById(req.params.id);
    res.render("books/singleBook", {
      book: book,
      user: user,
      comments: comments,
    });
  } catch {
    res.redirect("/books");
  }
});

//get book to edit
router.get("/:id/edit", [auth], async (req, res) => {
  const genres = await Genre.find()
  try {
    let user = req.session.user;
    const book = await Book.findById(req.params.id);
    res.render("books/editBook", { book: book, user: user,genres:genres});
  } catch {
    res.redirect("/books");
  }
});

//edit a book
router.put("/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        author: req.body.author,
        language: req.body.language,
        coverUrl: req.body.coverUrl,
        description: req.body.description,
        year: req.body.year,
        isbn: req.body.isbn,
        genre: req.body.genre,
        getBook: req.body.getBook,
      },
      { new: true }
    );
    res.redirect(`/books/${book.id}`);
  } catch {
    res.render("books/editBook", { book: book });
  }
});

//delete a book
router.delete("/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    res.redirect("/books");
  } catch {
    res.render("books/index", { books: books });
  }
});

module.exports = router;
