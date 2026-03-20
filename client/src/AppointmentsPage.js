import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, VStack, HStack, Tag, Divider, Spinner } from '@chakra-ui/react';
import { db } from './firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true);
      try {
        const q = query(collection(db, 'appointments'), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data());
        setAppointments(data);
      } catch (e) {
        setAppointments([]);
      }
      setLoading(false);
    }
    fetchAppointments();
  }, []);

  return (
    <Box minH="100vh" bgGradient="linear(to-br, #e0f7fa 0%, #f8ffff 100%)" px={{ base: 2, md: 8 }} py={10}>
      <Box maxW="900px" mx="auto" bg="white" borderRadius="2xl" boxShadow="2xl" p={{ base: 5, md: 10 }}>
        <Heading size="lg" color="teal.700" mb={6} fontWeight={900} textAlign="center">
          Your Appointments
        </Heading>
        {loading ? (
          <Spinner color="teal.400" size="lg" thickness="4px" mt={8} />
        ) : appointments.length === 0 ? (
          <Text color="gray.500" fontSize="lg" textAlign="center">No appointments found.</Text>
        ) : (
          <VStack align="stretch" spacing={6}>
            {appointments.map((appt, idx) => (
              <Box key={idx} p={6} bg="teal.50" borderRadius="2xl" boxShadow="lg">
                <HStack spacing={4} mb={2}>
                  <Tag colorScheme="teal" fontWeight={700} fontSize="md">{appt.doctor.specialty}</Tag>
                  <Text fontWeight="bold" color="teal.700" fontSize="lg">{appt.doctor.name}</Text>
                </HStack>
                <Text color="gray.700" fontSize="md" mb={1}><b>Hospital:</b> {appt.doctor.hospital}</Text>
                <Text color="gray.600" fontSize="sm" mb={1}><b>Address:</b> {appt.doctor.address}</Text>
                <Text color="gray.600" fontSize="sm" mb={3}><b>Doctor Contact:</b> {appt.doctor.contact}</Text>
                <Divider my={2} />
                <Text color="teal.700" fontWeight={600} mb={1}>Patient: {appt.patientName}</Text>
                <Text color="gray.600" fontSize="sm" mb={1}><b>Patient Contact:</b> {appt.patientContact}</Text>
                <Text color="gray.600" fontSize="sm" mb={1}><b>Appointment Date:</b> {appt.appointmentDate}</Text>
                <Text color="gray.600" fontSize="sm" mb={1}><b>Appointment Time:</b> {appt.appointmentTime}</Text>
                <Text color="gray.600" fontSize="sm" mb={1}><b>General Issue:</b> {appt.generalIssue}</Text>
                {appt.patientNotes && <Text color="gray.600" fontSize="sm" mb={1}><b>Notes:</b> {appt.patientNotes}</Text>}
                <Text color="gray.500" fontSize="xs" mt={2}>Booked at: {new Date(appt.timestamp).toLocaleString()}</Text>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
} 