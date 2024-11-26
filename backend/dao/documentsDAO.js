// import mongodb from "mongodb";
// const ObjectId = mongodb.ObjectID;

let documents = {};

export default class DocumentsDAO {
  static async injectDB(mongo) {
    const documents_mock = {
      doc1: { docType: "teoudatZeout", misparZeout: 12345, name: "Noam" },
      doc2: {
        docType: "ShaarDira",
        price: 3000,
        date: new Date().toISOString(),
        address: { city: "b7", street: "street name", appartNumber: 5 },
      },
      doc3: {
        docType: "Tlush",
        salary: 10000,
        maasik: "MLoans",
      },
    };

    if (!documents || !Object.keys(documents).length) {
      //documents = await conn.db(process.env.mongoUrl).collection("documents");
      documents = documents_mock;
    }
  }

  static async getAllDocuments() {
    //have to get retrieve from mongo or other db
    return documents;
  }

  static async getDocumentByID(id) {
    if (!documents[id]) return undefined;

    return documents[id];
  }
}
