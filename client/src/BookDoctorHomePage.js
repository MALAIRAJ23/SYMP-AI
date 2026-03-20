import React, { useState, useEffect } from 'react';
import { 
  Box, Heading, Text, Flex, Button, Tag, VStack, HStack, Select, Modal, 
  ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, 
  useDisclosure, useToast, InputGroup, InputLeftElement, Badge, SimpleGrid,
  Textarea, Alert, AlertIcon
} from '@chakra-ui/react';
import { SearchIcon, CalendarIcon, TimeIcon, CheckCircleIcon, ViewIcon } from '@chakra-ui/icons';
import { FaUserMd, FaHospital, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// Mock doctor data with more details
const doctors = [
  { id: 1, name: 'Dr. Priya Sharma', specialty: 'Cardiologist', hospital: 'Apollo Hospital', address: '123 Main St, Bangalore', contact: '9876543210', experience: '15 years', fee: '₹800' },
  { id: 2, name: 'Dr. Arjun Patel', specialty: 'Pediatrician', hospital: 'Rainbow Children Hospital', address: '45 MG Road, Mumbai', contact: '9123456789', experience: '10 years', fee: '₹600' },
  { id: 3, name: 'Dr. Meera Iyer', specialty: 'Dermatologist', hospital: 'Skin Care Clinic', address: '22 Park Lane, Chennai', contact: '9988776655', experience: '12 years', fee: '₹700' },
  { id: 4, name: 'Dr. Rahul Singh', specialty: 'Cardiologist', hospital: 'Fortis Hospital', address: '88 Residency Rd, Delhi', contact: '9001122334', experience: '18 years', fee: '₹1000' },
  { id: 5, name: 'Dr. Kavita Rao', specialty: 'Pediatrician', hospital: 'Cloudnine Hospital', address: '77 Brigade Rd, Bangalore', contact: '9112233445', experience: '8 years', fee: '₹500' },
  { id: 6, name: 'Dr. Suresh Nair', specialty: 'Dermatologist', hospital: 'Derma Plus', address: '12 Anna Salai, Chennai', contact: '9090909090', experience: '20 years', fee: '₹900' },
  { id: 7, name: 'Dr. Anjali Verma', specialty: 'Orthopedic', hospital: 'Max Hospital', address: '56 Park Street, Kolkata', contact: '9876501234', experience: '14 years', fee: '₹850' },
  { id: 8, name: 'Dr. Vikram Kumar', specialty: 'ENT Specialist', hospital: 'Manipal Hospital', address: '90 Ring Road, Bangalore', contact: '9123450987', experience: '11 years', fee: '₹650' },
  { id: 9, name: 'Dr. Sneha Reddy', specialty: 'Gynecologist', hospital: 'Apollo Cradle', address: '34 Jubilee Hills, Hyderabad', contact: '9988001122', experience: '13 years', fee: '₹750' },
  { id: 10, name: 'Dr. Amit Shah', specialty: 'Neurologist', hospital: 'Kokilaben Hospital', address: '78 Western Express, Mumbai', contact: '9001230456', experience: '16 years', fee: '₹1200' },
];

const specialties = ['All', ...Array.from(new Set(doctors.map(d => d.specialty)))];

// Time slots for appointments
const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
  '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'
];

