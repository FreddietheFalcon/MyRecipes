import express from "express";
import multer from "multer";
import { importFromUrl, importFromFile } from "../controllers/importController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Store file in memory (no disk needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype) ||
        file.originalname.toLowerCase().endsWith(".pdf") ||
        file.originalname.toLowerCase().endsWith(".docx")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and Word (.docx) files are supported."));
    }
  },
});

router.use(requireAuth);
router.post("/url", importFromUrl);
router.post("/file", upload.single("file"), importFromFile);

export default router;
