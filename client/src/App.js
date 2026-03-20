import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import ChatbotSection from './components/ChatbotSection';
import HealthNewsFeed from './components/HealthNewsFeed';
import ContactSection from './components/ContactSection';
import SymptomInputFeaturePage from './SymptomInputFeaturePage';
import InstantSuggestionsFeaturePage from './InstantSuggestionsFeaturePage';
import ConfidentialSecureFeaturePage from './ConfidentialSecureFeaturePage';
import AIChatbotFeaturePage from './AIChatbotFeaturePage';
import BreathingExercisePage from './BreathingExercisePage';
import YogaPage from './YogaPage';
import GoogleLogin from './components/GoogleLogin';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import BookDoctorHomePage from './BookDoctorHomePage';
import AppointmentsPage from './AppointmentsPage';
import MedicationReminderPage from './MedicationReminderPage';

function Home() {
  return (
    <div style={{ scrollBehavior: 'smooth', minHeight: '100vh', background: '#e6fffa' }}>
      {/* Navbar removed from here */}
      <HeroSection />
      <FeaturesSection />
      <ChatbotSection />
      <HealthNewsFeed />
      <ContactSection />
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => signOut(auth);

  if (loading) return null;

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<GoogleLogin />} />
        <Route
          path="/*"
          element={
            user ? (
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/feature/symptom-input" element={<SymptomInputFeaturePage />} />
                <Route path="/feature/instant-suggestions" element={<InstantSuggestionsFeaturePage />} />
                <Route path="/feature/confidential-secure" element={<ConfidentialSecureFeaturePage />} />
                <Route path="/feature/ai-chatbot" element={<AIChatbotFeaturePage />} />
                <Route path="/feature/medication-reminder" element={<MedicationReminderPage />} />
                <Route path="/feature/book-doctor-home" element={<BookDoctorHomePage />} />
                <Route path="/breathing-exercise" element={<BreathingExercisePage />} />
                <Route path="/yoga" element={<YogaPage />} />
                <Route path="/appointments" element={<AppointmentsPage />} />
              </Routes>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
