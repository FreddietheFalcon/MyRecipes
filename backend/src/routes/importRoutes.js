import express from "express";
import multer from "multer";
import { importFromUrl, importFromFile, importFromText } from "../controllers/importController.js";
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
      "text/plain",
    ];
    if (allowed.includes(file.mimetype) ||
        file.originalname.toLowerCase().endsWith(".pdf") ||
        file.originalname.toLowerCase().endsWith(".docx") ||
        file.originalname.toLowerCase().endsWith(".txt")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, Word (.docx), and text (.txt) files are supported."));
    }
  },
});

router.use(requireAuth);
router.post("/url", importFromUrl);
router.post("/file", upload.single("file"), importFromFile);
router.post("/text", importFromText);

export default router;
