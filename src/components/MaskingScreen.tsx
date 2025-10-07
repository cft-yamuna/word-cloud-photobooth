import { useRef, useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface MaskingScreenProps {
  cameraPhoto: string;
  words: string[];
  onNext: (threshold: number) => void;
}

function MaskingScreen({ cameraPhoto, words, onNext }: MaskingScreenProps) {
  const [threshold, setThreshold] = useState(128);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // Load the camera photo
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      updateMaskPreview();
    };
    img.src = cameraPhoto;
  }, [cameraPhoto]);

  useEffect(() => {
    if (imageRef.current) {
      updateMaskPreview();
    }
  }, [threshold]);

  const updateMaskPreview = () => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    const aspectRatio = img.width / img.height;

    // Set canvas dimensions
    canvas.width = 600;
    canvas.height = 600 / aspectRatio;

    // Draw the original image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Apply black & white threshold effect
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Calculate brightness using the same formula as HTML
      const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const color = brightness < threshold ? 0 : 255;
      data[i] = data[i + 1] = data[i + 2] = color;
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const handleNext = () => {
    onNext(threshold);
  };

  return (
    <div className="min-h-screen p-8 flex items-center justify-center">
      <div className="max-w-3xl w-full">
        <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Adjust Your Mask
        </h2>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Mask Preview - Centered */}
          <div className="flex items-center justify-center bg-gray-50 rounded-xl p-6 mb-6">
            <canvas
              ref={canvasRef}
              className="max-w-full rounded-lg border border-gray-200 shadow-md"
            />
          </div>

          {/* Controls - Small Row Below */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="threshold" className="block mb-2 text-sm font-medium">
                Threshold: <span className="text-blue-600">{threshold}</span>
              </label>
              <input
                type="range"
                id="threshold"
                min="0"
                max="255"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 font-semibold whitespace-nowrap"
            >
              Generate
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaskingScreen;
