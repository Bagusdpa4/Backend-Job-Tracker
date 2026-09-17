const express = require("express");
const {
  getAll,
  getById,
  create,
  update,
  remove,
} = require("../controllers/applications.controllers");
const requireAuth = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/applications", getAll);
router.get("/applications/:id", getById);
router.post("/applications", create);
router.put("/applications/:id", update);
router.delete("/applications/:id", remove);

module.exports = router;
