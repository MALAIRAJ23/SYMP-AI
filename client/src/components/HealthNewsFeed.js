import { Box, Heading, SimpleGrid, Text, Link, VStack, useColorModeValue, Skeleton, Button, Badge, HStack, useToast, IconButton, Tooltip } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaExternalLinkAlt, FaNewspaper, FaChevronDown, FaChevronUp, FaSync } from 'react-icons/fa';



export default function HealthNewsFeed() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const sectionBg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('teal.50', 'teal.900');
  const accentColor = useColorModeValue('teal.400', 'teal.300');
  const toast = useToast();

  // Fetch real health news from NewsAPI
  const fetchHealthNews = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      // Using NewsAPI.org - Free tier allows 100 requests/day
      // Note: Get a free API key from https://newsapi.org/
      const API_KEY = '5361639331d040f0a356cc105cc5d875';
      const query = 'health OR medical OR disease OR wellness OR medicine';
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'ok' && data.articles) {
        const formattedNews = data.articles
          .filter(article => article.title && article.description && article.url)
          .slice(0, 8)
          .map(article => ({
            title: article.title,
            summary: article.description,
            url: article.url,
            source: article.source.name,
            date: new Date(article.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),
            image: article.urlToImage || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80'
          }));
        
        setNews(formattedNews);
        setLastFetched(new Date());
        
        // Save to localStorage for offline access
        localStorage.setItem('healthNews', JSON.stringify(formattedNews));
        localStorage.setItem('healthNewsTimestamp', new Date().toISOString());
        
        if (isRefresh) {
          toast({
            title: 'News Updated',
            description: 'Successfully fetched latest health news',
            status: 'success',
            duration: 2000,
            isClosable: true,
          });
        }
      } else {
        throw new Error('Invalid response from news API');
      }
      
    } catch (err) {
      console.error('Error fetching health news:', err);
      setError(err.message);
      
      // Load from localStorage if available
      const cachedNews = localStorage.getItem('healthNews');
      if (cachedNews) {
        setNews(JSON.parse(cachedNews));
        const timestamp = localStorage.getItem('healthNewsTimestamp');
        setLastFetched(timestamp ? new Date(timestamp) : null);
        
        toast({
          title: 'Using Cached News',
          description: 'Showing previously loaded news articles',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Failed to Load News',
          description: 'Unable to fetch health news. Please try again later.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch news on component mount
  useEffect(() => {
    // Check if we have cached news less than 1 hour old
    const cachedNews = localStorage.getItem('healthNews');
    const timestamp = localStorage.getItem('healthNewsTimestamp');
    
    if (cachedNews && timestamp) {
      const cacheAge = Date.now() - new Date(timestamp).getTime();
      const oneHour = 60 * 60 * 1000;
      
      if (cacheAge < oneHour) {
        // Use cached news if less than 1 hour old
        setNews(JSON.parse(cachedNews));
        setLastFetched(new Date(timestamp));
        setLoading(false);
        return;
      }
    }
    
    // Otherwise fetch fresh news
    fetchHealthNews();
  }, []);

  const handleRefresh = () => {
    fetchHealthNews(true);
  };

  const formatLastFetched = () => {
    if (!lastFetched) return '';
    const now = new Date();
    const diff = Math.floor((now - lastFetched) / 1000 / 60); // minutes
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} min ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <Box id="health-news" py={16} px={{ base: 2, md: 8 }} bg={sectionBg}>
      <Box maxW="1100px" mx="auto">
        <HStack justifyContent="center" mb={4} spacing={4}>
          <Heading size="xl" textAlign="center" color="teal.700" fontWeight="bold" letterSpacing="tight">
            Health News Feed
          </Heading>
          <Tooltip label="Refresh news" placement="top">
            <IconButton
              icon={<FaSync />}
              onClick={handleRefresh}
              isLoading={refreshing}
              colorScheme="teal"
              variant="ghost"
              size="md"
              aria-label="Refresh news"
              isDisabled={loading}
            />
          </Tooltip>
        </HStack>
        {lastFetched && (
          <Text fontSize="sm" color="gray.500" textAlign="center" mb={2}>
            Last updated: {formatLastFetched()}
          </Text>
        )}
        <Text color="gray.600" mb={10} textAlign="center" fontSize="lg">
          Stay informed with the latest news on medical research, outbreaks, and health policy. Curated from trusted sources.
        </Text>
        {error && !news.length && (
          <Box bg="red.50" p={4} borderRadius="md" mb={4}>
            <Text color="red.600" textAlign="center">
              Unable to load news. Please check your internet connection and try again.
            </Text>
            <Button onClick={handleRefresh} colorScheme="red" size="sm" mt={2} mx="auto" display="block">
              Retry
            </Button>
          </Box>
        )}
        <Box maxH="70vh" overflowY="auto" pr={2}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            {(loading ? Array(6).fill({}) : news).map((item, idx) => (
              <Box
                key={item.title || idx}
                p={0}
                bg={cardBg}
                borderRadius="2xl"
                boxShadow="md"
                borderWidth="1px"
                borderColor={borderColor}
                borderLeftWidth="8px"
                borderLeftColor={accentColor}
                transition="box-shadow 0.2s, transform 0.2s"
                _hover={{ boxShadow: 'xl', transform: 'translateY(-4px)', borderLeftColor: 'teal.600', background: 'teal.50' }}
                display="flex"
                flexDirection="column"
                minH="120px"
                justifyContent="flex-start"
                overflow="hidden"
              >
                {/* Image Preview (only in expanded mode) */}
                {expandedIdx === idx && (
                  <Skeleton isLoaded={!loading} borderRadius="0" minH="160px">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    )}
                  </Skeleton>
                )}
                <Box p={6} display="flex" flexDirection="column" flex={1}>
                  {/* Headline Row */}
                  <HStack align="center" spacing={2} mb={expandedIdx === idx ? 2 : 0} cursor="pointer" onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}>
                    <Box pt={1}><FaNewspaper color={accentColor} size={22} /></Box>
                    <Skeleton isLoaded={!loading} height="28px" width="100%">
                      <Text as="h3" fontWeight="bold" fontSize="xl" color="teal.700" textAlign="left" noOfLines={2}>
                        {item.title}
                      </Text>
                    </Skeleton>
                    <Box pl={2} pt={1}>{expandedIdx === idx ? <FaChevronUp /> : <FaChevronDown />}</Box>
                  </HStack>
                  {/* Expanded Content */}
                  {expandedIdx === idx && (
                    <>
                      <Skeleton isLoaded={!loading} height="20px" width="100%" mb={2}>
                        <Text color="gray.700" fontSize="md" textAlign="left">
                          {item.summary}
                        </Text>
                      </Skeleton>
                      <HStack spacing={3} mt={1} mb={4}>
                        <Skeleton isLoaded={!loading} height="24px" width="80px">
                          <Badge colorScheme="blue" fontSize="0.95em">
                            {item.source}
                          </Badge>
                        </Skeleton>
                        <Skeleton isLoaded={!loading} height="24px" width="60px">
                          <Badge colorScheme="gray" fontSize="0.95em">
                            {item.date}
                          </Badge>
                        </Skeleton>
                      </HStack>
                      <Skeleton isLoaded={!loading} height="40px" width="100%" mt={2}>
                        <Button
                          as={Link}
                          href={item.url}
                          colorScheme="blue"
                          variant="outline"
                          borderRadius="full"
                          w="100%"
                          leftIcon={<FaExternalLinkAlt />}
                          target="_blank"
                          rel="noopener noreferrer"
                          mt={2}
                          isDisabled={loading}
                          aria-label={`Read full article: ${item.title}`}
                        >
                          Read Full Article
                        </Button>
                      </Skeleton>
                    </>
                  )}
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Box>
    </Box>
  );
} 
