import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ImagePlus, X } from 'lucide-react';
import { useRef } from 'react';
import { readFileAsDataURL, resizeImage } from '../utils/imageHelpers';

interface Props {
  open: boolean;
  styleName: string;
  onClose: () => void;
  onPicked: (dataUrl: string) => void;
}

export function PhotoUploadSheet({ open, styleName, onClose, onPicked }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const raw = await readFileAsDataURL(file);
    const resized = await resizeImage(raw, 1920);
    onPicked(resized);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.3 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 || info.velocity.y > 500) onClose();
            }}
            className="absolute inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-white/10 bg-surface/95 backdrop-blur-xl shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.6)]"
          >
            <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-white/15" />
            <div className="flex items-center justify-between px-5 pt-4">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-text-muted">
                  Apply style
                </p>
                <h3 className="text-[20px] font-bold text-white">{styleName}</h3>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 hover:text-white"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-5 pb-8">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => cameraRef.current?.click()}
                className="flex flex-col items-start gap-3 rounded-2xl border border-white/8 bg-bg-tertiary/80 p-4 text-left"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-gradient-end shadow-glow-sm">
                  <Camera size={20} strokeWidth={2.4} className="text-white" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-white">Take Photo</p>
                  <p className="text-[11px] text-text-secondary">Use your camera</p>
                </div>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => galleryRef.current?.click()}
                className="flex flex-col items-start gap-3 rounded-2xl border border-white/8 bg-bg-tertiary/80 p-4 text-left"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gradient-end to-accent shadow-glow-sm">
                  <ImagePlus size={20} strokeWidth={2.4} className="text-white" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-white">Gallery</p>
                  <p className="text-[11px] text-text-secondary">Choose a photo</p>
                </div>
              </motion.button>
            </div>

            <p className="px-5 pb-5 text-center text-[11px] text-text-muted">
              Your photos are processed on your device. Nothing is uploaded.
            </p>

            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
