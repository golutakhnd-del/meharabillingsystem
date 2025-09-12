import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScanLine, X } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (isScanning) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          onScan(decodedText);
          setIsScanning(false);
          scannerRef.current?.clear();
        },
        (error) => {
          // Handle scan errors silently
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [isScanning, onScan]);

  return (
    <Card className="fixed inset-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="flex items-center justify-between w-full max-w-md mb-4">
          <div className="flex items-center gap-2">
            <ScanLine className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Scan Barcode</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="w-full max-w-md">
          <div id="qr-reader" className="border rounded-lg overflow-hidden"></div>
        </div>
        
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Point your camera at a barcode or QR code
        </p>
      </div>
    </Card>
  );
}