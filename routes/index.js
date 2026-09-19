const express = require("express");
const authRouter = require("./auth.routes");
const applicationsRouter = require("./applications.routes"); 
const swaggerUI = require("swagger-ui-express");
const YAML = require("yaml");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const swagger_path = path.resolve(__dirname, "../docs/api-docs.yaml");
const customCssUrl =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css";
const customJs = [
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js",
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js",
];
const file = fs.readFileSync(swagger_path, "utf-8");

// // API Docs
const swaggerDocument = YAML.parse(file);
router.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument, { customCssUrl, customJs }));

router.use("/api/v1", authRouter);
router.use("/api/v1", applicationsRouter);

module.exports = router;