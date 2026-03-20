import React, { useState, useEffect, useRef } from 'react';
import { Box, Heading, Text, Icon, VStack, Input, Button, HStack, Flex, Spinner, Avatar, Badge, Wrap, WrapItem, IconButton, useToast } from '@chakra-ui/react';
import { FaRobot, FaUser, FaTrash, FaCopy, FaPaperPlane } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { CHAT_API_BASE_URL } from './config/api';

export default function AIChatbotFeaturePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [
      { sender: 'bot', text: '👋 Hi! I am your AI health assistant. How can I help you today?', timestamp: new Date().toISOString() }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [serverError, setServerError] = useState(null);

  const suggestedQuestions = [
    "What are common cold symptoms?",
    "How to reduce fever naturally?",
    "When should I see a doctor for headaches?",
    "Tips for better sleep quality"
  ];

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const response = await fetch(`${CHAT_API_BASE_URL}/health`);
      if (response.ok) {
        setConnectionStatus('connected');
        setServerError(null);
      } else {
        setConnectionStatus('error');
        setServerError('Server returned error: ' + response.status);
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      setServerError('Cannot connect to chat server. Please verify your API URL configuration.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (messageText = null) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMessage = { sender: 'user', text: textToSend, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch(`${CHAT_API_BASE_URL}/api/cohere-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: textToSend }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (e) {
        console.error('Non-JSON response from server', e);
        throw new Error('Server returned invalid response');
      }

      // Check if we got a response
      const serverText = data?.response || data?.reply;
      
      if (!serverText) {
        throw new Error('No response text from server');
      }
      
      setIsTyping(false);
      setTimeout(() => {
        const botMessage = { sender: 'bot', text: serverText, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, botMessage]);
        setConnectionStatus('connected');
        setServerError(null);
      }, 500);

    } catch (error) {
      console.error('Error fetching from server:', error);
      setIsTyping(false);
      setTimeout(() => {
        const errorMessage = { 
          sender: 'bot', 
          text: '⚠️ Connection error. Please verify the backend service is live and REACT_APP_CHAT_API_URL is correctly configured.', 
          timestamp: new Date().toISOString() 
        };
        setMessages(prev => [...prev, errorMessage]);
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([
      { sender: 'bot', text: '👋 Hi! I am your AI health assistant. How can I help you today?', timestamp: new Date().toISOString() }
    ]);
    localStorage.removeItem('chatHistory');
    toast({
      title: 'Conversation cleared',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" p={4} position="relative">
      <Button
        leftIcon={<Icon as={FaRobot} />}
        variant="ghost"
        color="white"
        position="absolute"
        top={4}
        left={4}
        onClick={() => navigate(-1)}
        _hover={{ bg: 'whiteAlpha.200' }}
      >
        Back
      </Button>
      
      <VStack spacing={4} maxW="900px" mx="auto" pt={16} pb={4} h="100vh">
        {/* Header */}
        <Box textAlign="center" bg="white" p={6} borderRadius="2xl" boxShadow="2xl" w="full">
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Icon as={FaRobot} w={10} h={10} color="teal.500" />
              <Box textAlign="left">
                <Heading size="lg" color="teal.700" fontWeight={900}>
                  AI Health Assistant
                </Heading>
                <Badge 
                  colorScheme={connectionStatus === 'connected' ? 'green' : connectionStatus === 'checking' ? 'yellow' : 'red'} 
                  fontSize="sm"
                >
                  {connectionStatus === 'connected' ? 'Online' : connectionStatus === 'checking' ? 'Checking...' : 'Offline'}
                </Badge>
              </Box>
            </HStack>
            <IconButton
              icon={<FaTrash />}
              colorScheme="red"
              variant="ghost"
              aria-label="Clear conversation"
              onClick={clearConversation}
              isDisabled={messages.length <= 1}
            />
          </HStack>
        </Box>

        {/* Connection Error Alert */}
        {serverError && (
          <Box bg="red.50" p={4} borderRadius="xl" border="2px" borderColor="red.200" w="full">
            <HStack spacing={2}>
              <Text color="red.600" fontWeight="bold" fontSize="sm">⚠️ Server Connection Error</Text>
              <Button size="xs" colorScheme="red" variant="outline" onClick={testConnection}>
                Retry
              </Button>
            </HStack>
            <Text color="red.500" fontSize="sm" mt={2}>{serverError}</Text>
            <Text color="gray.600" fontSize="xs" mt={2}>
              <strong>Quick Fix:</strong> Open terminal → Navigate to server folder → Run: <code style={{background: '#eee', padding: '2px 6px', borderRadius: '4px'}}>node hfProxy.js</code>
            </Text>
          </Box>
        )}

        {/* Chat Messages */}
        <Box
          bg="white"
          borderRadius="2xl"
          boxShadow="2xl"
          w="full"
          flex={1}
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          <Box
            flex={1}
            overflowY="auto"
            p={6}
            css={{
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
              },
            }}
          >
            {messages.map((msg, idx) => (
              <Flex
                key={idx}
                justify={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
                mb={4}
                align="flex-start"
              >
                {msg.sender === 'bot' && (
                  <Avatar size="sm" icon={<FaRobot />} bg="teal.500" mr={2} />
                )}
                <Box maxW="70%">
                  <Box
                    bg={msg.sender === 'user' ? 'teal.500' : 'gray.100'}
                    color={msg.sender === 'user' ? 'white' : 'gray.800'}
                    px={4}
                    py={3}
                    borderRadius="lg"
                    boxShadow="sm"
                    position="relative"
                    whiteSpace="pre-wrap"
                    wordBreak="break-word"
                  >
                    {msg.text}
                    <IconButton
                      icon={<FaCopy />}
                      size="xs"
                      position="absolute"
                      top={1}
                      right={1}
                      variant="ghost"
                      colorScheme={msg.sender === 'user' ? 'whiteAlpha' : 'gray'}
                      onClick={() => copyMessage(msg.text)}
                      aria-label="Copy message"
                    />
                  </Box>
                  <Text fontSize="xs" color="gray.500" mt={1} ml={2}>
                    {formatTime(msg.timestamp)}
                  </Text>
                </Box>
                {msg.sender === 'user' && (
                  <Avatar size="sm" icon={<FaUser />} bg="teal.300" ml={2} />
                )}
              </Flex>
            ))}
            
            {isTyping && (
              <Flex justify="flex-start" align="flex-start" mb={4}>
                <Avatar size="sm" icon={<FaRobot />} bg="teal.500" mr={2} />
                <Box bg="gray.100" px={4} py={3} borderRadius="lg">
                  <HStack spacing={2}>
                    <Box w={2} h={2} bg="gray.400" borderRadius="full" animation="bounce 1.4s infinite ease-in-out" />
                    <Box w={2} h={2} bg="gray.400" borderRadius="full" animation="bounce 1.4s infinite ease-in-out 0.2s" />
                    <Box w={2} h={2} bg="gray.400" borderRadius="full" animation="bounce 1.4s infinite ease-in-out 0.4s" />
                  </HStack>
                </Box>
              </Flex>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <Box px={6} pb={4}>
              <Text fontSize="sm" color="gray.600" mb={2} fontWeight="medium">💡 Suggested questions:</Text>
              <Wrap spacing={2}>
                {suggestedQuestions.map((question, idx) => (
                  <WrapItem key={idx}>
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="teal"
                      onClick={() => handleSend(question)}
                      isDisabled={isLoading}
                    >
                      {question}
                    </Button>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>
          )}

          {/* Input Area */}
          <Box p={4} borderTop="1px" borderColor="gray.200">
            <HStack>
              <Input
                placeholder="Type your health question..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && !isLoading && handleSend()}
                bg="gray.50"
                border="2px"
                borderColor="gray.200"
                _focus={{ borderColor: 'teal.400', bg: 'white' }}
                isDisabled={isLoading}
                size="lg"
              />
              <IconButton
                icon={<FaPaperPlane />}
                colorScheme="teal"
                onClick={() => handleSend()}
                isLoading={isLoading}
                isDisabled={!input.trim() || isLoading}
                size="lg"
                aria-label="Send message"
              />
            </HStack>
            <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
              ⚠️ This AI provides general information only. Always consult healthcare professionals for medical advice.
            </Text>
          </Box>
        </Box>
      </VStack>
      
      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
        `}
      </style>
    </Box>
  );
}