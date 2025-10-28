import { useRef, useState, useEffect } from 'react';
import { Camera, RotateCcw, Check } from 'lucide-react';
import { uploadImage, base64ToBlob } from '../lib/supabase';

interface CameraScreenProps {
  onCapture: (photo: string) => void;
}

function CameraScreen({ onCapture }: CameraScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [uploading, setUploading] = useState(false);

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
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Get video dimensions
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

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
        setCapturedPhoto(photoData);
      }
    }
  };

  const handleRetake = () => {
    setCapturedPhoto('');
  };

  const handleConfirm = async () => {
    if (capturedPhoto) {
      setUploading(true);
      setError('');

      try {
        // Convert base64 to blob
        const blob = base64ToBlob(capturedPhoto);

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `input_${timestamp}.png`;

        // Upload to Supabase storage
        await uploadImage('wordcloud', `input/${filename}`, blob);

        stopCamera();
        onCapture(capturedPhoto);
      } catch (err) {
        console.error('Error uploading image:', err);
        setError(err instanceof Error ? err.message : 'Failed to upload image');
        setUploading(false);
      }
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Capture Photo
        </h2>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="relative bg-black rounded-xl overflow-hidden mb-6" style={{ aspectRatio: '2/3' }}>
            {!capturedPhoto ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={capturedPhoto}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex justify-center gap-4">
            {!capturedPhoto ? (
              <button
                onClick={handleTakePhoto}
                disabled={!!error}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 font-semibold"
              >
                <Camera className="w-5 h-5" />
                Take Photo
              </button>
            ) : (
              <>
                <button
                  onClick={handleRetake}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 font-semibold"
                >
                  <RotateCcw className="w-5 h-5" />
                  Retake
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={uploading}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Check className="w-5 h-5" />
                  {uploading ? 'Uploading...' : 'Confirm'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CameraScreen;
