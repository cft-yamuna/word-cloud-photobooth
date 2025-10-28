import { Home, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
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
      // Prepare payload for detailed portrait word cloud
      const payload = {
        image: cameraPhoto,
        text: words.join(' '),
        threshold: threshold.toString(),
      };

      // Make request to local backend
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

  const handlePrint = () => {
    if (!resultImage) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Word Cloud</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }
              img {
                max-width: 100%;
                height: auto;
              }
              @media print {
                body {
                  margin: 0;
                }
                img {
                  width: 4in;
                  height: 6in;
                  object-fit: contain;
                }
              }
            </style>
          </head>
          <body>
            <img src="${resultImage}" alt="Word Cloud" />
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
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

          {/* Action Buttons Row */}
          <div className="flex items-center justify-center gap-4">
            {resultImage && (
              <button
                onClick={handlePrint}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 font-semibold"
              >
                <Printer className="w-5 h-5" />
                Print
              </button>
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
