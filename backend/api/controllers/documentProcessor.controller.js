// const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1beta3;
// const path = require('path');
// const fs = require('fs');

import { DocumentProcessorServiceClient } from '@google-cloud/documentai'
import path from 'path';
import fs from 'fs';

import multer from 'multer';


const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage }).single('file');

const client = new DocumentProcessorServiceClient();
const projectId = '493999387097';
const location = 'us';
const processorId = '1d6981e46b0d570b';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
export default class DocumentProcessorController {
  static async processDocument(req, res, next) {
    upload(req, res, async (err) => {
      if (err) {
        console.error('Error uploading file:', err);
        return res.status(400).json({ error: 'Error uploading file' });
      }

      try {
        const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

        if (!req.file) {
          throw new Error('No file uploaded.');
        }

        const imageBuffer = req.file.buffer; // קבלת הקובץ בזיכרון
        const encodedImage = imageBuffer.toString('base64');

        const request = {
          name,
          rawDocument: {
            content: encodedImage,
            mimeType: 'application/pdf', // או mimeType של התמונה אם זה JPG, PNG, וכו'
          },
        };

        const [result] = await client.processDocument(request);
        const document = result.document;
        const entities = document.entities;

        const jsonResponse = entities.map((entity) => ({
          key: entity.type,
          value: entity.mentionText,
        }));

        res.json(jsonResponse);
      } catch (error) {
        console.error('Error processing document:', error);
        res.status(500).json({ error: 'Error processing document' });
      }
    });
  
  }
}