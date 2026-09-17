const express = require("express");
const authRouter = require("./auth.routes");
const applicationsRouter = require("./applications.routes"); 

const router = express.Router();

router.use("/api/v1", authRouter);
router.use("/api/v1", applicationsRouter);

module.exports = router;