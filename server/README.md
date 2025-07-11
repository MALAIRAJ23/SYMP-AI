# Medical Symptom Checker - Backend Servers

This directory contains the backend servers for the medical symptom checker application.

## 🚀 Quick Start

### Option 1: Start both servers at once
```bash
npm run start-all
```

### Option 2: Start servers individually
```bash
# Start the original proxy server (port 5001)
npm run proxy

# Start the BERT analysis server (port 5002)
npm run bert
```

## 📋 Server Details

### 1. Original Proxy Server (Port 5001)
- **File:** `hfProxy.js`
- **Purpose:** General HuggingFace model proxy
- **Endpoint:** `POST /predict`
- **Usage:** General model inference

### 2. BERT Medical Analysis Server (Port 5002)
- **File:** `bertMedicalAnalysis.js`
- **Purpose:** Medical symptom analysis using BERT
- **Endpoint:** `POST /analyze`
- **Features:**
  - Symptom extraction from natural language
  - Medical condition matching
  - BERT-based text analysis
  - Confidence scoring
  - Medical recommendations

## 🔧 API Endpoints

### BERT Analysis Server (`http://localhost:5002`)

#### POST `/analyze`
Analyzes symptoms and provides medical insights.

**Request:**
```json
{
  "symptoms": "I have a headache and feel dizzy"
}
```

**Response:**
```json
{
  "inputSymptoms": "I have a headache and feel dizzy",
  "extractedSymptoms": ["headache", "dizziness"],
  "potentialConditions": [
    {
      "condition": "migraine",
      "confidence": 75,
      "symptoms": ["headache", "nausea", "sensitivity to light", "dizziness"]
    }
  ],
  "bertAnalysis": "Analysis text from BERT model...",
  "recommendations": [
    "This analysis is for informational purposes only",
    "Please consult with a healthcare professional for accurate diagnosis"
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "availableSymptoms": 32,
  "availableConditions": 8
}
```

## 🧠 Medical Analysis Features

### Symptom Detection
The system recognizes 32 common medical symptoms including:
- fever, headache, cough, fatigue
- nausea, vomiting, diarrhea
- chest pain, shortness of breath
- dizziness, joint pain, muscle pain
- and many more...

### Condition Matching
Matches symptoms against 8 common medical conditions:
- common cold, flu, migraine
- anxiety, depression
- gastroenteritis, hypertension, diabetes

### BERT Integration
Uses the [BERT base uncased model](https://huggingface.co/google-bert/bert-base-uncased) for:
- Natural language understanding
- Medical text analysis
- Context-aware symptom interpretation

## 🔒 Security Notes

- API tokens are stored in the server files (should be moved to environment variables in production)
- CORS is enabled for frontend communication
- Input validation is implemented
- Error handling with detailed logging

## 🚨 Important Disclaimers

⚠️ **Medical Disclaimer:**
- This system is for informational purposes only
- Not a substitute for professional medical advice
- Always consult healthcare professionals for diagnosis
- Results should not be used for self-diagnosis

## 🔧 Configuration

### Environment Variables (Recommended)
Create a `.env` file:
```
HF_API_TOKEN=your_huggingface_token_here
PORT_1=5001
PORT_2=5002
```

### HuggingFace Model
The system uses the BERT base uncased model. You can modify the model path in `bertMedicalAnalysis.js`:
```javascript
const MODEL_PATH = "google-bert/bert-base-uncased";
```

## 🐛 Troubleshooting

### Common Issues:

1. **Port already in use:**
   ```bash
   # Check what's using the port
   netstat -ano | findstr :5001
   netstat -ano | findstr :5002
   ```

2. **HuggingFace API errors:**
   - Verify your API token is valid
   - Check the model path is correct
   - Ensure you have sufficient API credits

3. **CORS errors:**
   - Verify the frontend is running on the expected port
   - Check that CORS is properly configured

### Logs
Check the console output for detailed error messages and debugging information. 