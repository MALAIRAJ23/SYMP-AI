import React, { useState } from 'react';
import {
  Box, Heading, Text, SimpleGrid, Image, Tag, VStack, Divider, Input, InputGroup, InputLeftElement, Flex, Badge, Button, HStack, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, ModalFooter
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { FaLeaf } from 'react-icons/fa';

const yogaCategories = [
  {
    category: 'Back Health',
    color: 'teal.100',
    asanas: [
      {
        name: 'Bhujangasana',
        english: 'Cobra Pose',
        benefit: 'Strengthens the spine and relieves back pain.',
        how: 'Lie on your stomach. Place your palms under your shoulders. Inhale and lift your chest, keeping elbows close. Hold, then release.',
        image: 'https://th.bing.com/th/id/OIP._lzTpVGaaZ06tniePUznNQHaEq?w=284&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
      },
      {
        name: 'Setu Bandhasana',
        english: 'Bridge Pose',
        benefit: 'Stretches the chest, neck, and spine; relieves backache.',
        how: 'Lie on your back. Bend knees, feet hip-width apart. Press feet and arms into the floor, lift hips. Hold, then lower.',
        image: 'https://th.bing.com/th/id/OIP.upY26vph9DqJ_-hdi71yTAHaHa?w=165&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
      },
      {
        name: 'Balasana',
        english: 'Child’s Pose',
        benefit: 'Gently stretches the back and calms the mind.',
        how: 'Kneel on the mat. Sit back on your heels, fold forward, and stretch arms ahead. Rest forehead on the mat.',
        image: 'https://th.bing.com/th/id/OIP.NhhAZ00V8qUDRlSNlVxEGAAAAA?w=228&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
      },
    ],
  },
  {
    category: 'Flexibility',
    color: 'blue.100',
    asanas: [
      {
        name: 'Trikonasana',
        english: 'Triangle Pose',
        benefit: 'Stretches legs, hips, and spine; improves balance.',
        how: 'Stand with feet wide. Turn one foot out, extend arms. Reach forward and tilt, bringing hand to shin or floor, other arm up.',
        image: 'https://th.bing.com/th/id/OIP.F0P21xgBtLNnSQkiNVtDfgHaHa?w=199&h=199&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
      },
      {
        name: 'Adho Mukha Svanasana',
        english: 'Downward-Facing Dog',
        benefit: 'Stretches the whole body and energizes.',
        how: 'Start on hands and knees. Lift hips up and back, straightening legs and arms. Heels toward floor, head relaxed.',
        image: 'https://th.bing.com/th/id/OIP.abtjTqdLMBfnvH81-T89nwHaHa?w=189&h=189&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
      },
      {
        name: 'Uttanasana',
        english: 'Standing Forward Bend',
        benefit: 'Stretches hamstrings and relieves stress.',
        how: 'Stand tall. Exhale and fold forward from hips, keeping spine long. Let head hang, hands to floor or shins.',
        image: 'https://th.bing.com/th/id/OIP.ZSScmtBqObg4u3db-11kAQHaHa?w=216&h=216&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
      },
    ],
  },
  {
    category: 'Strength',
    color: 'orange.100',
    asanas: [
      {
        name: 'Navasana',
        english: 'Boat Pose',
        benefit: 'Strengthens core and hip flexors.',
        how: 'Sit with knees bent, feet on floor. Lean back, lift feet, straighten legs and arms forward. Balance on sit bones.',
        image: 'https://static.vecteezy.com/system/resources/previews/037/043/856/non_2x/woman-doing-paripurna-navasana-or-boat-pose-female-cartoon-character-practicing-hatha-yoga-gymnastics-training-vector.jpg',
      },
      {
        name: 'Utkatasana',
        english: 'Chair Pose',
        benefit: 'Strengthens thighs, ankles, and back.',
        how: 'Stand with feet together. Inhale, raise arms, bend knees, and sit back as if into a chair. Hold.',
        image: 'https://th.bing.com/th/id/OIP.nDJlFozc8j8NZVBMJy83EgHaHZ?w=190&h=189&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
      },
      {
        name: 'Phalakasana',
        english: 'Plank Pose',
        benefit: 'Builds core and upper body strength.',
        how: 'Start on hands and knees. Step feet back, forming a straight line from head to heels. Engage core and hold.',
        image: 'https://th.bing.com/th/id/OIP.bgTZlHBiBz5tBU42pQFQKgHaHa?w=188&h=188&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
      },
    ],
  },
  {
    category: 'Balance',
    color: 'pink.100',
    asanas: [
      {
        name: 'Vrikshasana',
        english: 'Tree Pose',
        benefit: 'Improves balance and stability in the legs.',
        how: 'Stand tall. Place one foot on inner thigh of opposite leg. Bring palms together at chest or overhead. Hold, then switch.',
        image: 'data:image/webp;base64,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',
      },
      {
        name: 'Garudasana',
        english: 'Eagle Pose',
        benefit: 'Improves balance and stretches shoulders.',
        how: 'Stand tall. Bend knees, wrap one leg over the other. Cross arms at elbows and wrists. Hold, then switch sides.',
        image: 'https://th.bing.com/th/id/OIP.kXGroHD6jgh2pPD9WUZLggHaHa?w=196&h=196&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
      },
      {
        name: 'Ardha Chandrasana',
        english: 'Half Moon Pose',
        benefit: 'Improves balance and strengthens legs.',
        how: 'From Triangle Pose, bend front knee, place hand on floor, lift back leg and arm. Balance and open chest.',
        image: 'data:image/webp;base64,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',
      },
    ],
  },
  {
    category: 'Full Body Flows',
    color: 'yellow.100',
    asanas: [
      {
        name: 'Surya Namaskar',
        english: 'Sun Salutation',
        benefit: 'Energizes and stretches the entire body.',
        how: 'Stand at the front of the mat. Inhale, raise arms. Exhale, fold forward. Inhale, lift chest. Exhale, step back to plank. Lower down, inhale to cobra, exhale to downward dog. Step forward, inhale, rise up.',
        image: 'https://th.bing.com/th/id/OIP.QoEj3Pd-hAZ-abo2DPGaBAHaGW?w=210&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
      },
      {
        name: 'Tadasana',
        english: 'Mountain Pose',
        benefit: 'Improves posture and grounding.',
        how: 'Stand tall, feet together, arms at sides. Distribute weight evenly. Engage thighs, lift chest, reach crown upward.',
        image: 'https://th.bing.com/th/id/OIP.JJlxQLCXdbRqZLZE8MVBpwHaE8?w=271&h=182&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
      },
      {
        name: 'Savasana',
        english: 'Corpse Pose',
        benefit: 'Relaxes the body and calms the mind.',
        how: 'Lie flat on your back, arms and legs relaxed. Close eyes, breathe naturally, and let go of tension.',
        image: 'https://th.bing.com/th/id/OIP.5rVZ05k5kEeyRKJMupsq7QHaHa?w=172&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
      },
    ],
  },
  {
    category: 'Breathing / Pranayama',
    color: 'cyan.100',
    asanas: [
      {
        name: 'Sukhasana',
        english: 'Easy Pose',
        benefit: 'Promotes calm and focus for meditation.',
        how: 'Sit cross-legged, hands on knees. Keep spine straight, relax shoulders. Close eyes and breathe deeply.',
        image: 'https://th.bing.com/th/id/OIP.p71eRz7YssMxX0kjT5C-JwHaHa?w=200&h=200&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
      },
      {
        name: 'Padmasana',
        english: 'Lotus Pose',
        benefit: 'Opens hips and promotes meditation.',
        how: 'Sit with legs extended. Bend right knee, place foot on left thigh. Repeat with left. Hands on knees, spine tall.',
        image: 'https://th.bing.com/th/id/OIP.A5n6rhmEjxjYeZpCOkfbfAHaHa?w=184&h=184&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
      },
      {
        name: 'Vajrasana',
        english: 'Thunderbolt Pose',
        benefit: 'Aids digestion and calms the mind.',
        how: 'Kneel on the mat, sit back on heels, hands on thighs. Keep spine straight, breathe deeply.',
        image: 'https://th.bing.com/th/id/OIP._A_alSfJMPIHaSIx2wxe0wHaHa?w=195&h=195&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
      },
    ],
  },
  {
    category: 'Stress Relief',
    color: 'purple.100',
    asanas: [
      {
        name: 'Shashankasana',
        english: 'Rabbit Pose',
        benefit: 'Relieves stress and stretches the back.',
        how: 'Kneel, sit back on heels. Exhale, lower forehead to mat, arms extended. Hold and breathe.',
        image: 'https://th.bing.com/th/id/OIP.Fev2ka1k6rITXD_JhWu6mwHaHa?w=173&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
      },
      {
        name: 'Viparita Karani',
        english: 'Legs-Up-the-Wall Pose',
        benefit: 'Relaxes legs and calms the nervous system.',
        how: 'Sit next to a wall. Lie back, swing legs up the wall, arms at sides. Close eyes and relax.',
        image: 'https://th.bing.com/th/id/OIP.XmkZoG8QTgbdqP04Vr7n-gHaHa?w=201&h=200&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
      },
      {
        name: 'Makarasana',
        english: 'Crocodile Pose',
        benefit: 'Relaxes the whole body and relieves fatigue.',
        how: 'Lie on your stomach, arms folded under head, legs apart. Rest head on arms, close eyes, and relax.',
        image: 'https://th.bing.com/th/id/OIP.lbMkhDM31ftpCd_YwuXMBwHaFU?w=234&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
      },
    ],
  },
];

const categoryColors = {
  'Back Health': 'teal.100',
  'Flexibility': 'blue.100',
  'Strength': 'orange.100',
  'Balance': 'pink.100',
  'Full Body Flows': 'yellow.100',
  'Breathing / Pranayama': 'cyan.100',
  'Stress Relief': 'purple.100',
};

export default function YogaPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedAsana, setSelectedAsana] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Flatten all asanas for search
  const allAsanas = yogaCategories.flatMap(cat =>
    cat.asanas.map(asana => ({ ...asana, category: cat.category, color: cat.color }))
  );

  // Unique categories for filter chips
  const categories = ['All', ...yogaCategories.map(cat => cat.category)];

  // Filter asanas by search and category
  const filteredAsanas = allAsanas.filter(asana => {
    const matchesSearch =
      asana.name.toLowerCase().includes(search.toLowerCase()) ||
      asana.english.toLowerCase().includes(search.toLowerCase()) ||
      asana.benefit.toLowerCase().includes(search.toLowerCase()) ||
      asana.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === 'All' || asana.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const heroBg = 'linear(to-br, #f0fff0 0%, #e0f7fa 100%)';

  // Helper to split 'how' into steps (by ". " or numbered list)
  function getSteps(how) {
    if (!how) return [];
    // Try to split by numbers (1. 2. 3.)
    const numbered = how.match(/\d+\.\s[^\d]+/g);
    if (numbered) return numbered.map(s => s.trim());
    // Otherwise split by sentences
    return how.split(/(?<=\.)\s+/).map(s => s.trim()).filter(Boolean);
  }

  return (
    <Box minH="100vh" bgGradient="linear(to-br, #f0fff0 0%, #e0f7fa 100%)" p={{ base: 0, md: 0 }}>
      {/* Hero Section */}
      <Box
        w="100%"
        py={{ base: 10, md: 16 }}
        px={{ base: 4, md: 0 }}
        bgGradient={heroBg}
        mb={8}
        textAlign="center"
        position="relative"
      >
        <Flex justify="center" align="center" mb={4}>
          <Box
            bg="teal.100"
            borderRadius="full"
            p={4}
            boxShadow="lg"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            mr={2}
          >
            <FaLeaf size={40} color="#319795" />
          </Box>
        </Flex>
        <Heading size="2xl" color="teal.700" fontWeight="extrabold" letterSpacing={2} mb={2}>
          YogAura
        </Heading>
        <Text fontSize="xl" color="teal.600" fontStyle="italic" mb={2}>
          Elevate your well-being with curated yoga flows for every need.
        </Text>
        <Text fontSize="md" color="gray.500" maxW="600px" mx="auto">
          “Yoga is the journey of the self, through the self, to the self.” – The Bhagavad Gita
        </Text>
      </Box>
      {/* Search and Category Filters */}
      <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="center" gap={4} mb={8} px={{ base: 2, md: 8 }}>
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="teal.400" />
          </InputLeftElement>
          <Input
            type="text"
            placeholder="Search asana, benefit, or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            bg="white"
            borderRadius="full"
            fontSize="lg"
            boxShadow="sm"
          />
        </InputGroup>
        <HStack spacing={2} wrap="wrap" justify="center">
          {categories.map(cat => (
            <Button
              key={cat}
              size="sm"
              borderRadius="full"
              colorScheme={activeCategory === cat ? 'teal' : 'gray'}
              variant={activeCategory === cat ? 'solid' : 'outline'}
              onClick={() => setActiveCategory(cat)}
              fontWeight={activeCategory === cat ? 700 : 500}
              px={5}
              py={2}
              boxShadow={activeCategory === cat ? 'md' : undefined}
              _focus={{ outline: 'none' }}
            >
              {cat}
            </Button>
          ))}
        </HStack>
      </Flex>
      {/* Card Grid */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={10} px={{ base: 2, md: 8 }}>
        {filteredAsanas.length === 0 ? (
          <VStack w="100%" py={16} spacing={4} gridColumn="1/-1">
            <Image src="https://img.icons8.com/color/96/000000/lotus-position.png" alt="No asanas" boxSize="80px" />
            <Text color="gray.500" fontSize="xl" textAlign="center">No asanas found. Try a different search or filter.</Text>
          </VStack>
        ) : (
          filteredAsanas.map(asana => (
            <Box
              key={asana.name + asana.category}
              bg={categoryColors[asana.category] || 'white'}
              borderRadius="2xl"
              boxShadow="lg"
              p={7}
              display="flex"
              flexDirection="column"
              alignItems="center"
              transition="transform 0.2s"
              _hover={{ transform: 'scale(1.04)', boxShadow: '2xl', bg: 'teal.50' }}
              minH="440px"
              position="relative"
              cursor="pointer"
              onClick={() => { setSelectedAsana(asana); onOpen(); }}
            >
              <Image
                src={asana.image}
                alt={asana.name}
                boxSize="160px"
                objectFit="contain"
                borderRadius="xl"
                mb={4}
                bg="white"
                p={4}
                fallbackSrc="https://via.placeholder.com/160x120?text=Yoga+Pose"
              />
              <Tag colorScheme="teal" mb={2} fontSize="md" borderRadius="full" px={4} py={1} fontWeight={700}>
                {asana.name}
              </Tag>
              <Text color="gray.700" fontWeight="bold" mb={1} fontSize="lg">
                {asana.english}
              </Text>
              <Badge colorScheme={asana.color.split('.')[0]} mb={2} fontSize="sm" borderRadius="full" px={3} py={1}>
                {asana.category}
              </Badge>
              <Text color="teal.700" fontSize="sm" mb={2} fontStyle="italic" textAlign="center">
                {asana.benefit}
              </Text>
              <Divider my={2} />
              <Text color="gray.700" fontSize="sm" textAlign="center" mb={4}>
                <b>How:</b> {asana.how}
              </Text>
            </Box>
          ))
        )}
      </SimpleGrid>
      <Box h={16} />
      {/* Modal for step-by-step instructions */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl" p={2}>
          <ModalHeader textAlign="center">
            {selectedAsana?.name} <Text as="span" color="gray.500" fontSize="md">({selectedAsana?.english})</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="center">
              <Image
                src={selectedAsana?.image}
                alt={selectedAsana?.name}
                boxSize="120px"
                objectFit="contain"
                borderRadius="xl"
                bg="white"
                p={3}
                fallbackSrc="https://via.placeholder.com/120x90?text=Yoga+Pose"
              />
              <Text color="teal.700" fontSize="md" fontStyle="italic" textAlign="center">
                {selectedAsana?.benefit}
              </Text>
              <Divider />
              <Box w="100%">
                <Heading size="sm" mb={2} color="teal.600">Step-by-step</Heading>
                <VStack align="start" spacing={2}>
                  {getSteps(selectedAsana?.how).map((step, idx) => (
                    <Box key={idx} pl={2} pr={2}>
                      <Text as="span" color="teal.500" fontWeight="bold">{idx + 1}.</Text> {step}
                    </Box>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" borderRadius="full" onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
} 