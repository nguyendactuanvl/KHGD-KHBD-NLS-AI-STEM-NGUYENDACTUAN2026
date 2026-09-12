const express = require("express");
const app = express();
app.use(express.json({ limit: "1kb" }));
app.all("/api", (req, res) => res.json({ok:true}));
app.use("/api", (req, res) => res.status(404).json({error: "Not found"}));
app.use((err, req, res, next) => {
  res.status(413).json({ error: "Caught by error handler" });
});
app.get("*all", (req, res) => res.send("INDEX_HTML"));
app.listen(3002, () => console.log("Started"));
