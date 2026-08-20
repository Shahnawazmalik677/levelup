import React from 'react';
import { Portal, Dialog, Text, Button } from 'react-native-paper';
import { colors } from '../../constants/theme';
import { styles } from './styles';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel,
  destructive = false,
  onConfirm,
  onDismiss,
}) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title style={styles.title}>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={styles.message}>
            {message}
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          {cancelLabel && (
            <Button textColor={colors.textSecondary} onPress={onDismiss}>
              {cancelLabel}
            </Button>
          )}
          <Button
            textColor={destructive ? colors.error : colors.primary}
            onPress={onConfirm}
          >
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
