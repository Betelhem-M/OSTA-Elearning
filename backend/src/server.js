require("dotenv").config();

const app = require("./app");
const ensureResearchSchema = require("./config/ensureResearchSchema");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await ensureResearchSchema();

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
