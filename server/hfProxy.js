const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
app.use(express.json());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : {}));

const HF_API_TOKEN = process.env.HUGGINGFACE_API_KEY || '';

// For medical symptom analysis, we'll use a text classification approach
// You can replace this with a specific medical model when available
const MODEL_PATH = "microsoft/DialoGPT-medium"; // Placeholder - replace with medical model

const MEDICAL_SYMPTOMS = [
  'fever', 'headache', 'cough', 'fatigue', 'nausea', 'vomiting', 'diarrhea',
  'chest pain', 'shortness of breath', 'dizziness', 'joint pain', 'muscle pain',
  'abdominal pain', 'back pain', 'sore throat', 'runny nose', 'congestion',
  'loss of appetite', 'weight loss', 'insomnia', 'anxiety', 'depression'
];

const MEDICAL_CONDITIONS = {
  'common_cold': ['runny nose', 'congestion', 'sore throat', 'cough', 'fatigue'],
  'flu': ['fever', 'headache', 'muscle pain', 'fatigue', 'cough', 'sore throat'],
  'migraine': ['headache', 'nausea', 'dizziness'],
  'anxiety': ['anxiety', 'insomnia', 'fatigue', 'dizziness', 'shortness of breath'],
  'depression': ['depression', 'fatigue', 'insomnia', 'loss of appetite', 'weight loss'],
  'gastroenteritis': ['nausea', 'vomiting', 'diarrhea', 'abdominal pain', 'fever'],
  'hypertension': ['headache', 'dizziness', 'chest pain', 'shortness of breath']
};

const extractSymptoms = (text) => {
  const lower = (text || '').toLowerCase();
  return MEDICAL_SYMPTOMS.filter((symptom) => lower.includes(symptom));
};

const getPotentialConditions = (extractedSymptoms) => {
  const scores = Object.entries(MEDICAL_CONDITIONS)
    .map(([condition, symptoms]) => {
      const hits = extractedSymptoms.filter((s) => symptoms.includes(s)).length;
      if (!hits) return null;
      return {
        condition: condition.replace(/_/g, ' '),
        confidence: Math.round((hits / symptoms.length) * 100),
        symptoms
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  return scores;
};

const openRouterProxy = require('./openRouterProxy');
app.use(openRouterProxy);

const buildFallbackAnalysis = (symptoms, reason = 'AI service unavailable') => {
  const lower = symptoms.toLowerCase();
  const extractedSymptoms = extractSymptoms(symptoms);
  const potentialConditions = getPotentialConditions(extractedSymptoms);
  const hints = [];

  if (lower.includes('fever')) hints.push('Possible infection-related symptoms.');
  if (lower.includes('cough') || lower.includes('throat')) hints.push('Respiratory irritation may be present.');
  if (lower.includes('headache')) hints.push('Could be tension, dehydration, or viral illness related.');
  if (lower.includes('chest pain') || lower.includes('breath')) hints.push('Urgent evaluation may be needed if severe.');

  const summary = hints.length
    ? hints.join(' ')
    : 'General symptoms detected. A clinician can provide a reliable diagnosis.';

  return {
    symptoms,
    extractedSymptoms,
    potentialConditions,
    aiAnalysis: `${summary} (${reason})`,
    confidence: 0.45,
    recommendations: [
      'Please consult with a healthcare professional for accurate diagnosis',
      'Seek urgent care immediately for severe chest pain, breathing difficulty, or confusion',
      'Monitor symptoms and hydration, and rest adequately'
    ],
    source: 'fallback',
    timestamp: new Date().toISOString()
  };
};

const runSymptomAnalysis = async (symptoms) => {
  if (!HF_API_TOKEN) {
    return buildFallbackAnalysis(symptoms, 'Missing HUGGINGFACE_API_KEY');
  }

  // Format the symptoms for analysis
  const formattedSymptoms = `Patient symptoms: ${symptoms}. Please analyze these symptoms and provide potential conditions.`;

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${encodeURIComponent(MODEL_PATH)}`,
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: formattedSymptoms,
          parameters: {
            max_length: 200,
            temperature: 0.7,
            do_sample: true
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return buildFallbackAnalysis(symptoms, `HuggingFace API ${response.status}`);
    }

    const result = await response.json();
    const extractedSymptoms = extractSymptoms(symptoms);
    const potentialConditions = getPotentialConditions(extractedSymptoms);

    return {
      symptoms,
      extractedSymptoms,
      potentialConditions,
      aiAnalysis: result[0]?.generated_text || result.generated_text || 'Analysis not available',
      confidence: 0.85,
      recommendations: [
        'Please consult with a healthcare professional for accurate diagnosis',
        'This analysis is for informational purposes only',
        'Monitor your symptoms and seek medical attention if they worsen'
      ],
      source: 'huggingface',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return buildFallbackAnalysis(symptoms, 'Network/API request failed');
  }
};

app.post('/predict', async (req, res) => {
  const { symptoms } = req.body;
  
  if (!symptoms || symptoms.trim() === '') {
    return res.status(400).json({ error: 'Symptoms text is required' });
  }

  try {
    const processedResult = await runSymptomAnalysis(symptoms);
    res.json(processedResult);
  } catch (err) {
    console.error('Backend error:', err);
    res.status(500).json({ 
      error: 'Failed to analyze symptoms',
      details: err.toString() 
    });
  }
});

// Frontend compatibility route: SymptomInputFeaturePage expects /analyze
app.post('/analyze', async (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms || symptoms.trim() === '') {
    return res.status(400).json({ error: 'Symptoms text is required' });
  }

  try {
    const processedResult = await runSymptomAnalysis(symptoms);
    res.json(processedResult);
  } catch (err) {
    console.error('Analyze route error:', err);
    res.status(500).json({
      error: 'Failed to analyze symptoms',
      details: err.toString()
    });
  }
});

// Frontend compatibility route: chatbot UI expects /api/cohere-chat
app.post('/api/cohere-chat', (req, res) => {
  const { prompt, message } = req.body || {};
  const text = (prompt || message || '').trim();
  if (!text) {
    return res.status(400).json({ response: 'Please enter a message.' });
  }

  const reply = `You said: "${text}". I can provide general health guidance, but for diagnosis and treatment please consult a qualified healthcare professional.`;
  return res.json({ response: reply, source: 'fallback' });
});

// Remove any old /chatbot route that expects messages array
// Only keep the /chatbot route that expects a prompt string
app.post('/chatbot', (req, res) => {
  console.log('Received /chatbot request:', req.body);
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required and must be a non-empty string.' });
  }
  const py = spawn('python', ['server/mental_health_chatbot.py', prompt]);
  let output = '';
  py.stdout.on('data', (data) => {
    output += data.toString();
  });
  py.stderr.on('data', (data) => {
    console.error('Python error:', data.toString());
  });
  py.on('close', (code) => {
    res.json({ response: output.trim() });
  });
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'SympAI Chat API',
    status: 'running',
    endpoints: ['/health', '/predict', '/analyze', '/api/cohere-chat', '/chatbot']
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Medical symptom analysis server running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
}); 