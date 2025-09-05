import { Alert, ActionIcon } from '@mantine/core';
import { IconInfoCircle, IconX } from '@tabler/icons-react';
import { useState, useEffect } from 'react';

const TIP_COOKIE_NAME = 'chat-order-tagging-tip-dismissed';

export default function OrderTaggingTip() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if tip has been dismissed
    const dismissed = document.cookie
      .split('; ')
      .find(row => row.startsWith(TIP_COOKIE_NAME));
    
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    // Set cookie to remember dismissal for 30 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    document.cookie = `${TIP_COOKIE_NAME}=true; expires=${expiryDate.toUTCString()}; path=/`;
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Alert
      variant="light"
      color="blue"
      mb="md"
      icon={<IconInfoCircle size={16} />}
      styles={{
        root: { position: 'relative' },
        closeButton: { position: 'absolute', top: 8, right: 8 }
      }}
    >
      <ActionIcon
        size="xs"
        variant="subtle"
        color="blue"
        onClick={handleDismiss}
        style={{ position: 'absolute', top: 4, right: 4 }}
      >
        <IconX size={12} />
      </ActionIcon>
      <div style={{ paddingRight: '20px' }}>
        <strong>Tip:</strong> Reference orders in your messages by typing #{' '}
        followed by the order number (e.g., #123). Order details will appear automatically!
      </div>
    </Alert>
  );
}