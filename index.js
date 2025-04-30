import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "book-notes",
  password: "123456",
  port: 5432,
});

db.connect();

async function getMyBooks() {
    const result = await db.query("SELECT * FROM works");
    return result.rows;
  }

async function addBook(isbn) {
  try {
    const bookDetails = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:` + isbn + `&jscmd=data&format=json`)
    const bookInfo = Object.values(bookDetails.data)[0]
    const result = await db.query("INSERT INTO works (isbn, title, published, author) VALUES ($1, $2, $3, $4);", [isbn, bookInfo.title, stringToDate(bookInfo.publish_date), bookInfo.authors.map(author => author.name)]);
    const result2 = await db.query("INSERT INTO quotes (isbn, quotes) VALUES ($1, $2);", [isbn, "Click to add"]);
  } catch (error) {
    console.log("No such ISBN: ", error.message)
  }
    
}

function stringToDate(strDate) {
    const date = new Date(strDate);
    // Convert it to PostgreSQL format (YYYY-MM-DD)
    return date.toISOString().split('T')[0]
}

app.get("/", async (req, res) => {
    let myBooks = []; // Declare myBooks outside of try-catch
    try {
        const result = await db.query("SELECT works.id, works.isbn, works.title, works.published, quotes.quotes, quotes.added FROM quotes JOIN works ON quotes.isbn = works.isbn;");
        myBooks = result.rows
        console.log(myBooks)
      } catch (error) {
        console.log("Error", error.message)
      }
      res.render("index.ejs", {books: myBooks})
})

app.post("/add", async (req, res) => {
  const inputISBN = req.body.addISBN
  await addBook(inputISBN)
  res.redirect("/")
})

app.post("/sort", async (req, res) => {
  const sortType = req.body.sort
  console.log(sortType)
  let orderedQuery
  if (sortType == "Title") {
    orderedQuery = "SELECT works.id, works.isbn, works.title, works.published, quotes.quotes, quotes.added FROM quotes JOIN works ON quotes.isbn = works.isbn ORDER BY works.title;"
  } else if (sortType == "Date") {
    orderedQuery = "SELECT works.id, works.isbn, works.title, works.published, quotes.quotes, quotes.added FROM quotes JOIN works ON quotes.isbn = works.isbn ORDER BY quotes.added DESC;"
  }
  let myBooks = []
    try {
        const result = await db.query(orderedQuery);
        myBooks = result.rows
        console.log(myBooks)
      } catch (error) {
        console.log("Error", error.message)
      }
      res.render("index.ejs", {
        books: myBooks,
        selectedSort: sortType
      });
      
})

app.post("/edit", async (req, res) => {
  const inputISBN = req.body.updatedItemISBN
  const inputQuote = req.body.updatedItemQuotes
  await db.query("UPDATE quotes SET quotes = $2 WHERE isbn = $1;", [inputISBN, inputQuote ]);
  res.redirect("/")
})

app.post("/delete", async (req, res) => {
  const inputISBN = req.body.deleteISBN
  await db.query("DELETE FROM works WHERE isbn = $1;", [inputISBN]);
  await db.query("DELETE FROM quotes WHERE isbn = $1;", [inputISBN]);
  res.redirect("/")
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
