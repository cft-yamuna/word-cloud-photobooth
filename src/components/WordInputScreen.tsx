import { useState, KeyboardEvent } from 'react';
import { ArrowRight, Plus } from 'lucide-react';

interface WordInputScreenProps {
  onNext: (words: string[]) => void;
}

function WordInputScreen({ onNext }: WordInputScreenProps) {
  const [words, setWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState('');

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentWord.trim() && words.length < 50) {
      setWords([...words, currentWord.trim()]);
      setCurrentWord('');
    }
  };

  const handleAddWord = () => {
    if (currentWord.trim() && words.length < 50) {
      setWords([...words, currentWord.trim()]);
      setCurrentWord('');
    }
  };

  const handleNext = () => {
    if (words.length > 0) {
      onNext(words);
    }
  };

  const removeWord = (index: number) => {
    setWords(words.filter((_, i) => i !== index));
  };

  const getRandomSize = () => {
    const sizes = ['text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };

  const getRandomColor = () => {
    const colors = [
      'text-blue-500',
      'text-green-500',
      'text-pink-500',
      'text-orange-500',
      'text-teal-500',
      'text-red-500',
      'text-yellow-600',
      'text-cyan-500',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="min-h-screen p-8 flex items-center justify-center">
      <div className="max-w-6xl w-full">
        <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Add Your Words
        </h2>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              Words ({words.length}/50)
            </label>
            <div className="flex gap-2 items-center max-w-2xl mx-auto">
              <input
                type="text"
                value={currentWord}
                onChange={(e) => setCurrentWord(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a word and press Enter"
                disabled={words.length >= 50}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg disabled:bg-gray-100"
              />
              <button
                onClick={handleAddWord}
                disabled={!currentWord.trim() || words.length >= 50}
                className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {words.length >= 50 && (
              <p className="text-sm text-red-500 mt-2 text-center">Maximum 50 words reached</p>
            )}
          </div>

          <div className="min-h-96 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 mb-6 flex flex-wrap items-center justify-center gap-6">
            {words.length === 0 ? (
              <p className="text-gray-400 text-lg">Your words will appear here...</p>
            ) : (
              words.map((word, index) => (
                <button
                  key={index}
                  onClick={() => removeWord(index)}
                  className={`${getRandomSize()} ${getRandomColor()} font-bold hover:opacity-70 cursor-pointer transition-opacity animate-fadeIn`}
                  style={{
                    transform: `rotate(${Math.random() * 20 - 10}deg)`,
                  }}
                >
                  {word}
                </button>
              ))
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleNext}
              disabled={words.length === 0}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 font-semibold"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WordInputScreen;
