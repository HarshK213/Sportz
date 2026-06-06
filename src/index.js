import "dotenv/config";
import { env } from "./config/env.js";
import app from "./app.js";

const port = env.PORT;

app.get("/", (req, res) => {
  res.send("Hello from express server");
});

app.listen(port, () => {
  console.log(`Server is running at port: ${port}.`);
});
