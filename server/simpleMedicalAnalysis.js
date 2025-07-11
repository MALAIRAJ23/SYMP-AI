const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

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

function generateMedicalAdvice(symptoms, conditions) {
  const advice = [];
  
  if (symptoms && symptoms.includes('chest pain') || symptoms && symptoms.includes('shortness of breath')) {
    advice.push('⚠️ Seek immediate medical attention - chest pain and breathing difficulties can be serious');
  }
  
  if (symptoms && symptoms.includes('fever') && symptoms.includes('headache')) {
    advice.push('Consider consulting a doctor - fever with headache may indicate infection');
  }
  
  if (conditions && conditions.some(c => c && c.condition && (c.condition.includes('anxiety') || c.condition.includes('depression')))) {
    advice.push('Mental health symptoms should be discussed with a healthcare professional');
  }
  
  // Add specific doctor recommendations for high confidence conditions
  if (conditions && conditions.some(c => c && c.confidence > 35)) {
    advice.push('High confidence match detected - consider consulting a specialist for proper diagnosis');
  }
  
  if (!symptoms || symptoms.length === 0) {
    advice.push('No specific symptoms detected. Please describe your symptoms in more detail.');
  }
  
  return advice;
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
    
    // Generate medical advice
    const medicalAdvice = generateMedicalAdvice(extractedSymptoms, sortedConditions);
    
    const result = {
      inputSymptoms: symptoms,
      extractedSymptoms: extractedSymptoms,
      potentialConditions: sortedConditions.map(([condition, score]) => ({
        condition: condition.replace(/_/g, ' '),
        confidence: Math.round(score),
        symptoms: MEDICAL_CONDITIONS[condition]
      })),
      aiAnalysis: 'Symptom analysis completed using medical knowledge base',
      recommendations: [
        'This analysis is for informational purposes only',
        'Please consult with a healthcare professional for accurate diagnosis',
        'Seek immediate medical attention for severe symptoms',
        'Monitor your symptoms and report any changes to your doctor',
        ...medicalAdvice
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

const PORT = 5003;
app.listen(PORT, () => {
  console.log(`Simple Medical Analysis server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
}); 