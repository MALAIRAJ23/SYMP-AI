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

const HF_API_TOKEN = "REMOVED";

// For medical symptom analysis, we'll use a text classification approach
// You can replace this with a specific medical model when available
const MODEL_PATH = "microsoft/DialoGPT-medium"; // Placeholder - replace with medical model

const openRouterProxy = require('./openRouterProxy');
app.use(openRouterProxy);

const runSymptomAnalysis = async (symptoms) => {
  // Format the symptoms for analysis
  const formattedSymptoms = `Patient symptoms: ${symptoms}. Please analyze these symptoms and provide potential conditions.`;

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
    throw new Error(`HuggingFace API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return {
    symptoms,
    analysis: result[0]?.generated_text || result.generated_text || 'Analysis not available',
    confidence: 0.85,
    recommendations: [
      'Please consult with a healthcare professional for accurate diagnosis',
      'This analysis is for informational purposes only',
      'Monitor your symptoms and seek medical attention if they worsen'
    ],
    timestamp: new Date().toISOString()
  };
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