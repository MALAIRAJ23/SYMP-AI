import React, { useState, useEffect } from 'react';
import { Box, Text, Button, Flex, Icon, Heading, useDisclosure } from '@chakra-ui/react';
import { FaPlay, FaPause, FaHome, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const BreathingExercisePage = () => {
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('inhale'); // 'inhale' or 'exhale'
  const [cycle, setCycle] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Get exercise data from location state or use default
  const exerciseData = location.state?.exerciseData || {
    title: 'Deep Breathing Exercise',
    description: 'A simple breathing exercise to promote relaxation and reduce stress',
    steps: [
      'Find a comfortable, quiet place to sit or lie down',
      'Close your eyes and place your hands on your belly',
      'Take a slow, deep breath in through your nose (4 counts)',
      'Hold the breath for 2 counts',
      'Slowly exhale through your mouth (6 counts)',
      'Continue this pattern for 5-10 minutes'
    ],
    tips: [
      'Practice this exercise daily for best results',
      'Try to make your exhale longer than your inhale',
      'Focus on the sensation of breathing',
      'Don\'t worry if your mind wanders - gently return to breathing'
    ],
    warning: 'This is for general relaxation. For medical conditions, consult a healthcare professional'
  };

  const INHALE_TIME = 4; // seconds
  const HOLD_TIME = 2; // seconds
  const EXHALE_TIME = 6; // seconds
  const TOTAL_CYCLE_TIME = INHALE_TIME + HOLD_TIME + EXHALE_TIME;

  useEffect(() => {
    let interval;
    if (isBreathing) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Switch breathing phase
            if (breathingPhase === 'inhale') {
              setBreathingPhase('hold');
              return HOLD_TIME;
            } else if (breathingPhase === 'hold') {
              setBreathingPhase('exhale');
              return EXHALE_TIME;
            } else {
              setBreathingPhase('inhale');
              setCycle((prev) => prev + 1);
              return INHALE_TIME;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathing, breathingPhase]);

  const startBreathing = () => {
    setIsBreathing(true);
    setBreathingPhase('inhale');
    setTimeLeft(INHALE_TIME);
    setCycle(0);
  };

  const stopBreathing = () => {
    setIsBreathing(false);
    setBreathingPhase('inhale');
    setTimeLeft(0);
  };

  const getPhaseText = () => {
    switch (breathingPhase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      default:
        return 'Ready';
    }
  };

  const getPhaseColor = () => {
    switch (breathingPhase) {
      case 'inhale':
        return 'blue.400';
      case 'hold':
        return 'yellow.400';
      case 'exhale':
        return 'green.400';
      default:
        return 'gray.400';
    }
  };

  const getCircleSize = () => {
    if (!isBreathing) return 200;
    
    switch (breathingPhase) {
      case 'inhale':
        return 200 + (timeLeft / INHALE_TIME) * 100; // Expand from 200 to 300
      case 'hold':
        return 300; // Stay expanded
      case 'exhale':
        return 300 - ((EXHALE_TIME - timeLeft) / EXHALE_TIME) * 100; // Contract from 300 to 200
      default:
        return 200;
    }
  };

  return (
    <Box minH="100vh" bgGradient="linear(to-br, #e0f7fa 0%, #f8ffff 100%)" p={4}>
      <Flex direction="column" align="center" justify="center" minH="100vh">
        {/* Header */}
        <Box textAlign="center" mb={8}>
          <Button
            leftIcon={<FaArrowLeft />}
            variant="ghost"
            color="teal.600"
            onClick={() => navigate(-1)}
            mb={4}
          >
            Back
          </Button>
          <Heading color="teal.700" mb={2}>{exerciseData.title}</Heading>
          <Text color="teal.600" fontSize="lg">{exerciseData.description}</Text>
        </Box>

        {/* Breathing Circle */}
        <Box
          position="relative"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb={8}
        >
          <Box
            w={`${getCircleSize()}px`}
            h={`${getCircleSize()}px`}
            borderRadius="50%"
            bg={getPhaseColor()}
            display="flex"
            alignItems="center"
            justifyContent="center"
            transition="all 1s ease-in-out"
            boxShadow="0 0 30px rgba(0,0,0,0.1)"
            position="relative"
            overflow="hidden"
          >
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color="white"
              textAlign="center"
              zIndex={2}
            >
              {getPhaseText()}
              <Text fontSize="lg" mt={2}>
                {timeLeft}s
              </Text>
            </Text>
            
            {/* Animated waves inside circle */}
            {isBreathing && (
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                w="100%"
                h="100%"
                borderRadius="50%"
                border="3px solid rgba(255,255,255,0.3)"
                animation={breathingPhase === 'inhale' ? 'pulse 2s infinite' : 'none'}
              />
            )}
          </Box>
        </Box>

        {/* Controls */}
        <Flex gap={4} mb={8}>
          {!isBreathing ? (
            <Button
              leftIcon={<FaPlay />}
              colorScheme="teal"
              size="lg"
              onClick={startBreathing}
              borderRadius="full"
              px={8}
            >
              Start Exercise
            </Button>
          ) : (
            <Button
              leftIcon={<FaPause />}
              colorScheme="red"
              size="lg"
              onClick={stopBreathing}
              borderRadius="full"
              px={8}
            >
              Stop Exercise
            </Button>
          )}
        </Flex>

        {/* Cycle Counter */}
        {isBreathing && (
          <Box textAlign="center" mb={6}>
            <Text fontSize="xl" fontWeight="bold" color="teal.700">
              Cycle: {cycle}
            </Text>
            <Text color="teal.600">Complete 5-10 cycles for best results</Text>
          </Box>
        )}

        {/* Instructions */}
        <Box maxW="600px" bg="white" p={6} borderRadius="xl" boxShadow="lg">
          <Heading size="md" color="teal.700" mb={4}>Instructions:</Heading>
          <Box as="ol" pl={4} mb={4}>
            {exerciseData.steps.map((step, index) => (
              <Text key={index} as="li" color="gray.700" mb={2}>
                {step}
              </Text>
            ))}
          </Box>
          
          <Box p={4} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
            <Text fontWeight="bold" color="green.700" mb={2}>Tips:</Text>
            <Box as="ul" pl={4}>
              {exerciseData.tips.map((tip, index) => (
                <Text key={index} as="li" color="green.600" mb={1} fontSize="sm">
                  {tip}
                </Text>
              ))}
            </Box>
          </Box>
          
          <Box mt={4} p={3} bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.200">
            <Text fontWeight="bold" color="orange.700" mb={1}>⚠️ Warning:</Text>
            <Text color="orange.600" fontSize="sm">{exerciseData.warning}</Text>
          </Box>
        </Box>
      </Flex>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.4; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
        }
      `}</style>
    </Box>
  );
};

export default BreathingExercisePage; 