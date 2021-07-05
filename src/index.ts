import express from "express";
import connectDB from "./loader/db";
import path from "path";

const app = express();
const apidocPath = path.join(__dirname, "../apidoc");

// Connect Database
connectDB();

app.use(express.json());

app.use("/apidoc", express.static(apidocPath));

app.use("/api/signup", require("./api/auth"));
app.use("/api/signin", require("./api/user"));
app.use("/api/home", require("./api/home"));
app.use("/api/courses", require("./api/course"));
// app.use("/api/message", require("./controller/messageController"));
app.use("/api/writeSmallSatisfaction", require("./api/writeSmallSatisfaction"));

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "production" ? err : {};

  
  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
  res.render("error");
  
});

app
  .listen(5000, () => {
    console.log(`
    ################################################
    🛡️  Server listening on port: 5000 🛡️
    ################################################
  `);
  })
  .on("error", (err) => {
    console.error(err);
    process.exit(1);
  });
