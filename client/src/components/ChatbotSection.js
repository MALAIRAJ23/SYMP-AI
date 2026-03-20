import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Input, VStack, HStack, Text, Badge } from '@chakra-ui/react';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { CHAT_API_BASE_URL } from '../config/api';

export default function ChatbotSection() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am your AI health assistant. Ask me about symptoms or health concerns.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (open && boxRef.current) {
      // scroll to bottom when opened
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [open, messages]);

  const sendMessage = async () => {
    const text = (input || '').trim();
    if (!text) return;
    const user = { sender: 'user', text };
    setMessages(m => [...m, user]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${CHAT_API_BASE_URL}/api/cohere-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      });
      
      if (!res.ok) {
        console.error('API response not OK:', res.status, res.statusText);
        setMessages(m => [...m, { sender: 'bot', text: 'Sorry, the server returned an error. Please try again.' }]);
        return;
      }
      
      const data = await res.json();
      console.log('Received data:', data);
      
      const reply = data?.response || data?.reply || data?.error || 'Sorry, I could not get a reply right now.';
      setMessages(m => [...m, { sender: 'bot', text: reply }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(m => [...m, { sender: 'bot', text: 'Connection error. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <Box position="fixed" bottom="20px" right="20px" zIndex={9999}>
        <Box display="flex" alignItems="center" justifyContent="center">
          <IconButton
            aria-label={open ? 'Close chat' : 'Open chat'}
            icon={open ? <FaTimes /> : <FaRobot />}
            colorScheme="teal"
            borderRadius="full"
            size="lg"
            onClick={() => setOpen(v => !v)}
          />
        </Box>
      </Box>

      {/* Chat window */}
      {open && (
        <Box position="fixed" bottom="90px" right="20px" width={{ base: '90%', sm: '360px' }} bg="white" borderRadius="md" boxShadow="lg" overflow="hidden" zIndex={9999}>
          <VStack spacing={0} align="stretch">
            <HStack px={3} py={2} bg="teal.500" color="white" justify="space-between">
              <HStack>
                <FaRobot />
                <Text fontWeight="bold">AI Health Assistant</Text>
                <Badge ml={2} colorScheme="yellow">Beta</Badge>
              </HStack>
            </HStack>

            <Box ref={boxRef} maxH="300px" overflowY="auto" p={3} bg="gray.50">
              {messages.map((m, i) => (
                <Box key={i} mb={3} textAlign={m.sender === 'user' ? 'right' : 'left'}>
                  <Box display="inline-block" bg={m.sender === 'user' ? 'teal.100' : 'gray.100'} px={3} py={2} borderRadius="md">
                    <Text fontSize="sm">{m.text}</Text>
                  </Box>
                </Box>
              ))}
              {isLoading && <Text fontSize="sm" color="gray.500">Thinking...</Text>}
            </Box>

            <HStack p={3} bg="white">
              <Input placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
              <IconButton aria-label="Send" icon={<FaPaperPlane />} colorScheme="teal" onClick={sendMessage} isLoading={isLoading} />
            </HStack>
          </VStack>
        </Box>
      )}
    </>
  );
}