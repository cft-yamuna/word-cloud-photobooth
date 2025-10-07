import { useState } from 'react';
import StartScreen from './components/StartScreen';
import WordInputScreen from './components/WordInputScreen';
import CameraScreen from './components/CameraScreen';
import MaskingScreen from './components/MaskingScreen';
import ResultScreen from './components/ResultScreen';

type Screen = 'start' | 'input' | 'camera' | 'masking' | 'result';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('start');
  const [words, setWords] = useState<string[]>([]);
  const [cameraPhoto, setCameraPhoto] = useState<string>('');
  const [threshold, setThreshold] = useState<number>(128);

  const handleStart = () => {
    setCurrentScreen('input');
  };

  const handleWordsComplete = (submittedWords: string[]) => {
    setWords(submittedWords);
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
    setWords([]);
    setCameraPhoto('');
    setThreshold(128);
    setCurrentScreen('start');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {currentScreen === 'start' && <StartScreen onStart={handleStart} />}
      {currentScreen === 'input' && <WordInputScreen onNext={handleWordsComplete} />}
      {currentScreen === 'camera' && <CameraScreen onCapture={handlePhotoCapture} />}
      {currentScreen === 'masking' && (
        <MaskingScreen
          cameraPhoto={cameraPhoto}
          words={words}
          onNext={handleMaskingComplete}
        />
      )}
      {currentScreen === 'result' && (
        <ResultScreen
          words={words}
          cameraPhoto={cameraPhoto}
          threshold={threshold}
          onHome={handleHome}
        />
      )}
    </div>
  );
}

export default App;
