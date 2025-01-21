import dotenv from "dotenv";
import app from "./server.js";
import DocumentsDAO from "../dao/documentsDAO.js";

dotenv.config();
//const MongoClient = mongodb.MongoClient;

const port = process.env.PORT || 8000;

try {
  // let client = await MongoClient.connect(process.env.mongo_url);
  //await DocumentsDAO.injectDB(client);

  await DocumentsDAO.injectDB();

  app.listen(port, () => {
    console.log(`Listening on port ${port} (see http://localhost:${port}/)`);
  });
} catch (err) {
  console.error(err.stack);
  process.exit(1);
}
