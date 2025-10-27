import { Cloud } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
}

function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <Cloud className="w-32 h-32 text-blue-500 animate-pulse" strokeWidth={1.5} />
        </div>
        <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Word Cloud
        </h1>
        <p className="text-gray-600 text-xl mb-4 max-w-md mx-auto">
          Create a portrait word cloud featuring Caterpillar's core values
        </p>
        <p className="text-sm text-gray-500 mb-12 max-w-lg mx-auto">
          Your portrait will be formed using words like: Innovation, Leadership, Collaboration, Technology, and more
        </p>
        <button
          onClick={onStart}
          className="px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export default StartScreen;
