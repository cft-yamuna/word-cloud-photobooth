import { Home, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import QRCode from './QRCode';
import { uploadImage } from '../lib/supabase';

interface ResultScreenProps {
  words: string[];
  cameraPhoto: string;
  threshold: number;
  onHome: () => void;
}

function ResultScreen({ words, cameraPhoto, threshold, onHome }: ResultScreenProps) {
  const [resultImage, setResultImage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [outputUrl, setOutputUrl] = useState<string>('');

  useEffect(() => {
    generateWordCloud();
  }, []);

  const generateWordCloud = async () => {
    setLoading(true);
    setError('');

    try {
      // Prepare payload exactly like the HTML file
      const payload = {
        image: cameraPhoto,
        text: words.join(' '),
        threshold: threshold.toString(),
      };

      // Make request to the same endpoint as HTML file
      const response = await fetch('https://word-cloud-exvir.ondigitalocean.app/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `HTTP error! Status: ${response.status}`
        }));
        throw new Error(errorData.error);
      }

      // Get the image blob from response
      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);

      setResultImage(imageUrl);

      // Upload to Supabase storage
      try {
        const timestamp = Date.now();
        const filename = `output_${timestamp}.png`;
        const publicUrl = await uploadImage('wordcloud', `output/${filename}`, imageBlob);
        setOutputUrl(publicUrl);
        console.log('Word cloud uploaded to Supabase successfully');
      } catch (uploadErr) {
        console.error('Error uploading to Supabase:', uploadErr);
        // Don't fail the entire operation if upload fails
      }
    } catch (err) {
      console.error('Error generating word cloud:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate word cloud');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.download = 'threshold-word-cloud.png';
    link.href = resultImage;
    link.click();
  };

  return (
    <div className="min-h-screen p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">Your Word Cloud</h2>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Output Image - Large Display */}
          {loading ? (
            <div className="flex items-center justify-center h-96 bg-gray-50 rounded-xl mb-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating your word cloud...</p>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  {error}
                </div>
              )}
              {resultImage ? (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <img
                    src={resultImage}
                    alt="Word Cloud"
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              ) : !error && (
                <div className="flex items-center justify-center h-96 bg-gray-50 rounded-xl mb-6">
                  <p className="text-gray-400">Failed to generate word cloud</p>
                </div>
              )}
            </>
          )}

          {/* QR Code and Home Button Row */}
          <div className="flex items-center justify-center gap-8">
            {outputUrl && (
              <div className="bg-gray-50 rounded-xl p-4">
                <QRCode value={`${outputUrl}${outputUrl.includes('?') ? '&' : '?'}download=wordcloud`} size={150} />
              </div>
            )}
            <button
              onClick={onHome}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 font-semibold"
            >
              <Home className="w-5 h-5" />
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultScreen;
