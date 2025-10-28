import { Home, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';

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
      const response = await fetch('http://127.0.0.1:5000/generate', {
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
    } catch (err) {
      console.error('Error generating word cloud:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate word cloud');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!resultImage) return;

    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;

    iframeDoc.open();
    iframeDoc.write(`
      <html>
        <head>
          <title>Print Word Cloud</title>
          <style>
            @media print {
              @page {
                size: 4in 6in;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
              img {
                width: 4in;
                height: 6in;
                object-fit: contain;
                display: block;
              }
            }
          </style>
        </head>
        <body>
          <img src="${resultImage}" alt="Word Cloud" />
        </body>
      </html>
    `);
    iframeDoc.close();

    // Wait for image to load then print
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();

        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 250);
    };
  };

  return (
    <div className="min-h-screen p-8 flex items-center justify-center bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/bg5.png)' }}>
      <div className="max-w-4xl w-full">
        <div className="mt-64 p-8">
          {/* Output Image - Large Display */}
          {loading ? (
            <div className="flex items-center justify-center h-96 mb-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#FFCD11] mx-auto mb-4"></div>
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
                <div className=" p-4 mb-6">
                  <img
                    src={resultImage}
                    alt="Word Cloud"
                    className="w-full h-auto "
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
          {!loading && resultImage && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handlePrint}
                className="px-12 py-3 bg-black text-[#FFCD11] border-2 border-[#FFCD11] text-2xl hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 font-semibold"
              >

                Print
              </button>
              <button
                onClick={onHome}
                className="px-12 text-2xl py-3 bg-[#FFCD11] text-black hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 font-semibold"
              >
                Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultScreen;
