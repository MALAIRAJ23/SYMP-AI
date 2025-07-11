const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const HF_API_TOKEN = "REMOVED";

// Medical symptom keywords for analysis
const MEDICAL_SYMPTOMS = [
  'fever', 'headache', 'cough', 'fatigue', 'nausea', 'vomiting', 'diarrhea',
  'chest pain', 'shortness of breath', 'dizziness', 'joint pain', 'muscle pain',
  'abdominal pain', 'back pain', 'sore throat', 'runny nose', 'congestion',
  'loss of appetite', 'weight loss', 'insomnia', 'anxiety', 'depression',
  'rash', 'itching', 'swelling', 'bruising', 'bleeding', 'numbness',
  'tingling', 'weakness', 'paralysis', 'seizures', 'confusion', 'memory loss'
];

// Common medical conditions and their associated symptoms
const MEDICAL_CONDITIONS = {
  'common_cold': ['runny nose', 'congestion', 'sore throat', 'cough', 'fatigue'],
  'flu': ['fever', 'headache', 'muscle pain', 'fatigue', 'cough', 'sore throat'],
  'migraine': ['headache', 'nausea', 'sensitivity to light', 'dizziness'],
  'anxiety': ['anxiety', 'insomnia', 'fatigue', 'dizziness', 'shortness of breath'],
  'depression': ['depression', 'fatigue', 'insomnia', 'loss of appetite', 'weight loss'],
  'gastroenteritis': ['nausea', 'vomiting', 'diarrhea', 'abdominal pain', 'fever'],
  'hypertension': ['headache', 'dizziness', 'chest pain', 'shortness of breath'],
  'diabetes': ['fatigue', 'weight loss', 'increased thirst', 'frequent urination']
};

function extractSymptoms(text) {
  const lowerText = text.toLowerCase();
  const foundSymptoms = MEDICAL_SYMPTOMS.filter(symptom => 
    lowerText.includes(symptom)
  );
  return foundSymptoms;
}

function analyzeSymptoms(symptoms) {
  const scores = {};
  
  for (const [condition, conditionSymptoms] of Object.entries(MEDICAL_CONDITIONS)) {
    let score = 0;
    for (const symptom of symptoms) {
      if (conditionSymptoms.includes(symptom)) {
        score += 1;
      }
    }
    if (score > 0) {
      scores[condition] = (score / conditionSymptoms.length) * 100;
    }
  }
  
  return scores;
}

app.post('/analyze', async (req, res) => {
  const { symptoms } = req.body;
  
  if (!symptoms || symptoms.trim() === '') {
    return res.status(400).json({ error: 'Symptoms text is required' });
  }

  try {
    // Extract symptoms from text
    const extractedSymptoms = extractSymptoms(symptoms);
    
    // Analyze for potential conditions
    const conditionScores = analyzeSymptoms(extractedSymptoms);
    
    // Sort conditions by score
    const sortedConditions = Object.entries(conditionScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3); // Top 3 matches
    
    // Use a text generation model for medical analysis
    const medicalPrompt = `Based on these symptoms: "${symptoms}", provide a brief medical analysis and potential considerations.`;
    
    let bertAnalysis = 'AI analysis not available';
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium`,
        {
          headers: {
            Authorization: `Bearer ${HF_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ 
            inputs: medicalPrompt,
            parameters: {
              max_length: 100,
              temperature: 0.7,
              do_sample: true,
              return_full_text: false
            }
          }),
        }
      );
      
      if (response.ok) {
        const bertResult = await response.json();
        bertAnalysis = bertResult[0]?.generated_text || 'Analysis completed';
      } else {
        console.log('HuggingFace API response not ok:', response.status);
        bertAnalysis = 'AI analysis temporarily unavailable';
      }
    } catch (bertError) {
      console.log('BERT API error:', bertError.message);
      bertAnalysis = 'AI analysis temporarily unavailable';
    }
    
    const result = {
      inputSymptoms: symptoms,
      extractedSymptoms: extractedSymptoms,
      potentialConditions: sortedConditions.map(([condition, score]) => ({
        condition: condition.replace(/_/g, ' '),
        confidence: Math.round(score),
        symptoms: MEDICAL_CONDITIONS[condition]
      })),
      bertAnalysis: bertAnalysis,
      recommendations: [
        'This analysis is for informational purposes only',
        'Please consult with a healthcare professional for accurate diagnosis',
        'Seek immediate medical attention for severe symptoms',
        'Monitor your symptoms and report any changes to your doctor'
      ],
      timestamp: new Date().toISOString()
    };
    
    res.json(result);
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ 
      error: 'Failed to analyze symptoms',
      details: err.toString() 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    availableSymptoms: MEDICAL_SYMPTOMS.length,
    availableConditions: Object.keys(MEDICAL_CONDITIONS).length
  });
});

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`BERT Medical Analysis server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
}); 