export default function BookDoctorHomePage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientContact, setPatientContact] = useState('');
  const [patientNotes, setPatientNotes] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [generalIssue, setGeneralIssue] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [bookingReference, setBookingReference] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  // Auto-fill user details from Firebase Auth
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setPatientName(user.displayName || '');
      setPatientEmail(user.email || '');
    }
  }, []);

  // Fetch booked slots when doctor and date are selected
  useEffect(() => {
    if (bookingDoctor && appointmentDate) {
      fetchBookedSlots();
    }
  }, [bookingDoctor, appointmentDate]);

  const fetchBookedSlots = async () => {
    try {
      const q = query(
        collection(db, 'appointments'),
        where('doctorId', '==', bookingDoctor.id),
        where('appointmentDate', '==', appointmentDate)
      );
      const querySnapshot = await getDocs(q);
      const slots = querySnapshot.docs.map(doc => doc.data().timeSlot);
      setBookedSlots(slots);
    } catch (error) {
      console.error('Error fetching booked slots:', error);
    }
  };

  const generateBookingReference = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `BK${timestamp}${random}`.substring(0, 14);
  };

  // Filter doctors by specialty and search query
  const filteredDoctors = doctors.filter(d => {
    const matchesSpecialty = selectedSpecialty === 'All' || d.specialty === selectedSpecialty;
    const matchesSearch = searchQuery === '' || 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  const handleBookClick = (doctor) => {
    setBookingDoctor(doctor);
    setPatientContact('');
    setPatientNotes('');
    setAppointmentDate('');
    setSelectedTimeSlot('');
    setGeneralIssue('');
    setBookedSlots([]);
    onOpen();
  };

  const handleBookingSubmit = async () => {
    const reference = generateBookingReference();
    const bookingData = {
      bookingReference: reference,
      doctorId: bookingDoctor.id,
      doctorName: bookingDoctor.name,
      specialty: bookingDoctor.specialty,
      hospital: bookingDoctor.hospital,
      patientName,
      patientEmail,
      patientContact,
      patientNotes,
      appointmentDate,
      timeSlot: selectedTimeSlot,
      generalIssue,
      fee: bookingDoctor.fee,
      status: 'Confirmed',
      userId: auth.currentUser?.uid,
      timestamp: new Date().toISOString(),
    };
    
    try {
      await addDoc(collection(db, 'appointments'), bookingData);
      setBookingReference(reference);
      
      toast({
        title: '✓ Appointment Booked Successfully!',
        description: `Booking Reference: ${reference}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      
      setPatientContact('');
      setPatientNotes('');
      setAppointmentDate('');
      setSelectedTimeSlot('');
      setGeneralIssue('');
      onClose();
      
      setTimeout(() => {
        toast({
          title: 'View Your Appointment',
          description: 'Check the Appointments page for details',
          status: 'info',
          duration: 4000,
          isClosable: true,
        });
      }, 1500);
      
    } catch (error) {
      toast({
        title: 'Booking Failed',
        description: 'Failed to save appointment. Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      console.error('Firestore error:', error);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const isSlotAvailable = (slot) => {
    return !bookedSlots.includes(slot);
  };

  return (
    <Box minH="100vh" bgGradient="linear(to-br, #e0f7fa 0%, #f8ffff 100%)" px={{ base: 2, md: 8 }} py={10}>
      <Box maxW="1200px" mx="auto">
        <Box bg="white" borderRadius="2xl" boxShadow="2xl" p={{ base: 5, md: 8 }} mb={6}>
          <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={4}>
            <Box>
              <Heading size="xl" color="teal.700" fontWeight={900}>
                <FaUserMd style={{ display: 'inline', marginRight: '12px' }} />
                Book Your Doctor
              </Heading>
              <Text color="teal.600" fontSize="md" mt={2}>
                Find specialists and book appointments instantly
              </Text>
            </Box>
            <Button
              leftIcon={<ViewIcon />}
              colorScheme="blue"
              variant="outline"
              onClick={() => navigate('/appointments')}
              size="lg"
            >
              View My Appointments
            </Button>
          </Flex>

          <Flex gap={4} flexWrap="wrap" align="center">
            <InputGroup flex="1" minW="250px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search doctors, hospitals, specialties..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                bg="white"
                borderColor="teal.200"
                _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px teal' }}
                size="lg"
              />
            </InputGroup>
            <Select
              maxW="250px"
              value={selectedSpecialty}
              onChange={e => setSelectedSpecialty(e.target.value)}
              bg="white"
              borderColor="teal.200"
              _focus={{ borderColor: 'teal.400' }}
              size="lg"
            >
              {specialties.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Specialties' : s}</option>
              ))}
            </Select>
          </Flex>

          <Text mt={4} color="gray.600" fontSize="sm">
            {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} found
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredDoctors.length === 0 ? (
            <Box gridColumn="1 / -1" textAlign="center" py={10}>
              <Text color="gray.500" fontSize="lg">No doctors found matching your criteria.</Text>
            </Box>
          ) : (
            filteredDoctors.map((doc) => (
              <Box 
                key={doc.id} 
                bg="white" 
                borderRadius="xl" 
                boxShadow="lg" 
                p={6}
                transition="all 0.3s"
                _hover={{ boxShadow: '2xl', transform: 'translateY(-4px)' }}
                border="1px solid"
                borderColor="gray.100"
              >
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Badge colorScheme="teal" fontSize="sm" px={3} py={1} borderRadius="full">
                      {doc.specialty}
                    </Badge>
                    <Text fontWeight="bold" color="teal.600" fontSize="lg">{doc.fee}</Text>
                  </HStack>
                  
                  <Heading size="md" color="teal.700">{doc.name}</Heading>
                  
                  <Text fontSize="sm" color="gray.600">
                    <FaUserMd style={{ display: 'inline', marginRight: '6px' }} />
                    {doc.experience} experience
                  </Text>
                  
                  <Text fontSize="sm" color="gray.700">
                    <FaHospital style={{ display: 'inline', marginRight: '6px' }} />
                    {doc.hospital}
                  </Text>
                  
                  <Text fontSize="xs" color="gray.600">
                    <FaMapMarkerAlt style={{ display: 'inline', marginRight: '6px' }} />
                    {doc.address}
                  </Text>
                  
                  <Text fontSize="xs" color="gray.600">
                    <FaPhoneAlt style={{ display: 'inline', marginRight: '6px' }} />
                    {doc.contact}
                  </Text>

                  <Button 
                    colorScheme="teal" 
                    size="md" 
                    w="100%" 
                    mt={2}
                    leftIcon={<CalendarIcon />}
                    onClick={() => handleBookClick(doc)}
                  >
                    Book Appointment
                  </Button>
                </VStack>
              </Box>
            ))
          )}
        </SimpleGrid>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent maxW="600px">
          <ModalHeader bg="teal.500" color="white" borderTopRadius="md">
            <VStack align="start" spacing={1}>
              <Text fontSize="xl" fontWeight="bold">Book Appointment</Text>
              <Text fontSize="sm" fontWeight="normal">{bookingDoctor?.name} - {bookingDoctor?.specialty}</Text>
            </VStack>
          </ModalHeader>
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              <Box p={4} bg="teal.50" borderRadius="md" borderLeft="4px solid" borderColor="teal.400">
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm"><strong>Hospital:</strong> {bookingDoctor?.hospital}</Text>
                  <Badge colorScheme="green" fontSize="sm">{bookingDoctor?.fee}</Badge>
                </HStack>
                <Text fontSize="xs" color="gray.600">{bookingDoctor?.address}</Text>
              </Box>

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">Your details are auto-filled from your account</Text>
              </Alert>

              <Input
                placeholder="Patient Name"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                size="lg"
                isReadOnly
                bg="gray.50"
              />

              <Input
                placeholder="Email"
                value={patientEmail}
                onChange={e => setPatientEmail(e.target.value)}
                size="lg"
                type="email"
                isReadOnly
                bg="gray.50"
              />

              <Input
                placeholder="Contact Number *"
                value={patientContact}
                onChange={e => setPatientContact(e.target.value)}
                size="lg"
                type="tel"
              />

              <Textarea
                placeholder="General Issue / Reason for Visit *"
                value={generalIssue}
                onChange={e => setGeneralIssue(e.target.value)}
                size="lg"
                rows={3}
              />

              <Box>
                <Text mb={2} fontWeight="600" fontSize="sm">
                  <CalendarIcon mr={2} />
                  Select Appointment Date *
                </Text>
                <Input
                  type="date"
                  value={appointmentDate}
                  onChange={e => setAppointmentDate(e.target.value)}
                  min={getTodayDate()}
                  size="lg"
                />
              </Box>

              {appointmentDate && (
                <Box>
                  <Text mb={3} fontWeight="600" fontSize="sm">
                    <TimeIcon mr={2} />
                    Select Time Slot * {bookedSlots.length > 0 && <Badge ml={2} colorScheme="orange">Some slots unavailable</Badge>}
                  </Text>
                  <SimpleGrid columns={4} spacing={2}>
                    {timeSlots.map((slot) => {
                      const available = isSlotAvailable(slot);
                      return (
                        <Button
                          key={slot}
                          size="sm"
                          variant={selectedTimeSlot === slot ? 'solid' : 'outline'}
                          colorScheme={selectedTimeSlot === slot ? 'teal' : available ? 'gray' : 'red'}
                          onClick={() => available && setSelectedTimeSlot(slot)}
                          isDisabled={!available}
                          fontSize="xs"
                        >
                          {slot}
                        </Button>
                      );
                    })}
                  </SimpleGrid>
                </Box>
              )}

              <Textarea
                placeholder="Additional Notes (optional)"
                value={patientNotes}
                onChange={e => setPatientNotes(e.target.value)}
                size="md"
                rows={2}
              />
            </VStack>
          </ModalBody>
          <ModalFooter bg="gray.50" borderBottomRadius="md">
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleBookingSubmit}
              isDisabled={!patientName || !patientContact || !appointmentDate || !selectedTimeSlot || !generalIssue}
              leftIcon={<CheckCircleIcon />}
              size="lg"
            >
              Confirm Booking
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
