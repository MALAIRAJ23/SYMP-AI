import React, { useEffect, useState } from 'react';
import {
  Box, Heading, Input, Button, Text, Flex, List, ListItem, IconButton,
  Select, Badge, Checkbox, Tabs, TabList, Tab, TabPanels, TabPanel,
  useToast, VStack, HStack, Divider, Menu, MenuButton, MenuList, MenuItem
} from '@chakra-ui/react';
import { CloseIcon, BellIcon, CheckIcon, TimeIcon, RepeatIcon } from '@chakra-ui/icons';
import { FaPills, FaClock, FaCheckCircle, FaHistory } from 'react-icons/fa';
import Papa from 'papaparse';

export default function MedicationReminderPage() {
  const [tablets, setTablets] = useState([]);
  const [medicineInput, setMedicineInput] = useState('');
  const [filteredTablets, setFilteredTablets] = useState([]);
  const [selectedTablet, setSelectedTablet] = useState(null);
  const [reminderTime, setReminderTime] = useState('');
  const [frequency, setFrequency] = useState('once');
  const [dosage, setDosage] = useState('1 pill');
  const [reminders, setReminders] = useState([]);
  const [history, setHistory] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const toast = useToast();

  // Load tablets CSV
  useEffect(() => {
    fetch('/tablets.csv')
      .then(res => res.text())
      .then(csv => {
        Papa.parse(csv, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            setTablets(results.data.filter(row => row.name));
          }
        });
      });
  }, []);

  // Request notification permission and load from localStorage
  useEffect(() => {
    // Request notification permission
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
          if (permission === 'granted') {
            toast({
              title: 'Notifications Enabled',
              description: 'You will receive medication reminders',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
          }
        });
      } else {
        setNotificationPermission(Notification.permission);
      }
    }

    // Load reminders and history from localStorage
    const savedReminders = localStorage.getItem('medicationReminders');
    const savedHistory = localStorage.getItem('medicationHistory');
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save reminders to localStorage whenever they change
  useEffect(() => {
    if (reminders.length > 0) {
      localStorage.setItem('medicationReminders', JSON.stringify(reminders));
    }
  }, [reminders]);

  // Save history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('medicationHistory', JSON.stringify(history));
    }
  }, [history]);

  // Check for due reminders every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      reminders.forEach((reminder) => {
        if (!reminder.taken && !reminder.snoozed) {
          const reminderTimes = getReminderTimes(reminder);
          
          reminderTimes.forEach(time => {
            if (time === currentTime && !reminder.notifiedToday) {
              // Show notification
              showNotification(reminder);
              // Mark as notified today
              setReminders(prev => prev.map(r => 
                r.id === reminder.id ? { ...r, notifiedToday: true } : r
              ));
            }
          });
        }
      });

      // Reset notifiedToday at midnight
      if (currentTime === '00:00') {
        setReminders(prev => prev.map(r => ({ ...r, notifiedToday: false, taken: false })));
      }
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    checkReminders(); // Check immediately on mount

    return () => clearInterval(interval);
  }, [reminders]);

  const getReminderTimes = (reminder) => {
    const times = [reminder.time];
    
    if (reminder.frequency === 'twice') {
      const [hours, minutes] = reminder.time.split(':');
      const secondTime = new Date();
      secondTime.setHours(parseInt(hours) + 12);
      times.push(`${String(secondTime.getHours()).padStart(2, '0')}:${minutes}`);
    } else if (reminder.frequency === 'thrice') {
      const [hours, minutes] = reminder.time.split(':');
      times.push(
        `${String((parseInt(hours) + 8) % 24).padStart(2, '0')}:${minutes}`,
        `${String((parseInt(hours) + 16) % 24).padStart(2, '0')}:${minutes}`
      );
    } else if (reminder.frequency === 'every6h') {
      const [hours, minutes] = reminder.time.split(':');
      for (let i = 6; i < 24; i += 6) {
        times.push(`${String((parseInt(hours) + i) % 24).padStart(2, '0')}:${minutes}`);
      }
    }
    
    return times;
  };

  const showNotification = (reminder) => {
    if (notificationPermission === 'granted') {
      new Notification('Medication Reminder', {
        body: `Time to take ${reminder.name}\nDosage: ${reminder.dosage}`,
        icon: '💊',
        tag: reminder.id,
      });
    }

    // Also show toast
    toast({
      title: '💊 Medication Reminder',
      description: `Time to take ${reminder.name} (${reminder.dosage})`,
      status: 'info',
      duration: 10000,
      isClosable: true,
      position: 'top-right',
    });
  };

  useEffect(() => {
    if (medicineInput) {
      setFilteredTablets(
        tablets.filter(t => t.name && t.name.toLowerCase().includes(medicineInput.toLowerCase())).slice(0, 8)
      );
    } else {
      setFilteredTablets([]);
    }
  }, [medicineInput, tablets]);

  const handleTabletSelect = (tablet) => {
    setSelectedTablet(tablet);
    setMedicineInput(tablet.name);
    setFilteredTablets([]);
  };

  const handleSetReminder = () => {
    if (selectedTablet && reminderTime) {
      const newReminder = {
        id: Date.now().toString(),
        name: selectedTablet.name,
        time: reminderTime,
        frequency: frequency,
        dosage: dosage,
        info: selectedTablet,
        taken: false,
        snoozed: false,
        createdAt: new Date().toISOString(),
      };
      
      setReminders([...reminders, newReminder]);
      setMedicineInput('');
      setSelectedTablet(null);
      setReminderTime('');
      setFrequency('once');
      setDosage('1 pill');
      
      toast({
        title: 'Reminder Set!',
        description: `Reminder created for ${newReminder.name}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteReminder = (id) => {
    setReminders(reminders.filter(r => r.id !== id));
    toast({
      title: 'Reminder Deleted',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleMarkAsTaken = (id) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      // Add to history
      const historyEntry = {
        id: Date.now().toString(),
        name: reminder.name,
        dosage: reminder.dosage,
        takenAt: new Date().toISOString(),
        scheduledTime: reminder.time,
      };
      setHistory([historyEntry, ...history]);

      // Update reminder
      setReminders(prev => prev.map(r => 
        r.id === id ? { ...r, taken: true, snoozed: false } : r
      ));

      toast({
        title: '✓ Marked as Taken',
        description: `${reminder.name} logged`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleSnooze = (id, minutes) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      const snoozeUntil = new Date(Date.now() + minutes * 60000);
      setReminders(prev => prev.map(r => 
        r.id === id ? { ...r, snoozed: true, snoozeUntil: snoozeUntil.toISOString() } : r
      ));

      toast({
        title: `⏰ Snoozed for ${minutes} minutes`,
        status: 'info',
        duration: 2000,
        isClosable: true,
      });

      // Set timeout to unsnooze
      setTimeout(() => {
        setReminders(prev => prev.map(r => 
          r.id === id ? { ...r, snoozed: false } : r
        ));
        showNotification(reminder);
      }, minutes * 60000);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFrequencyBadge = (freq) => {
    const badges = {
      once: { text: 'Once', color: 'blue' },
      daily: { text: 'Daily', color: 'green' },
      twice: { text: 'Twice Daily', color: 'purple' },
      thrice: { text: '3x Daily', color: 'orange' },
      every6h: { text: 'Every 6h', color: 'red' },
    };
    return badges[freq] || badges.once;
  };

  return (
    <Flex minH="100vh" bg="gradient-to-br from-teal-50 to-blue-50" px={4} py={8} direction="column" align="center">
      <Box w="100%" maxW="800px">
        <Tabs isFitted variant="enclosed" colorScheme="teal">
          <TabList mb={4}>
            <Tab><FaPills style={{ marginRight: '8px' }} /> Add Reminder</Tab>
            <Tab><FaClock style={{ marginRight: '8px' }} /> Active ({reminders.filter(r => !r.taken).length})</Tab>
            <Tab><FaHistory style={{ marginRight: '8px' }} /> History</Tab>
          </TabList>

          <TabPanels>
            {/* Add Reminder Tab */}
            <TabPanel>
              <Box bg="white" p={8} borderRadius="2xl" boxShadow="xl">
                <Heading size="lg" mb={6} color="teal.700" textAlign="center">
                  <BellIcon mr={2} />
                  Set Medication Reminder
                </Heading>
                
                {notificationPermission !== 'granted' && (
                  <Box mb={4} p={3} bg="yellow.50" borderRadius="md" borderLeft="4px solid" borderColor="yellow.400">
                    <Text fontSize="sm">
                      Enable notifications to receive reminders. Click the bell icon in your browser.
                    </Text>
                  </Box>
                )}

                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text mb={2} fontWeight="600">Medicine Name</Text>
                    <Input
                      placeholder="Search for medicine..."
                      value={medicineInput}
                      onChange={e => setMedicineInput(e.target.value)}
                      autoComplete="off"
                      size="lg"
                    />
                    {filteredTablets.length > 0 && (
                      <Box mt={2} border="1px solid" borderColor="gray.200" borderRadius="md" bg="white" maxH="200px" overflowY="auto" boxShadow="md">
                        <List spacing={0}>
                          {filteredTablets.map((t, i) => (
                            <ListItem
                              key={i}
                              px={4}
                              py={3}
                              _hover={{ bg: 'teal.50', cursor: 'pointer' }}
                              onClick={() => handleTabletSelect(t)}
                              borderBottom={i < filteredTablets.length - 1 ? '1px solid' : 'none'}
                              borderColor="gray.100"
                            >
                              <Text fontWeight="500">{t.name}</Text>
                              {t.medicine_desc && <Text fontSize="xs" color="gray.600">{t.medicine_desc.substring(0, 60)}...</Text>}
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Box>

                  {selectedTablet && (
                    <>
                      <Box p={4} bg="teal.50" borderRadius="md" borderLeft="4px solid" borderColor="teal.400">
                        <HStack mb={2}>
                          <FaPills color="teal" />
                          <Text fontWeight="bold" color="teal.700">{selectedTablet.name}</Text>
                        </HStack>
                        <Text fontSize="sm" mb={2}><strong>Description:</strong> {selectedTablet.medicine_desc ? selectedTablet.medicine_desc.substring(0, 200) + '...' : 'No information available.'}</Text>
                        {selectedTablet.short_composition1 && (
                          <Text fontSize="sm"><strong>Composition:</strong> {selectedTablet.short_composition1}</Text>
                        )}
                      </Box>

                      <HStack spacing={4}>
                        <Box flex={1}>
                          <Text mb={2} fontWeight="600">Time</Text>
                          <Input
                            type="time"
                            value={reminderTime}
                            onChange={e => setReminderTime(e.target.value)}
                            size="lg"
                          />
                        </Box>
                        <Box flex={1}>
                          <Text mb={2} fontWeight="600">Frequency</Text>
                          <Select value={frequency} onChange={e => setFrequency(e.target.value)} size="lg">
                            <option value="once">Once</option>
                            <option value="daily">Daily</option>
                            <option value="twice">Twice Daily</option>
                            <option value="thrice">Three Times Daily</option>
                            <option value="every6h">Every 6 Hours</option>
                          </Select>
                        </Box>
                      </HStack>

                      <Box>
                        <Text mb={2} fontWeight="600">Dosage</Text>
                        <Input
                          placeholder="e.g., 1 pill, 2 tablets, 5ml"
                          value={dosage}
                          onChange={e => setDosage(e.target.value)}
                          size="lg"
                        />
                      </Box>

                      <Button
                        colorScheme="teal"
                        size="lg"
                        onClick={handleSetReminder}
                        isDisabled={!reminderTime}
                        leftIcon={<CheckIcon />}
                      >
                        Set Reminder
                      </Button>
                    </>
                  )}
                </VStack>
              </Box>
            </TabPanel>

            {/* Active Reminders Tab */}
            <TabPanel>
              <Box bg="white" p={6} borderRadius="2xl" boxShadow="xl" minH="400px">
                <Heading size="md" mb={4} color="teal.700">Active Reminders</Heading>
                {reminders.filter(r => !r.taken).length === 0 ? (
                  <Box textAlign="center" py={10}>
                    <FaClock size={50} color="#CBD5E0" />
                    <Text mt={4} color="gray.500">No active reminders</Text>
                  </Box>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {reminders.filter(r => !r.taken).map((r) => (
                      <Box key={r.id} p={4} bg={r.snoozed ? 'orange.50' : 'gray.50'} borderRadius="lg" borderLeft="4px solid" borderColor={r.snoozed ? 'orange.400' : 'teal.400'}>
                        <Flex justify="space-between" align="start">
                          <Box flex={1}>
                            <HStack mb={2}>
                              <FaPills color="teal" />
                              <Text fontWeight="bold" fontSize="lg">{r.name}</Text>
                              <Badge colorScheme={getFrequencyBadge(r.frequency).color}>
                                {getFrequencyBadge(r.frequency).text}
                              </Badge>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              <TimeIcon mr={1} />
                              {r.time} | Dosage: {r.dosage}
                            </Text>
                            {r.snoozed && (
                              <Text fontSize="xs" color="orange.600" mt={1}>
                                ⏰ Snoozed until {formatDate(r.snoozeUntil)}
                              </Text>
                            )}
                          </Box>
                          <HStack>
                            <Checkbox
                              size="lg"
                              colorScheme="green"
                              onChange={() => handleMarkAsTaken(r.id)}
                              title="Mark as taken"
                            />
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<TimeIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="orange"
                                title="Snooze"
                              />
                              <MenuList>
                                <MenuItem onClick={() => handleSnooze(r.id, 5)}>Snooze 5 min</MenuItem>
                                <MenuItem onClick={() => handleSnooze(r.id, 10)}>Snooze 10 min</MenuItem>
                                <MenuItem onClick={() => handleSnooze(r.id, 15)}>Snooze 15 min</MenuItem>
                                <MenuItem onClick={() => handleSnooze(r.id, 30)}>Snooze 30 min</MenuItem>
                              </MenuList>
                            </Menu>
                            <IconButton
                              icon={<CloseIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleDeleteReminder(r.id)}
                              title="Delete reminder"
                            />
                          </HStack>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>
            </TabPanel>

            {/* History Tab */}
            <TabPanel>
              <Box bg="white" p={6} borderRadius="2xl" boxShadow="xl" minH="400px">
                <Heading size="md" mb={4} color="teal.700">Medication History</Heading>
                {history.length === 0 ? (
                  <Box textAlign="center" py={10}>
                    <FaHistory size={50} color="#CBD5E0" />
                    <Text mt={4} color="gray.500">No medication history yet</Text>
                  </Box>
                ) : (
                  <VStack spacing={2} align="stretch">
                    {history.slice(0, 20).map((entry) => (
                      <Flex key={entry.id} p={3} bg="green.50" borderRadius="md" align="center" justify="space-between">
                        <HStack>
                          <FaCheckCircle color="green" />
                          <Box>
                            <Text fontWeight="600">{entry.name}</Text>
                            <Text fontSize="xs" color="gray.600">
                              Dosage: {entry.dosage} | Scheduled: {entry.scheduledTime}
                            </Text>
                          </Box>
                        </HStack>
                        <Text fontSize="xs" color="gray.500">{formatDate(entry.takenAt)}</Text>
                      </Flex>
                    ))}
                  </VStack>
                )}
                {history.length > 0 && (
                  <Button
                    mt={4}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => {
                      if (window.confirm('Clear all history?')) {
                        setHistory([]);
                        localStorage.removeItem('medicationHistory');
                      }
                    }}
                  >
                    Clear History
                  </Button>
                )}
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Flex>
  );
} 