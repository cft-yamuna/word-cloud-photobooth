import { useState } from 'react';
import StartScreen from './components/StartScreen';
import CameraScreen from './components/CameraScreen';
import MaskingScreen from './components/MaskingScreen';
import ResultScreen from './components/ResultScreen';

type Screen = 'start' | 'camera' | 'masking' | 'result';

// Fixed list of words for the word cloud
const FIXED_WORDS = [
  'Caterpillar', 'People', 'Innovation', 'Values', 'Leaders',
  'Technology', 'Stakeholders', 'Collaboration', 'Safety', 'Performance',
  'Customer', 'Sustainable world', 'Centennial World tour', 'Progress',
  'Next 100 years', 'Strong', 'Authentic', 'Respectful'
];

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('start');
  const [cameraPhoto, setCameraPhoto] = useState<string>('');
  const [threshold, setThreshold] = useState<number>(128);

  const handleStart = () => {
    setCurrentScreen('camera');
  };

  const handlePhotoCapture = (photo: string) => {
    setCameraPhoto(photo);
    setCurrentScreen('masking');
  };

  const handleMaskingComplete = (selectedThreshold: number) => {
    setThreshold(selectedThreshold);
    setCurrentScreen('result');
  };

  const handleHome = () => {
    setCameraPhoto('');
    setThreshold(128);
    setCurrentScreen('start');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {currentScreen === 'start' && <StartScreen onStart={handleStart} />}
      {currentScreen === 'camera' && <CameraScreen onCapture={handlePhotoCapture} />}
      {currentScreen === 'masking' && (
        <MaskingScreen
          cameraPhoto={cameraPhoto}
          words={FIXED_WORDS}
          onNext={handleMaskingComplete}
        />
      )}
      {currentScreen === 'result' && (
        <ResultScreen
          words={FIXED_WORDS}
          cameraPhoto={cameraPhoto}
          threshold={threshold}
          onHome={handleHome}
        />
      )}
    </div>
  );
}

export default App;
