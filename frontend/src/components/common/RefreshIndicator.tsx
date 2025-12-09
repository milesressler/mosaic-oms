import { Group, RingProgress, Text, UnstyledButton, Tooltip } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { useState } from "react";

interface RefreshIndicatorProps {
    progress: number;
    onRefresh?: () => void;
    showSecondsRemaining?: boolean;
    refreshInterval?: number;
    size?: number;
    thickness?: number;
}

export function RefreshIndicator({
    progress,
    onRefresh,
    showSecondsRemaining = false,
    refreshInterval = 30000,
    size = 25,
    thickness = 2
}: RefreshIndicatorProps) {
    const [isHovered, setIsHovered] = useState(false);
    
    const secondsRemaining = refreshInterval ? Math.ceil((100 - progress) * refreshInterval / 100 / 1000) : 0;
    
    const ringColor = 'rgba(' + (255 - Math.min(100, progress) / 100 * 254) + ',255, ' + (255 - Math.min(100, progress) / 100 * 254) + ',  1)';
    
    const centerContent = () => {
        if (isHovered && onRefresh) {
            return (
                <IconRefresh 
                    size={size * 0.4} 
                    stroke={1.5}
                    style={{ color: 'var(--mantine-color-gray-6)' }}
                />
            );
        }
        
        if (showSecondsRemaining) {
            return (
                <Text size="xs" c="dimmed" ta="center" lh={1}>
                    {secondsRemaining}
                </Text>
            );
        }
        
        return null;
    };
    
    return (
        <Group justify="flex-end">
            <Tooltip label="Click to refresh now" position="top">
                <UnstyledButton
                    onClick={onRefresh}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{
                        cursor: onRefresh ? 'pointer' : 'default',
                        transition: 'transform 0.15s ease',
                        transform: isHovered && onRefresh ? 'scale(1.1)' : 'scale(1)',
                    }}
                >
                    <RingProgress
                        size={size}
                        thickness={thickness}
                        sections={[{
                            value: Math.min(100, progress),
                            color: ringColor
                        }]}
                        label={centerContent()}
                    />
                </UnstyledButton>
            </Tooltip>
        </Group>
    );
}