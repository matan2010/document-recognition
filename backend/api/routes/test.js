const path = require('path');
require('dotenv').config();
const {DocumentProcessorServiceClient} =
  require('@google-cloud/documentai').v1beta3;

const fs = require('fs');
const projectId='493999387097'
const location ='us'
const processorId='1d6981e46b0d570b'


const client = new DocumentProcessorServiceClient();

async function processDocument() {
  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
  
  const imagePath = path.join(__dirname, '..', 'images', 'ID', 'ID1.pdf');

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

  const jsonResponse = entities.map(entity => {
    return {
      key: entity.type,         
      value: entity.mentionText 
    };
  });
  return jsonResponse;

}

processDocument();

