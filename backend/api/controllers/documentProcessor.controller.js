// const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1beta3;
// const path = require('path');
// const fs = require('fs');

import { DocumentProcessorServiceClient } from '@google-cloud/documentai'
import path from 'path';
import fs from 'fs';

const client = new DocumentProcessorServiceClient();
const projectId = '493999387097';
const location = 'us';
const processorId = '1d6981e46b0d570b';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
export default class DocumentProcessorController {
  static async processDocument(req, res, next) {
    try {
      
      const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
      const imagePath = 'C:/Users/matan/Desktop/Final Project/document-recognition/backend/api/images/ID/ID1.pdf';

      console.log('Image path:', imagePath)
      if (!fs.existsSync(imagePath)) {
        throw new Error(`File not found at ${imagePath}`);
      }
      const image = fs.readFileSync(imagePath);
      const encodedImage = image.toString('base64');
    
      const request = {
        name,
        rawDocument: {
          content: encodedImage,
          mimeType: 'application/pdf',
        },
      };

      const [result] = await client.processDocument(request);
      const document = result.document;
      const entities = document.entities;

      const jsonResponse = entities.map((entity) => {
        return {
          key: entity.type,
          value: entity.mentionText,
        };
      });

      res.json(jsonResponse);
    } catch (error) {
      console.error('Error processing document:', error);
      res.status(500).json({ error: 'Error processing document' });
    }
  }
}