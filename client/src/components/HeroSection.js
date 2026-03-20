import { Box, Heading, Text, Button, Flex, Spinner } from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CLOUDS from 'vanta/dist/vanta.clouds.min';
import * as THREE from 'three';

export default function HeroSection() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    // Disable scrolling on home page
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!vantaEffect.current) {
      vantaEffect.current = CLOUDS({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        minHeight: 200.00,
        minWidth: 200.00,
        skyColor: 0xb3e5fc, // More visible light blue
        cloudColor: 0xffffff,
        cloudShadowColor: 0xcccccc,
        sunColor: 0xffe066,
        sunGlareColor: 0xffe066,
        sunlightColor: 0xffe066,
        speed: 0.7,
      });
    }
    return () => {
      if (vantaEffect.current) {
        try {
          vantaEffect.current.destroy();
        } catch (e) {}
        vantaEffect.current = null;
      }
    };
  }, []);

  const handleStartChecking = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/feature/symptom-input');
    }, 5000);
  };

  return (
    <Box position="relative" h="100vh" w="100vw" overflow="hidden">
      <Box ref={vantaRef} position="absolute" top={0} left={0} w="100%" h="100%" zIndex={0} />
      <Flex
        id="home"
        h="100vh"
        align="center"
        justify="center"
        direction="column"
        bg="transparent"
        px={4}
        textAlign="center"
        position="relative"
        zIndex={1}
      >
        <Heading size="2xl" mb={4} color="teal.700">
          AI Symptoms Checker
        </Heading>
        <Text fontSize="xl" mb={8} color="gray.700">
          Fast symptom analysis, smart health tips, and AI-powered assistance—private, secure, always available.
        </Text>
        {loading ? (
          <Spinner size="xl" thickness="5px" speed="0.7s" color="teal.400" />
        ) : (
          <Button
            colorScheme="teal"
            size="lg"
            onClick={handleStartChecking}
          >
            Start Checking
          </Button>
        )}
      </Flex>
    </Box>
  );
} 