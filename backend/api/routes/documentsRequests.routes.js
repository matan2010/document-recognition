import express from "express";
import DocumentsRequestsController from "../controllers/documentsRequests.controller.js";

const router = express.Router();

//after apiPrefix: /api/v1
router.route("/download").get(DocumentsRequestsController.apiGetAllDocuments);
router.route("/download/document_id/:id").get(DocumentsRequestsController.apiGetDocument);

export default router;

//differnce between req.query.variable and req.body.variable
