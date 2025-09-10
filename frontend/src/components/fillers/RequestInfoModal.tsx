import { Modal, TextInput, Button, Group, Stack, Text } from '@mantine/core';
import { useState } from 'react';

interface RequestInfoModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
  orderNumber?: number;
}

export default function RequestInfoModal({ opened, onClose, onConfirm, orderNumber }: RequestInfoModalProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(comment.trim());
      setComment('');
      onClose();
    } catch (error) {
      console.error('Error requesting info:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setComment('');
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Request More Information"
      size="md"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {orderNumber ? `Order #${orderNumber}` : 'This order'} will be sent back to the order taker for more information.
        </Text>

        <TextInput
          label="What information is missing?"
          placeholder="e.g., Size for t-shirt, Color preference, etc."
          value={comment}
          onChange={(event) => setComment(event.currentTarget.value)}
          required
          error={!comment.trim() && isSubmitting ? 'Please describe what information is needed' : ''}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleSubmit();
            }
          }}
          autoFocus
          size={'lg'}
        />

        <Group justify="flex-end">
          <Button 
            variant="subtle" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!comment.trim()}
          >
            Request Info
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
