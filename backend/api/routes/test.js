const path = require('path');
require('dotenv').config();
console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS); 
const {DocumentProcessorServiceClient} =
  require('@google-cloud/documentai').v1beta3;

//const fs = require('fs');
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


  console.log('File Path:', imagePath);
  console.log('File Exists:', fs.existsSync(imagePath));


  const request = {
    name,
    rawDocument: {
      content: encodedImage,
      mimeType: 'application/pdf',
    },
  };

  // try {
  //   const [result] = await client.processDocument(request);
  //   console.log('Processing result:', result);
  // } catch (error) {
  //   console.error('Full Error:', JSON.stringify(error, null, 2));
  // }



  const [result] = await client.processDocument(request);

  //console.log('Document processing complete.');

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

