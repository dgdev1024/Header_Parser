///
/// \file   main.js
/// \brief  The main entry point for our program.
///

// Imports
const Path          = require("path");
const Express       = require("express");
const BodyParser    = require("body-parser");
const HeaderParser  = require("./source/parse.js");

// Express
const App           = Express();

// Body Parser Middleware
App.use(BodyParser.json());
App.use(BodyParser.urlencoded({ extended: true }));

// Static Files
App.use(Express.static(Path.join(__dirname, "public")));

// Who Am I?
App.get("/whoami", (req, res) => {
    res.json(HeaderParser(req));
})

// Index Route
App.get("/", (req, res) => {
    res.sendFile("index.html");
});

// Listen
const Port = process.env.PORT || 3000;
const Server = App.listen(Port, () => {
    console.log(`Listening on Port #${Port}`);
});