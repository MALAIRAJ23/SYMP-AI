import React, { useState, useRef } from 'react';
import { Box, Heading, Text, Input, Flex, Icon, Button, Spinner, Tag, Wrap, WrapItem, Tooltip, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@chakra-ui/react';
import { FaMicrophone, FaMicrophoneSlash, FaStethoscope, FaHome, FaThermometerHalf, FaArrowLeft } from 'react-icons/fa';
import { keyframes } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import useSymptomsDataset from './useSymptomsDataset';
import useDiseaseDataset from './useDiseaseDataset';
import { MEDICAL_API_BASE_URL } from './config/api';

const cloudClipPath =
  'polygon(10% 20%, 20% 10%, 40% 5%, 60% 10%, 70% 20%, 80% 10%, 90% 20%, 95% 40%, 100% 60%, 95% 80%, 90% 90%, 80% 95%, 60% 90%, 40% 95%, 20% 90%, 10% 80%, 5% 60%, 10% 40%)';

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(45, 183, 185, 0.7); }
  70% { box-shadow: 0 0 0 24px rgba(45, 183, 185, 0); }
  100% { box-shadow: 0 0 0 0 rgba(45, 183, 185, 0); }
`;

export default function SymptomInputFeaturePage() {
  const symptoms = useSymptomsDataset();
  const diseasesDataset = useDiseaseDataset();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [detected, setDetected] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const recognitionRef = useRef(null);
  const [predictions, setPredictions] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [homeRemedies, setHomeRemedies] = useState(null);
  const [breathingExercise, setBreathingExercise] = useState(null);
  const [micError, setMicError] = useState('');
  const [micTesting, setMicTesting] = useState(false);

  const datasetLoaded = symptoms.length > 0;

  // Home remedies data
  const homeRemediesData = {
    'common_cold': {
      title: 'Home Remedies for Common Cold',
      remedies: [
        '🍵 Drink warm water with honey and lemon',
        '🛏️ Get plenty of rest (8-10 hours)',
        '💧 Stay hydrated with water and clear fluids',
        '🧂 Gargle with warm salt water for sore throat',
        '🌡️ Use a humidifier to ease congestion',
        '🥣 Eat chicken soup or warm broth',
        '🍯 Take honey for cough relief',
        '🧴 Use saline nasal drops for congestion'
      ],
      duration: '7-10 days',
      warning: 'If symptoms persist beyond 10 days, consult a doctor'
    },
    'flu': {
      title: 'Home Care for Flu Symptoms',
      remedies: [
        '🛏️ Rest in bed for at least 24-48 hours',
        '💧 Drink plenty of fluids (water, tea, broth)',
        '🌡️ Take acetaminophen for fever and body aches',
        '🍵 Drink warm herbal teas (ginger, chamomile)',
        '🧴 Use a humidifier in your room',
        '🥣 Eat light, easy-to-digest foods',
        '🚿 Take warm baths to reduce fever',
        '🧘 Practice deep breathing exercises'
      ],
      duration: '1-2 weeks',
      warning: 'Seek medical attention if fever is above 103°F or persists for more than 3 days'
    },
    'migraine': {
      title: 'Home Relief for Migraine',
      remedies: [
        '🌙 Rest in a dark, quiet room',
        '🧊 Apply cold compress to forehead',
        '💧 Stay hydrated with water',
        '🍵 Drink ginger tea for nausea',
        '🧘 Practice relaxation techniques',
        '🌿 Try peppermint oil on temples',
        '☕ Limit caffeine intake',
        '📱 Avoid bright screens and loud noises'
      ],
      duration: '4-72 hours',
      warning: 'If migraines are frequent or severe, consult a neurologist'
    },
    'anxiety': {
      title: 'Natural Anxiety Relief',
      remedies: [
        '🧘 Practice deep breathing exercises',
        '🛏️ Ensure 7-9 hours of quality sleep',
        '🚶 Take regular walks in nature',
        '🍵 Drink chamomile or lavender tea',
        '🧘 Practice meditation or mindfulness',
        '📱 Limit screen time before bed',
        '🏃 Engage in regular exercise',
        '📖 Read a book or listen to calming music'
      ],
      duration: 'Varies',
      warning: 'If anxiety interferes with daily life, consider professional help'
    },
    'general': {
      title: 'General Wellness Tips',
      remedies: [
        '💧 Drink 8-10 glasses of water daily',
        '🛏️ Get 7-9 hours of quality sleep',
        '🥗 Eat a balanced, nutritious diet',
        '🏃 Exercise regularly (30 minutes daily)',
        '🧘 Practice stress management techniques',
        '☀️ Get 15-20 minutes of sunlight daily',
        '🚭 Avoid smoking and limit alcohol',
        '🧴 Maintain good hygiene practices'
      ],
      duration: 'Ongoing',
      warning: 'These are general wellness tips, not medical advice'
    }
  };

  // Breathing exercises data
  const breathingExercisesData = {
    'shortness of breath': {
      title: 'Breathing Exercise for Shortness of Breath',
      description: 'This exercise helps improve breathing and reduce anxiety',
      steps: [
        'Sit in a comfortable position with your back straight',
        'Place one hand on your chest and the other on your belly',
        'Breathe in slowly through your nose for 4 counts',
        'Hold your breath for 2 counts',
        'Breathe out slowly through your mouth for 6 counts',
        'Repeat this cycle 5-10 times',
        'Take a break and breathe normally for 30 seconds',
        'Repeat the entire sequence 3-4 times'
      ],
      tips: [
        'Focus on breathing from your belly, not your chest',
        'Keep your shoulders relaxed',
        'If you feel dizzy, stop and breathe normally',
        'Practice this exercise 2-3 times daily'
      ],
      warning: 'If shortness of breath is severe or accompanied by chest pain, seek immediate medical attention'
    },
    'anxiety': {
      title: 'Calming Breathing Exercise for Anxiety',
      description: 'This 4-7-8 breathing technique helps calm the nervous system',
      steps: [
        'Sit or lie down in a comfortable position',
        'Close your eyes and relax your jaw',
        'Breathe in quietly through your nose for 4 counts',
        'Hold your breath for 7 counts',
        'Exhale completely through your mouth for 8 counts',
        'Repeat this cycle 4 times',
        'Gradually increase to 8 cycles as you become comfortable',
        'Practice this exercise whenever you feel anxious'
      ],
      tips: [
        'Make sure you\'re in a quiet, comfortable place',
        'Focus on the counting to distract from anxious thoughts',
        'Don\'t force the breath - let it flow naturally',
        'Practice regularly, even when you\'re not anxious'
      ],
      warning: 'If anxiety is severe or interfering with daily life, consider professional help'
    },
    'general': {
      title: 'Deep Breathing Exercise for Relaxation',
      description: 'A simple breathing exercise to promote relaxation and reduce stress',
      steps: [
        'Find a comfortable, quiet place to sit or lie down',
        'Close your eyes and place your hands on your belly',
        'Take a slow, deep breath in through your nose (4 counts)',
        'Feel your belly rise as you breathe in',
        'Hold the breath for 2 counts',
        'Slowly exhale through your mouth (6 counts)',
        'Feel your belly fall as you breathe out',
        'Continue this pattern for 5-10 minutes'
      ],
      tips: [
        'Practice this exercise daily for best results',
        'Try to make your exhale longer than your inhale',
        'Focus on the sensation of breathing',
        'Don\'t worry if your mind wanders - gently return to breathing'
      ],
      warning: 'This is for general relaxation. For medical conditions, consult a healthcare professional'
    }
  };

  async function getMedicalPrediction(symptomText) {
    try {
      const response = await fetch(`${MEDICAL_API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: symptomText })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Medical prediction error:', error);
      return { 
        error: 'Failed to analyze symptoms. Please try again.',
        details: error.message 
      };
    }
  }

  function mockNlpAnalyze(text) {
    if (!symptoms.length) return [];
    const input = text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\\-_`~()]/g, "").replace(/\s+/g, " ").trim();
    // Try to match symptoms as substrings (since CSV symptoms are now column names)
    return symptoms.filter(symptom => {
      const cleanedSymptom = symptom.toLowerCase().replace(/[.,/#!$%^&*;:{}=\\-_`~()]/g, "").replace(/\s+/g, " ").trim();
      if (!cleanedSymptom) return false;
      // Match as substring for more robust detection
      return input.includes(cleanedSymptom);
    });
  }

  const handleMicClick = () => {
    setMicError('');
    
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setMicError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Check if page is served over HTTPS or localhost
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setMicError('Microphone access requires HTTPS. Please use https:// or run on localhost.');
      return;
    }

    if (!listening) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true; // Enable interim results for better UX
      recognition.continuous = true; // Keep listening continuously
      recognition.maxAlternatives = 1;

      let finalTranscript = '';
      let hasReceivedSpeech = false;

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setMicError('🎤 Listening... Speak your symptoms now!');
        hasReceivedSpeech = false;
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            hasReceivedSpeech = true;
          } else {
            interimTranscript += transcript;
          }
        }
        
        const currentTranscript = (finalTranscript + interimTranscript).trim();
        setInput(currentTranscript);
        console.log('Transcript:', currentTranscript);
        
        if (hasReceivedSpeech) {
          setMicError('✅ Got it! Keep talking or click mic to stop...');
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended, hasReceivedSpeech:', hasReceivedSpeech);
        
        // If we're still supposed to be listening and got speech, restart
        if (hasReceivedSpeech && recognitionRef.current === recognition) {
          setMicError('✅ Got your speech! Click mic to stop or keep talking...');
          // Auto-restart to keep listening
          try {
            recognition.start();
            console.log('Auto-restarted recognition');
          } catch (e) {
            console.log('Recognition already running or failed to restart:', e);
            setListening(false);
          }
        } else {
          setListening(false);
          if (hasReceivedSpeech) {
            setMicError('✅ Done! Your speech was captured successfully.');
          } else {
            setMicError('⚠️ No speech detected. Check: 1) Microphone volume in system settings 2) Correct mic selected 3) Browser mic permissions');
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error, 'Details:', event);
        
        switch(event.error) {
          case 'not-allowed':
          case 'service-not-allowed':
          case 'permission-denied':
            setListening(false);
            setMicError('🚫 Microphone permission denied. Click the 🔒 icon in address bar → Site settings → Allow microphone.');
            break;
          case 'no-speech':
            // Auto-restart instead of showing error if we haven't got speech yet
            if (!hasReceivedSpeech && recognitionRef.current === recognition) {
              console.log('No speech timeout, restarting...');
              setMicError('🎤 Still listening... Please speak louder or closer to microphone.');
              // Try restarting automatically
              setTimeout(() => {
                if (recognitionRef.current === recognition) {
                  try {
                    recognition.start();
                    console.log('Restarted after no-speech');
                  } catch (e) {
                    console.log('Failed to restart:', e);
                    setListening(false);
                    setMicError('⚠️ Microphone timeout. Click mic button to try again.');
                  }
                }
              }, 100);
            } else {
              setListening(false);
            }
            break;
          case 'audio-capture':
            setMicError('🎙️ No microphone detected. Please: 1) Connect a microphone 2) Check system settings 3) Refresh page');
            break;
          case 'network':
            setMicError('🌐 Network error. Speech recognition needs internet. Check your connection.');
            break;
          case 'aborted':
            if (hasReceivedSpeech) {
              setMicError('✅ Speech captured successfully!');
            } else {
              setMicError('⚠️ Recognition stopped early. Please try again.');
            }
            break;
          default:
            setMicError(`❌ Error: ${event.error}. Please try again or type your symptoms.`);
        }
      };

      try {
        recognition.start();
        recognitionRef.current = recognition;
        setListening(true);
        setMicError('🎤 Microphone starting... Get ready to speak!');
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        setMicError('❌ Failed to start microphone. Please refresh the page and try again.');
      }
    } else {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setListening(false);
      setMicError('');
    }
  };

  const handleAnalyze = async () => {
    // Stop listening if microphone is active
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      setMicError('');
    }
    
    setAnalyzing(true);
    setShowResults(false);
    setPrediction(null);
    setHomeRemedies(null);
    setTimeout(async () => {
      const found = mockNlpAnalyze(input);
      setDetected(found);
      // Call backend for model prediction
      try {
        const pred = await getMedicalPrediction(input);
        setPrediction(pred);
        
        // Check for low confidence conditions and show home remedies
        if (pred && pred.potentialConditions && pred.potentialConditions.length > 0) {
          const lowConfidenceConditions = pred.potentialConditions.filter(c => c.confidence <= 35);
          if (lowConfidenceConditions.length > 0) {
            // Get the first low confidence condition for home remedies
            const condition = lowConfidenceConditions[0].condition.replace(/\s+/g, '_');
            const remedies = homeRemediesData[condition] || homeRemediesData['general'];
            setHomeRemedies(remedies);
            onOpen(); // Open the modal
          }
        }
        
        // Check for breathing problems and set breathing exercise data
        if (pred && pred.extractedSymptoms) {
          const breathingSymptoms = ['shortness of breath', 'chest pain', 'anxiety'];
          const hasBreathingProblem = breathingSymptoms.some(symptom => 
            pred.extractedSymptoms.includes(symptom)
          );
          
          if (hasBreathingProblem) {
            let breathingType = 'general';
            if (pred.extractedSymptoms.includes('shortness of breath')) {
              breathingType = 'shortness of breath';
            } else if (pred.extractedSymptoms.includes('anxiety')) {
              breathingType = 'anxiety';
            }
            
            const breathingExercise = breathingExercisesData[breathingType];
            setBreathingExercise(breathingExercise);
          }
        }
      } catch (e) {
        setPrediction({ error: 'Prediction failed.' });
      }
      // --- Disease prediction logic ---
      if (diseasesDataset.length && found.length) {
        // Calculate confidence scores for each disease based on symptom matches
        const scored = diseasesDataset.map(d => {
          const matchedSymptoms = found.filter(sym => d.symptoms[sym] === 1);
          const totalSymptoms = Object.keys(d.symptoms).length;
          const matchCount = matchedSymptoms.length;
          // Calculate confidence percentage based on symptom match ratio
          const confidence = totalSymptoms > 0 ? Math.round((matchCount / totalSymptoms) * 100) : 0;
          return {
            disease: d.disease,
            matchCount,
            totalSymptoms,
            confidence,
            matchedSymptoms
          };
        });
        // Sort by confidence descending, then by match count
        scored.sort((a, b) => {
          if (b.confidence !== a.confidence) {
            return b.confidence - a.confidence;
          }
          return b.matchCount - a.matchCount;
        });
        // Take top 4 with confidence > 10%
        const topPredictions = scored.filter(d => d.confidence > 10).slice(0, 4);
        setPredictions(topPredictions);
      } else {
        setPredictions([]);
      }
      // ---
      setAnalyzing(false);
      setShowResults(true);
    }, 3000);
  };

  function highlightText(text, detected) {
    if (!detected.length) return text;
    let result = text;
    detected.forEach(symptom => {
      const re = new RegExp(`(${symptom})`, 'ig');
      result = result.replace(re, '|||$1|||');
    });
    const parts = result.split('|||');
    return parts.map((part, i) =>
      detected.some(s => s.toLowerCase() === part.toLowerCase()) ?
        <span key={i} style={{ background: '#b2f7ef', borderRadius: 4, padding: '0 2px', fontWeight: 600 }}>{part}</span>
        : part
    );
  }

  return (
    <Box minH="100vh" w="100vw" position="relative" bgGradient="linear(to-br, #e0f7fa 0%, #f8ffff 100%)" overflow="hidden" display="flex" alignItems="center" justifyContent="center" px={2}>
      {/* Back Button */}
      <Button
        leftIcon={<FaArrowLeft />}
        variant="ghost"
        color="teal.600"
        position="absolute"
        top={{ base: 4, md: 8 }}
        left={{ base: 4, md: 8 }}
        zIndex={10}
        onClick={() => navigate(-1)}
      >
        Back
      </Button>
      <Flex w="100%" maxW="1100px" mx="auto" direction={{ base: 'column', md: 'row' }} align="stretch" justify="center" gap={8}>
        {/* Left Container: Input, Mic, Analyze */}
        <Box
          flex={1}
          minW={{ base: '100%', md: '350px' }}
          maxW={{ base: '100%', md: '480px' }}
          p={{ base: 5, md: 10 }}
          bg="rgba(255,255,255,0.85)"
          borderRadius="2xl"
          boxShadow="2xl"
          style={{
            backdropFilter: 'blur(8px)',
          }}
          position="relative"
          zIndex={2}
          mx="auto"
          mb={{ base: 6, md: 0 }}
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          <Heading size="lg" mb={2} color="teal.700" textAlign="center" letterSpacing={1.5} fontWeight={900}>
            Talk-to-Text Health
          </Heading>
          <Text color="teal.600" mb={6} fontSize="lg" textAlign="center" fontWeight={500}>
            Describe your symptoms in your own words. Let AI help you understand your health.
          </Text>
          {!datasetLoaded ? (
            <Flex direction="column" align="center" justify="center" minH="200px">
              <Spinner color="teal.400" size="xl" thickness="4px" mb={4} />
              <Text color="gray.500">Loading symptom dataset...</Text>
            </Flex>
          ) : (
            <Flex direction="column" align="center" gap={4}>
              <Tooltip label={listening ? 'Stop Listening' : 'Start Talking'} placement="top" hasArrow>
          <Button
            colorScheme={listening ? 'red' : 'teal'}
            onClick={handleMicClick}
            aria-label="Start voice input"
            isDisabled={analyzing}
                  borderRadius="full"
                  boxSize="70px"
                  minW="70px"
                  fontSize="2.5rem"
                  animation={listening ? `${pulse} 1.2s infinite` : undefined}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  shadow={listening ? '0 0 0 8px #b2f7ef' : '0 2px 12px rgba(45,183,185,0.10)'}
                  mb={2}
                  mt={2}
          >
            <Icon as={listening ? FaMicrophoneSlash : FaMicrophone} />
          </Button>
              </Tooltip>
              <Input
                placeholder="e.g., I feel tired and have a sore throat"
                size="lg"
                value={input}
                onChange={e => setInput(e.target.value)}
                isDisabled={listening || analyzing}
                bg="whiteAlpha.800"
                borderColor="teal.100"
                _focus={{ borderColor: 'teal.400', bg: 'white' }}
                fontSize="lg"
                fontWeight={500}
                borderRadius="xl"
                boxShadow="sm"
                mb={1}
              />
              {micError && listening && (
                <Box w="100%" p={2} bg="blue.50" borderRadius="md" mb={2}>
                  <Text fontSize="sm" color="blue.700" textAlign="center" fontWeight="medium">
                    {micError}
                  </Text>
                </Box>
              )}
              <Box w="100%" minH="40px" fontSize="md" bg="teal.50" borderRadius="md" p={3} px={4} boxShadow="xs" mb={2} textAlign="left">
                {highlightText(input, detected)}
              </Box>
              <Button
                colorScheme="teal"
                onClick={handleAnalyze}
                isLoading={analyzing}
                isDisabled={!input.trim() || analyzing || !datasetLoaded}
                borderRadius="full"
                px={10}
                fontWeight="bold"
                fontSize="lg"
                shadow="md"
                mt={2}
                mb={2}
                _hover={{ bg: 'teal.400', color: 'white' }}
              >
            Analyze
          </Button>
              {analyzing && <Spinner color="teal.500" size="lg" thickness="4px" mt={2} />}
        <Text fontSize="sm" color="gray.400" mb={2}>
          {listening ? 'Listening...' : 'Click the mic to speak your symptoms'}
        </Text>
            </Flex>
          )}
        </Box>
        {/* Right Container: Results & Advice */}
        {datasetLoaded && showResults && (
          <Box
            flex={1}
            minW={{ base: '100%', md: '350px' }}
            maxW={{ base: '100%', md: '480px' }}
            p={{ base: 5, md: 10 }}
            bg="rgba(255,255,255,0.92)"
            borderRadius="2xl"
            boxShadow="2xl"
            style={{
              backdropFilter: 'blur(8px)',
            }}
            position="relative"
            zIndex={2}
            mx="auto"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <Heading size="md" mb={2} color="teal.700" textAlign="center" letterSpacing={1.2} fontWeight={800}>
              Analysis Results
            </Heading>
            {prediction && prediction.error && (
              <Box mb={4} p={3} bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
                <Text color="red.600" fontWeight="bold">Analysis Error:</Text>
                <Text color="red.500">{prediction.error}</Text>
                {prediction.details && (
                  <Text color="red.400" fontSize="sm" mt={1}>{prediction.details}</Text>
                )}
              </Box>
            )}
            
            {prediction && prediction.potentialConditions && prediction.potentialConditions.length > 0 && (
              <Box mb={4} textAlign="center">
                <Text fontWeight="bold" color="teal.700" fontSize="lg" mb={2}>AI Analysis Results:</Text>
                {prediction.potentialConditions.map((condition, index) => (
                  <Box 
                    key={index} 
                    mb={3} 
                    p={3} 
                    bg={index === 0 ? "teal.50" : "gray.50"} 
                    borderRadius="lg"
                    border={index === 0 ? "2px solid" : "1px solid"}
                    borderColor={index === 0 ? "teal.200" : "gray.200"}
                  >
                    <Text fontSize="lg" fontWeight="bold" color="teal.700" style={{ textTransform: 'capitalize' }}>
                      {condition.condition}
                    </Text>
                    <Text color="gray.600" fontSize="sm">Confidence: {condition.confidence}%</Text>
                    {condition.symptoms && (
                      <Text color="gray.500" fontSize="xs" mt={1}>
                        Related symptoms: {condition.symptoms.join(', ')}
                      </Text>
                    )}
                    
                    {/* Show Consult Doctor option for high confidence */}
                    {condition.confidence > 35 && (
                      <Box mt={3} p={2} bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.200">
                        <Text color="orange.700" fontSize="sm" fontWeight="bold" mb={1}>
                          ⚠️ High Confidence Match
                        </Text>
                        <Button
                          as="a"
                          href={`https://www.google.com/maps/search/doctor+${condition.condition.replace(/\s+/g, '+')}+near+me/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          colorScheme="orange"
                          size="sm"
                          borderRadius="full"
                          fontWeight="bold"
                          fontSize="xs"
                          px={4}
                          py={1}
                          _hover={{ bg: 'orange.400' }}
                        >
                          🏥 Consult Doctor for {condition.condition}
                        </Button>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}
            
            {prediction && prediction.aiAnalysis && (
              <Box mb={4} p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontWeight="bold" color="blue.700" mb={1}>AI Analysis:</Text>
                <Text color="blue.600" fontSize="sm">{prediction.aiAnalysis}</Text>
              </Box>
            )}
            {detected.length > 0 ? (
              <>
                <Text fontSize="md" color="teal.700" mb={1} fontWeight={600}>Detected symptoms:</Text>
                <Wrap mb={3} justify="center">
              {detected.map((sym, i) => (
                    <WrapItem key={i}><Tag colorScheme="teal" fontWeight={600} fontSize="md">{sym}</Tag></WrapItem>
                  ))}
                </Wrap>
                {/* Disease prediction results */}
                {predictions.length > 0 && (
                  <Box mt={2} mb={2} w="100%" textAlign="center">
                    <Text fontWeight="bold" fontSize="xl" color="teal.800" mb={2}>
                      Disease Predictions:
                    </Text>
                    {/* Top prediction with confidence */}
                    <Box
                      fontWeight="900"
                      fontSize="2xl"
                      color="#fff"
                      bgGradient="linear(to-r, teal.400, teal.700)"
                      borderRadius="xl"
                      p={3}
                      mb={3}
                      boxShadow="lg"
                      letterSpacing={1.2}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {predictions[0].disease}
                      <Text fontSize="md" color="teal.100" fontWeight="bold">
                        Confidence: {predictions[0].confidence}% ({predictions[0].matchCount}/{predictions[0].totalSymptoms} symptoms)
                      </Text>
                    </Box>
                    {predictions.length > 1 && (
                      <Box>
                        <Text fontWeight="bold" fontSize="lg" color="teal.700" mb={2}>Other Possible Diseases:</Text>
                        <Wrap justify="center" spacing={3}>
                          {predictions.slice(1).map((p, idx) => (
                            <WrapItem key={p.disease}>
                              <Box
                                bg="teal.50"
                                color="teal.800"
                                borderRadius="md"
                                px={4}
                                py={3}
                                fontWeight={700}
                                fontSize="md"
                                boxShadow="sm"
                                border="1px solid"
                                borderColor="teal.200"
                                style={{ textTransform: 'capitalize' }}
                                minW="200px"
                              >
                                <Text fontWeight="bold" fontSize="lg">{p.disease}</Text>
                                <Text fontSize="sm" color="teal.600" mt={1}>
                                  Confidence: {p.confidence}%
                                </Text>
                                <Text fontSize="xs" color="teal.500">
                                  {p.matchCount}/{p.totalSymptoms} symptoms matched
                                </Text>
                              </Box>
                            </WrapItem>
                          ))}
                        </Wrap>
                      </Box>
                    )}
                  </Box>
                )}
                <Box mt={2} p={4} bg="teal.100" borderRadius="2xl" textAlign="center" boxShadow="lg" display="flex" flexDirection="column" alignItems="center">
                  <Icon as={FaStethoscope} color="teal.600" w={8} h={8} mb={2} />
                  <Text fontWeight="bold" color="teal.700" mb={2} fontSize="lg">
                    Based on your symptoms, we recommend consulting a healthcare professional.
                  </Text>
                  
                  {/* Show urgent consultation for high confidence conditions */}
                  {prediction && prediction.potentialConditions && 
                   prediction.potentialConditions.some(c => c.confidence > 35) && (
                    <Box mt={2} p={3} bg="red.50" borderRadius="lg" border="2px solid" borderColor="red.200" w="100%">
                      <Text color="red.700" fontWeight="bold" fontSize="md" mb={2}>
                        🚨 High Confidence Match Detected
                      </Text>
                      <Text color="red.600" fontSize="sm" mb={3}>
                        One or more conditions have high confidence (&gt;35%). Consider consulting a healthcare professional for proper diagnosis.
                      </Text>
                      <Button
                        as="a"
                        href="https://www.google.com/maps/search/doctor+near+me/"
                        target="_blank"
                        rel="noopener noreferrer"
                        colorScheme="red"
                        variant="solid"
                        borderRadius="full"
                        fontWeight={700}
                        fontSize="sm"
                        px={4}
                        _hover={{ bg: 'red.600' }}
                      >
                        🏥 Find Doctors Near Me
                      </Button>
                    </Box>
                  )}
                  
                  {prediction && prediction.recommendations && (
                    <Box mt={3} textAlign="left" w="100%">
                      <Text fontWeight="bold" color="teal.700" mb={2} fontSize="md">Recommendations:</Text>
                      {prediction.recommendations.map((rec, index) => (
                        <Text key={index} color="teal.600" fontSize="sm" mb={1} display="flex" alignItems="center">
                          <span style={{ marginRight: '8px' }}>•</span>
                          {rec}
                        </Text>
                      ))}
                    </Box>
                  )}
                  
                  <Button
                    as="a"
                    href="https://www.google.com/maps/search/doctor+near+me/"
                    target="_blank"
                    rel="noopener noreferrer"
                    colorScheme="teal"
                    variant="solid"
                    borderRadius="full"
                    mt={3}
                    px={6}
                    fontWeight={700}
                    fontSize="md"
                    shadow="md"
                  >
                    Find Doctors Near Me
                  </Button>
                </Box>
              </>
            ) : (
              <Text color="gray.500" fontSize="lg" textAlign="center" mt={8}>
                No symptoms detected. Please try describing your symptoms again.
              </Text>
            )}
          </Box>
        )}
      </Flex>
      
      {/* Home Remedies Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="teal.700" display="flex" alignItems="center">
            <Icon as={FaHome} color="teal.500" mr={2} />
            {homeRemedies?.title || 'Home Care Tips'}
          </ModalHeader>
          <ModalBody>
            {homeRemedies && (
              <Box>
                <Text color="gray.600" mb={4} fontSize="sm">
                  💡 These home remedies may help with mild symptoms. Always consult a healthcare professional for proper diagnosis.
                </Text>
                
                <Box mb={4}>
                  <Text fontWeight="bold" color="teal.700" mb={2}>
                    🏠 Recommended Home Remedies:
                  </Text>
                  <Box as="ul" pl={4}>
                    {homeRemedies.remedies.map((remedy, index) => (
                      <Text key={index} as="li" color="gray.700" mb={2} fontSize="sm">
                        {remedy}
                      </Text>
                    ))}
                  </Box>
                </Box>
                
                <Box mb={4} p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                  <Text fontWeight="bold" color="blue.700" mb={1}>
                    ⏰ Expected Duration:
                  </Text>
                  <Text color="blue.600" fontSize="sm">{homeRemedies.duration}</Text>
                </Box>
                
                <Box p={3} bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.200">
                  <Text fontWeight="bold" color="orange.700" mb={1}>
                    ⚠️ Important Warning:
                  </Text>
                  <Text color="orange.600" fontSize="sm">{homeRemedies.warning}</Text>
                </Box>
                
                {/* Breathing Exercise Button */}
                {breathingExercise && (
                  <Box mt={4} p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                    <Text fontWeight="bold" color="blue.700" mb={2}>
                      🫁 Breathing Exercise Available
                    </Text>
                    <Text color="blue.600" fontSize="sm" mb={3}>
                      {breathingExercise.description}
                    </Text>
                    <Button
                      colorScheme="blue"
                      size="md"
                      borderRadius="full"
                      fontWeight="bold"
                      px={6}
                      py={2}
                      _hover={{ bg: 'blue.500' }}
                      onClick={() => {
                        onClose();
                        // Navigate to breathing exercise page with exercise data
                        navigate('/breathing-exercise', { 
                          state: { exerciseData: breathingExercise } 
                        });
                      }}
                    >
                      🫁 Take Your Exercise
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={onClose}>
              Got it!
            </Button>
            <Button 
              as="a" 
              href="https://www.google.com/maps/search/doctor+near+me/"
              target="_blank"
              rel="noopener noreferrer"
              variant="outline" 
              colorScheme="teal"
            >
              Find Doctor
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      

      </Box>
  );
} 