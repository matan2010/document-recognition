import express from "express";
import DocumentsUploadsController from "../controllers/documentsUploads.controller.js";

const router = express.Router();

//after apiPrefix: /api/v1

router
  .route("/upload/document_id/:id")
  .post(DocumentsUploadsController.insertNewDocument)
  .put(DocumentsUploadsController.updateDocument)
  .delete(DocumentsUploadsController.deleteDocument);

export default router;

//differnce between req.query.variable and req.body.variable
