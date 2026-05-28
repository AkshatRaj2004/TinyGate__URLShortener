import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';

const QRModal = ({ isOpen, onClose, shortUrl, title }) => {
  const canvasRef = useRef(null);

  const handleDownload = () => {
    const canvas = document.querySelector('#qr-canvas canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `tinygate-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('QR code downloaded!');
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success('URL copied to clipboard!');
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR Code" maxWidth="max-w-sm">
      <div className="flex flex-col items-center gap-5">
        {/* QR canvas */}
        <div
          id="qr-canvas"
          className="p-4 rounded-2xl"
          style={{ background: 'white' }}
          ref={canvasRef}
        >
          <QRCodeCanvas
            value={shortUrl || 'https://tinygate.app'}
            size={200}
            bgColor="#ffffff"
            fgColor="#1a0533"
            level="H"
            includeMargin={false}
          />
        </div>

        {/* Short URL display */}
        <div className="w-full glass rounded-xl px-4 py-2.5 flex items-center justify-between gap-2">
          <span className="text-sm text-purple-300 font-mono truncate">{shortUrl}</span>
          <button
            onClick={handleCopyUrl}
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="btn-ghost flex-1">Close</button>
          <button onClick={handleDownload} className="btn-accent flex-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default QRModal;
