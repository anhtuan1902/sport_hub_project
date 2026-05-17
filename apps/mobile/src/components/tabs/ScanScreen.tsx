// Scan Tab Screen (QR Code Scanner)
import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { QrCode, Star, Plus } from 'lucide-react-native';
import { Colors } from '@/src/constants/colors';
import { scale, spacing } from '@/src/utils';

type ScanScreenProps = {
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

const { width: SCREEN_W } = Dimensions.get('window');
const SCAN_SIZE = SCREEN_W - scale(96);

const ScanScreenComponent: React.FC<ScanScreenProps> = () => {
  return (
    <View style={styles.container}>
      {/* QR Scanner Frame */}
      <View style={styles.scannerContainer}>
        <View style={styles.scannerFrame}>
          {/* Corner decorations */}
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />

          {/* Scanner area */}
          <View style={styles.scanArea}>
            <QrCode size={120} color={Colors.brand.neon} style={styles.qrPlaceholder} />
            <View style={styles.scanLine} />
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionTitle}>
            Đưa mã QR vào khung
          </Text>
          <Text style={styles.instructionText}>
            Hệ thống sẽ tự nhận diện và quét mã của bạn
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <View style={styles.actionIconContainer}>
            <Star size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.actionLabel}>My Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <View style={styles.actionIconContainer}>
            <Plus size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.actionLabel}>Upload</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  scannerContainer: {
    alignItems: 'center',
  },
  scannerFrame: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: scale(48),
    height: scale(48),
    borderColor: Colors.brand.neon,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: scale(12),
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: scale(12),
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: scale(12),
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: scale(12),
  },
  scanArea: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  qrPlaceholder: {
    opacity: 0.2,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.brand.neon,
    shadowColor: Colors.brand.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: scale(8),
  },
  instructionsContainer: {
    alignItems: 'center',
    marginTop: spacing.xxxl,
  },
  instructionTitle: {
    fontSize: scale(20),
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  instructionText: {
    fontSize: scale(14),
    fontWeight: '500',
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    maxWidth: scale(200),
    lineHeight: scale(22),
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: scale(24),
    marginTop: scale(48),
  },
  actionButton: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionIconContainer: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(24),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionLabel: {
    fontSize: scale(10),
    fontWeight: '900',
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
  },
});

export const ScanScreen = memo(ScanScreenComponent);
