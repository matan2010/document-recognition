# Israeli ID Card OCR Testing Guide

## Environment Setup

### Required Environment Variables
```env
USE_GOOGLE_OCR=true
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_CLIENT_EMAIL=your-service-account-email
GOOGLE_PRIVATE_KEY=your-private-key
GOOGLE_DOCUMENT_AI_LOCATION=us
GOOGLE_DOCUMENT_AI_PROCESSOR_ID=your-processor-id
```

## Test Cases for Israeli ID Cards

### 1. Upload ID Card Image
```http
POST {{BASE_URL}}/documents
Authorization: Bearer {{JWT_TOKEN}}
Content-Type: multipart/form-data

Form Data:
- file: [select Israeli ID card image]
- title: "Israeli ID Test"
- clientId: {{CLIENT_ID}}
```

Expected Fields to Extract:
- ID Number (מספר זהות)
- Full Name (שם מלא)
- Date of Birth (תאריך לידה)
- Place of Birth (מקום לידה)
- Issue Date (תאריך הנפקה)

### 2. Verify OCR Results
```http
GET {{BASE_URL}}/documents/{{document_id}}
Authorization: Bearer {{JWT_TOKEN}}
```

Expected Response Structure:
```json
{
    "id": "document-id",
    "status": "COMPLETED",
    "content": "Extracted text...",
    "metadata": {
        "confidence": 0.95,
        "processedAt": "2024-12-18T21:16:33.000Z",
        "documentType": "ID_CARD",
        "fields": {
            "idNumber": {
                "value": "123456789",
                "confidence": 0.98
            },
            "fullName": {
                "value": "ישראל ישראלי",
                "confidence": 0.97
            },
            "dateOfBirth": {
                "value": "01/01/1990",
                "confidence": 0.96
            },
            "placeOfBirth": {
                "value": "ישראל",
                "confidence": 0.95
            },
            "issueDate": {
                "value": "01/01/2020",
                "confidence": 0.97
            }
        }
    }
}
```

## Best Practices for ID Card Images

1. Image Quality:
   - Resolution: Minimum 300 DPI
   - Format: JPG or PNG
   - Size: Keep under 5MB
   - Lighting: Even lighting, no glare

2. Image Positioning:
   - Align card straight
   - Include all corners
   - Avoid shadows
   - No background clutter

3. Multiple Samples:
   - Test with both old and new ID card formats
   - Test with different lighting conditions
   - Test with various image qualities

## Testing Scenarios

### 1. Basic Recognition
1. Upload clear, well-lit ID card image
2. Verify all fields are extracted correctly
3. Check confidence scores (should be >0.9)

### 2. Edge Cases
1. Test with:
   - Slightly blurred images
   - Different angles
   - Partial shadows
   - Glare on plastic cover
   - Older ID card format

### 3. Error Cases
1. Test with:
   - Very low quality images
   - Heavily skewed images
   - Partially cropped cards
   - Non-ID card images

## Validation Rules

### Field Validations
1. ID Number:
   - 9 digits
   - Valid checksum
   - Clear visibility

2. Name:
   - Hebrew characters
   - No missing parts
   - Proper spacing

3. Dates:
   - Valid format (DD/MM/YYYY)
   - Logical values
   - Clear visibility

## Troubleshooting

### Common Issues

1. Low Confidence Scores:
   - Check image quality
   - Verify lighting conditions
   - Ensure proper alignment

2. Missing Fields:
   - Verify field visibility
   - Check for glare/shadows
   - Ensure complete card is visible

3. Processing Errors:
   - Verify credentials
   - Check file format
   - Ensure network connectivity

### Quality Improvement Tips

1. Image Preparation:
   - Use scanner if possible
   - Clean card surface
   - Remove protective covers
   - Use neutral background

2. Camera Settings:
   - Use macro mode for close-ups
   - Enable HDR if available
   - Use sufficient lighting
   - Avoid flash if possible

## Security Considerations

1. Data Handling:
   - Mask sensitive data in logs
   - Implement proper access controls
   - Delete processed images after use

2. Storage:
   - Encrypt stored data
   - Implement retention policies
   - Control access permissions

## Monitoring

### Key Metrics to Track

1. Recognition Rates:
   - Success rate per field
   - Overall confidence scores
   - Processing time

2. Error Rates:
   - Failed recognitions
   - Invalid field values
   - Processing timeouts

3. Quality Metrics:
   - Image quality scores
   - Field confidence distribution
   - Processing duration
