import DocumentsDAO from "../../dao/documentsDAO.js";

export default class DocumentsRequestsController {
  static async apiGetAllDocuments(req, res, next) {
    try {
      const allDocuments = await DocumentsDAO.getAllDocuments();

      const response = {
        documents: allDocuments,
        totalDocuments: Object.keys(allDocuments).length,
      };

      res.json(response);
    } catch (error) {
      const err = `error in apiGetAllDocuments(): ${JSON.stringify(error.stack)}`;
      console.error(err);

      res.status(500).json({ error: err });
    }
  }

  static async apiGetDocument(req, res, next) {
    try {
      const docID = req.params.id || "";

      const document = await DocumentsDAO.getDocumentByID(docID);

      if (!document) {
        const notFoundResponse = { error: `Document ${docID} not found` };

        res.status(404).json(notFoundResponse);
      } else {
        const response = {
          documents: document,
          totalDocuments: 1,
        };

        res.json(response);
      }
    } catch (error) {
      const err = `error in apiGetDocument(): ${JSON.stringify(error.stack)}`;
      console.error(err);

      res.status(500).json({ error: err });
    }
  }
}
