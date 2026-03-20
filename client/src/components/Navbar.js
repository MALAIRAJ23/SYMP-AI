import { Box, Flex, Link, Heading, Image, Button, Icon } from '@chakra-ui/react';
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { FaCalendarCheck } from 'react-icons/fa';

const navLinks = [
  { label: 'Home', type: 'section', target: 'home', icon: 'https://img.icons8.com/ios-filled/50/4ecca3/home.png' },
  { label: 'Features', type: 'section', target: 'features', icon: 'https://img.icons8.com/ios-filled/50/4ecca3/settings.png' },
  { label: 'Chatbot', type: 'route', target: '/feature/ai-chatbot', icon: 'https://img.icons8.com/ios-filled/50/4ecca3/chat.png' },
  { label: 'Your Appointments', type: 'route', target: '/appointments', icon: null },
  { label: 'Health News Feed', type: 'section', target: 'health-news', icon: 'https://img.icons8.com/ios-filled/50/4ecca3/news.png' },
  { label: 'Contact', type: 'section', target: 'contact', icon: 'https://img.icons8.com/ios-filled/50/4ecca3/contacts.png' },
];

// SVG path for a wavy/cloud-like right border
const cloudClipPath =
  'polygon(0 0, 90% 0, 100% 10%, 95% 20%, 100% 30%, 95% 40%, 100% 50%, 95% 60%, 100% 70%, 95% 80%, 100% 90%, 90% 100%, 0 100%)';

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const handleSignOut = () => signOut(auth);

  // Helper to scroll to section by id
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handler for nav link click
  const handleNavClick = (link) => (e) => {
    if (link.type === 'route') {
      navigate(link.target);
      return;
    }
    // For section links
    e.preventDefault();
    if (location.pathname === '/') {
      // Already on home, just scroll
      setTimeout(() => scrollToSection(link.target), 50);
    } else {
      // Navigate to home, then scroll after render
      navigate('/', { replace: false });
      setTimeout(() => scrollToSection(link.target), 400); // Delay for home render
    }
  };
  return (
    <Box
      as="nav"
      position="fixed"
      left={0}
      top={0}
      h="100vh"
      zIndex="100"
      bg="whiteAlpha.90"
      boxShadow="lg"
      backdropFilter="blur(8px)"
      borderRightRadius={expanded ? '2xl' : 'xl'}
      w={expanded ? '220px' : '60px'}
      transition="all 0.5s cubic-bezier(.4,2,.6,1)"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      display="flex"
      flexDirection="column"
      alignItems={expanded ? 'flex-start' : 'center'}
      py={6}
      px={2}
      justifyContent="space-between"
      style={{
        clipPath: cloudClipPath,
        WebkitClipPath: cloudClipPath,
      }}
    >
      <Box w="100%">
        {/* Logo at the top */}
        <Box mb={10} w="100%" display="flex" justifyContent={expanded ? 'flex-start' : 'center'} alignItems="center">
          <Image src="/logo.jpg" alt="SympAI Logo" boxSize={expanded ? '40px' : '36px'} ml={expanded ? 4 : 0} borderRadius="md" style={{ transition: 'all 0.5s cubic-bezier(.4,2,.6,1)' }} />
          <Box
            as="span"
            style={{
              display: 'inline-block',
              opacity: expanded ? 1 : 0,
              transform: expanded ? 'translateX(0)' : 'translateX(-32px)',
              transition: 'opacity 0.5s cubic-bezier(.4,2,.6,1), transform 0.5s cubic-bezier(.4,2,.6,1)',
              whiteSpace: 'nowrap',
            }}
          >
            <Heading size="md" color="teal.600" letterSpacing={1} ml={3}>{expanded ? 'SympAI' : ''}</Heading>
          </Box>
        </Box>
        <Flex direction="column" gap={3} w="100%">
          {navLinks.map((link) => (
            <Button
              key={link.label}
              onClick={handleNavClick(link)}
              fontWeight="500"
              color="gray.700"
              px={expanded ? 4 : 0}
              py={2}
              borderRadius="md"
              variant="ghost"
              transition="all 0.5s cubic-bezier(.4,2,.6,1)"
              _hover={{ color: 'teal.600', background: 'teal.50', textDecoration: 'none' }}
              style={{
                textAlign: expanded ? 'left' : 'center',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: expanded ? 'flex-start' : 'center',
                transition: 'all 0.5s cubic-bezier(.4,2,.6,1)',
              }}
            >
              {link.icon ? (
                <Image src={link.icon} alt={link.label + ' icon'} boxSize="24px" mr={expanded ? 3 : 0} style={{ transition: 'all 0.5s cubic-bezier(.4,2,.6,1)' }} />
              ) : (
                <Icon as={FaCalendarCheck} boxSize="24px" mr={expanded ? 3 : 0} />
              )}
              <Box
                as="span"
                style={{
                  display: 'inline-block',
                  opacity: expanded ? 1 : 0,
                  transform: expanded ? 'translateX(0)' : 'translateX(-32px)',
                  transition: 'opacity 0.5s cubic-bezier(.4,2,.6,1), transform 0.5s cubic-bezier(.4,2,.6,1)',
                  whiteSpace: 'nowrap',
                }}
              >
                {expanded ? link.label : ''}
              </Box>
            </Button>
          ))}
        </Flex>
      </Box>
      {/* Sign Out button at the bottom */}
      <Button
        onClick={handleSignOut}
        colorScheme="teal"
        variant="outline"
        w={expanded ? '80%' : '40px'}
        mx={expanded ? 4 : 'auto'}
        mb={2}
        leftIcon={expanded ? <Image src="https://img.icons8.com/ios-filled/24/4ecca3/logout-rounded-left.png" alt="Sign Out" boxSize="20px" /> : undefined}
        p={expanded ? 3 : 2}
        borderRadius="md"
        fontWeight="bold"
        fontSize={expanded ? 'md' : '0px'}
        display="flex"
        alignItems="center"
        justifyContent={expanded ? 'flex-start' : 'center'}
        title="Sign Out"
      >
        {expanded && 'Sign Out'}
        {!expanded && <Image src="https://img.icons8.com/ios-filled/24/4ecca3/logout-rounded-left.png" alt="Sign Out" boxSize="20px" />}
      </Button>
    </Box>
  );
} 