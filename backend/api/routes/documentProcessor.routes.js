import express from "express";
import DocumentProcessorController from "../controllers/documentProcessor.controller.js";

const router = express.Router();

router.route("/process/document")
  .post(DocumentProcessorController.processDocument);

export default router;
