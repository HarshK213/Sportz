import dotenv from "dotenv";
dotenv.config({
  path: "./src/config/env.js",
});

app.get("/", (req, res) => {
  res.send("Hello from express server");
});

app.listen(port, () => {
  console.log(`Server is running at port: ${port}.`);
});
