import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PhoneFrame } from './components/PhoneFrame';
import { SplashScreen } from './components/SplashScreen';
import { BottomNav } from './components/BottomNav';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { LibraryScreen } from './screens/LibraryScreen';
import { MyPhotosScreen } from './screens/MyPhotosScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { useAppStore } from './stores/useAppStore';
import { PhotoUploadSheet } from './components/PhotoUploadSheet';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { ResultScreen } from './components/ResultScreen';
import { UpgradeModal } from './components/UpgradeModal';
import { STYLES } from './data/styles';

type FlowStage = 'idle' | 'upload' | 'processing' | 'result';

export default function App() {
  const splashDone = useAppStore((s) => s.splashDone);
  const activeTab = useAppStore((s) => s.activeTab);
  const pendingStyleId = useAppStore((s) => s.pendingStyleId);
  const setPendingStyleId = useAppStore((s) => s.setPendingStyleId);
  const pendingSrc = useAppStore((s) => s.pendingSrc);
  const setPendingSrc = useAppStore((s) => s.setPendingSrc);
  const consumeDaily = useAppStore((s) => s.consumeDaily);

  const [flow, setFlow] = useState<FlowStage>('idle');

  const pendingStyle = pendingStyleId ? STYLES.find((s) => s.id === pendingStyleId) : null;

  // Open the upload sheet when a style is selected without an image yet.
  useEffect(() => {
    if (!pendingStyleId) {
      setFlow('idle');
      return;
    }
    if (pendingSrc) {
      // We already have a source (e.g. coming from "Re-edit" or "Restyle").
      if (!consumeDaily()) {
        setPendingStyleId(null);
        return;
      }
      setFlow('processing');
    } else {
      setFlow('upload');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingStyleId, pendingSrc]);

  const closeFlow = () => {
    setPendingStyleId(null);
    setPendingSrc(null);
    setFlow('idle');
  };

  const onPickedPhoto = (src: string) => {
    // Setting pendingSrc triggers the effect below, which is the single
    // source of truth for consuming a daily regrade.
    setPendingSrc(src);
  };

  return (
    <PhoneFrame>
      <AnimatePresence>{!splashDone && <SplashScreen />}</AnimatePresence>

      {/* Screens */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            {activeTab === 'discover' && <DiscoverScreen />}
            {activeTab === 'library' && <LibraryScreen />}
            {activeTab === 'photos' && <MyPhotosScreen />}
            {activeTab === 'profile' && <ProfileScreen />}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav />

      {/* Regrade flow */}
      <PhotoUploadSheet
        open={flow === 'upload' && !!pendingStyle}
        styleName={pendingStyle?.name ?? ''}
        onClose={closeFlow}
        onPicked={onPickedPhoto}
      />

      <AnimatePresence>
        {flow === 'processing' && pendingStyle && pendingSrc && (
          <ProcessingOverlay
            key="processing"
            styleName={pendingStyle.name}
            src={pendingSrc}
            onDone={() => setFlow('result')}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {flow === 'result' && pendingStyle && pendingSrc && (
          <ResultScreen
            key="result"
            src={pendingSrc}
            preset={pendingStyle}
            onBack={closeFlow}
            onTryAnother={() => {
              // Keep the same source, return to style selection grid
              setPendingStyleId(null);
              setFlow('idle');
              useAppStore.getState().setActiveTab('library');
              // Preserve pendingSrc so Library tap immediately restyles
            }}
          />
        )}
      </AnimatePresence>

      <UpgradeModal />
    </PhoneFrame>
  );
}
