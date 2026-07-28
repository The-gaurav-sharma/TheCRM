import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, "dist")));

// SPA fallback: send index.html for all non-file routes
app.get("*", (req, res) => {
  // Check if the request is for a file (has an extension)
  if (path.extname(req.path)) {
    res.status(404).send("Not Found");
  } else {
    // Send index.html for all routes so React Router can handle them
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  }
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
