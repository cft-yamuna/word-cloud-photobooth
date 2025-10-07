import { useEffect, useRef } from 'react';
import QRCodeLib from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
}

function QRCode({ value, size = 200 }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCodeLib.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      }).catch((err: Error) => {
        console.error('Error generating QR code:', err);
      });
    }
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      className="border-4 border-white shadow-lg rounded-lg"
    />
  );
}

export default QRCode;
