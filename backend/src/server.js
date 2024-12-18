import express from "express";
import cors from "cors";
import documentsUploadsRouter from "../api/routes/documentsUploads.routes.js";
import documentsRequestsRouter from "../api/routes/documentsRequests.routes.js";
import documentProcessorRouter from "../api/routes/documentProcessor.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

const apiPrefix = "/api/v1";
app.use(apiPrefix, documentsUploadsRouter);
app.use(apiPrefix, documentsRequestsRouter);
app.use(apiPrefix, documentProcessorRouter);

app.use("*", (req, res) => res.status(404).json({ error: "not found (תנסה משהוא אחר אחי)" })); //not defined route

app.use(cors({
    origin: 'http://localhost:3001', // הכתובת בה ה-Frontend שלך רץ
  }));

export default app;
