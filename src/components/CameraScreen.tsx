import { useRef, useState, useEffect } from 'react';
import { Camera, RotateCcw, Check } from 'lucide-react';

interface CameraScreenProps {
  onCapture: (photo: string) => void;
}

function CameraScreen({ onCapture }: CameraScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1200 }, height: { ideal: 1800 }, aspectRatio: 0.6667 },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setIsVideoReady(true);
        };
      }
    } catch (err) {
      setError('Could not access camera. Please allow camera access.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleTakePhoto = () => {
    if (videoRef.current && canvasRef.current && isVideoReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Get video dimensions
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Check if video dimensions are valid
      if (videoWidth === 0 || videoHeight === 0) {
        setError('Video not ready. Please try again.');
        return;
      }

      // Calculate 4:6 (2:3) aspect ratio crop
      const targetAspectRatio = 2 / 3;
      const videoAspectRatio = videoWidth / videoHeight;

      let sourceWidth, sourceHeight, sourceX, sourceY;

      if (videoAspectRatio > targetAspectRatio) {
        // Video is wider, crop horizontally
        sourceHeight = videoHeight;
        sourceWidth = videoHeight * targetAspectRatio;
        sourceX = (videoWidth - sourceWidth) / 2;
        sourceY = 0;
      } else {
        // Video is taller, crop vertically
        sourceWidth = videoWidth;
        sourceHeight = videoWidth / targetAspectRatio;
        sourceX = 0;
        sourceY = (videoHeight - sourceHeight) / 2;
      }

      // Set canvas to 4:6 (2:3) aspect ratio with good quality
      canvas.width = 1200;
      canvas.height = 1800;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw cropped video to canvas
        ctx.drawImage(
          video,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, canvas.width, canvas.height
        );
        const photoData = canvas.toDataURL('image/png');
        
        // Directly go to next screen with photo data
        stopCamera();
        onCapture(photoData);
      }
    }
  };



  return (
    <div className="min-h-screen p-8 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/bg5.png)' }}>
      <div className="max-w-4xl mx-auto mt-[22rem]">
        <div className=" p-2">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="relative bg-black overflow-hidden mb-6 mx-auto" style={{ aspectRatio: '2/3', maxWidth: '600px' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex justify-center gap-4">
            <button
              onClick={handleTakePhoto}
              disabled={!!error || !isVideoReady}
              className="px-20 py-3 mr-[38rem] bg-[#FFCD11] text-4xl hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 font-semibold"
            >
              {!isVideoReady ? 'Loading...' : 'Capture'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CameraScreen;