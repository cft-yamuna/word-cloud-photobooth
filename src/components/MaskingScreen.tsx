import { useRef, useEffect, useState } from 'react';
import { ArrowRight, Paintbrush, Eraser } from 'lucide-react';

interface MaskingScreenProps {
  cameraPhoto: string;
  words: string[];
  onNext: (threshold: number, maskedPhoto: string) => void;
}

function MaskingScreen({ cameraPhoto, words, onNext }: MaskingScreenProps) {
  const [threshold, setThreshold] = useState(128);
  const [drawingMode, setDrawingMode] = useState<'brush' | 'eraser' | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

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
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Capture the canvas image with all the brush/eraser edits
    const maskedPhoto = canvas.toDataURL('image/png');
    onNext(threshold, maskedPhoto);
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingMode) return;
    setIsDrawing(true);
    const coords = getCanvasCoordinates(e);
    if (coords) {
      lastPosRef.current = coords;
      draw(e);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawingMode) return;
    draw(e);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    ctx.strokeStyle = drawingMode === 'brush' ? '#000000' : '#FFFFFF';
    ctx.lineWidth = 30;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (lastPosRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }

    lastPosRef.current = coords;
  };

  return (
    <div className="min-h-screen p-8 flex items-center justify-center bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/bg3.png)' }}>
      <div className="max-w-6xl w-full">
        <div className="mt-52 p-4">


          {/* Mask Preview - Centered */}
          <div className="flex items-center justify-center p-6 ">
            <canvas
              ref={canvasRef}
              className="w-full"
              style={{ maxWidth: '800px', cursor: drawingMode ? 'crosshair' : 'default' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          {/* Controls */}
          <div>
            <div className="mb-4 mx-24">
              <label htmlFor="threshold" className="block mb-2 text-sm font-medium">
                Threshold: <span className="text-[#FFCD11]">{threshold}</span>
              </label>
              <input
                type="range"
                id="threshold"
                min="0"
                max="255"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FFCD11]"
              />
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDrawingMode(drawingMode === 'brush' ? null : 'brush')}
                className={`px-6 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 font-semibold ${
                  drawingMode === 'brush' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <Paintbrush className="w-5 h-5" />
                Brush
              </button>
              <button
                onClick={() => setDrawingMode(drawingMode === 'eraser' ? null : 'eraser')}
                className={`px-6 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 font-semibold ${
                  drawingMode === 'eraser' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <Eraser className="w-5 h-5" />
                Eraser
              </button>
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-[#FFCD11] hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 font-semibold"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaskingScreen;
