
const a = 1;
const b = 2;
const sum = a + b;
console.log("Sum:", sum);

const path = require('path');
require('dotenv').config();
const {DocumentProcessorServiceClient} =
  require('@google-cloud/documentai').v1beta3;

const fs = require('fs');
const projectId='493999387097'
const location ='us'
const processorId='1d6981e46b0d570b'

// יצירת קישור ל-API של Google Document AI באמצעות מפתח ה-JSON
const client = new DocumentProcessorServiceClient();

async function processDocument() {
  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
  // נתיב לתמונה שברצונך לשלוח לעיבוד
  //const fileName = './images/image1.jpg'; // השתמש בנתיב לתמונה בתיקיית images
  const imagePath = path.join(__dirname, '..', 'images', 'ID', 'ID1.pdf');

  // קריאת התמונה
  const image = fs.readFileSync(imagePath);
  const encodedImage = image.toString('base64');


  console.log('File Path:', imagePath);
  console.log('File Exists:', fs.existsSync(imagePath));


  // בקשה לעיבוד התמונה
  const request = {
    name,
    rawDocument: {
      content: encodedImage,
      mimeType: 'application/pdf',
    },
  };

  try {
    const [result] = await client.processDocument(request);
    console.log('Processing result:', result);
  } catch (error) {
    console.error('Full Error:', JSON.stringify(error, null, 2));
  }



  const [result] = await client.processDocument(request);

  console.log('Document processing complete.');


  const {document} = result;
  for (const entity of document.entities) {
    // Fields detected. For a full list of fields for each processor see
    // the processor documentation:
    // https://cloud.google.com/document-ai/docs/processors-list
    const key = entity.type;
    // some other value formats in addition to text are availible
    // e.g. dates: `entity.normalizedValue.dateValue.year`
    const textValue =
      entity.textAnchor !== null ? entity.textAnchor.content : '';
    const conf = entity.confidence * 100;
    console.log(
      `* ${JSON.stringify(key)}: ${JSON.stringify(textValue)}(${conf.toFixed(
        2
      )}% confident)`
    );
    }


}

processDocument();

