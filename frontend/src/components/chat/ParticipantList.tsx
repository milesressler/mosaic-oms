import { Badge, Box, Flex, Group, Stack, Text, UnstyledButton } from '@mantine/core';
import { memo } from 'react';
import { ChatParticipant } from 'src/models/chat';
import { AssigneeAvatar } from 'src/components/orders/AssigneeAvatar';

interface ParticipantListProps {
  participants: ChatParticipant[];
  selectedParticipant: ChatParticipant | null;
  participantUnreadCount: Record<string, number>;
  onSelectParticipant: (participant: ChatParticipant) => void;
}

const ParticipantList = memo(function ParticipantList({
  participants,
  selectedParticipant,
  participantUnreadCount,
  onSelectParticipant
}: ParticipantListProps) {
  
  return (
    <Stack gap="xs">
      {participants.map(participant => {
        const unreadCount = participantUnreadCount[participant.externalId] || 0;
        const isSelected = selectedParticipant?.uuid === participant.uuid;
        
        return (
          <UnstyledButton
            key={participant.uuid}
            p="xs"
            bg={isSelected ? 'blue.0' : undefined}
            onClick={() => onSelectParticipant(participant)}
            w="100%"
          >
            <Group justify="space-between" align="flex-start">
              <Group gap="sm" align="flex-start" style={{ flex: 1, minWidth: 0 }}>
                <Box style={{ position: 'relative' }}>
                  <AssigneeAvatar assigned={participant} />
                  {participant.isOnline && (
                    <Box
                      style={{
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                        width: 12,
                        height: 12,
                        backgroundColor: 'var(--mantine-color-green-5)',
                        border: '2px solid white',
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                  )}
                </Box>
                <Flex direction="column" style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={500}>{participant.name}</Text>
                  {participant.lastMessageContent && (
                    <Text size="xs" c="dimmed" truncate style={{ maxWidth: '200px' }}>
                      {participant.lastMessageFromMe ? 'You: ' : ''}
                      {participant.lastMessageContent}
                    </Text>
                  )}
                </Flex>
              </Group>
              {unreadCount > 0 && (
                <Badge
                  size="xs"
                  variant="filled"
                  color="red"
                  style={{
                    minWidth: 16,
                    height: 16,
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 600,
                    flexShrink: 0
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Group>
          </UnstyledButton>
        );
      })}
    </Stack>
  );
});

export default ParticipantList;