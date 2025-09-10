import {Box, Text, Button, Stack} from '@mantine/core';

export default function DebugPage() {
    return (
        <Box 
            style={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Scrollable content area */}
            <Box 
                p="md" 
                style={{ 
                    flex: 1,
                    overflow: 'auto'
                }}
            >
                <Text size="xl" fw="bold" mb="md">Debug Page</Text>
                
                {/* Top content */}
                <Box mb="md">
                    <Text>This is content at the top</Text>
                    <Box 
                        style={{ 
                            width: '200vw', 
                            height: '100px', 
                            backgroundColor: 'lightblue',
                            border: '2px solid red'
                        }}
                    >
                        <Text>This box is 200vw wide to test horizontal scrolling</Text>
                    </Box>
                </Box>
                
                {/* Middle content - lots of it to force scrolling */}
                <Box mb="md" style={{ backgroundColor: 'lightyellow', border: '1px solid orange', padding: '16px' }}>
                    <Text fw="bold" mb="md">SCROLLABLE MIDDLE CONTENT</Text>
                    {Array.from({ length: 50 }, (_, i) => (
                        <Box key={i} mb="sm" p="sm" style={{ backgroundColor: i % 2 === 0 ? 'white' : 'lightgray', border: '1px solid gray' }}>
                            <Text>Content block #{i + 1} - This is some content that should scroll. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>
                        </Box>
                    ))}
                </Box>
            </Box>
            
            {/* Always visible bottom anchored content */}
            <Box 
                p="md"
                style={{
                    backgroundColor: 'lightgreen',
                    border: '2px solid green',
                    borderRadius: '8px',
                    flexShrink: 0
                }}
            >
                <Stack gap="xs">
                    <Text fw="bold">ALWAYS VISIBLE Bottom Anchored Component</Text>
                    <Text size="sm">This should ALWAYS be visible at the bottom</Text>
                    <Button size="sm" variant="outline">Test Button</Button>
                </Stack>
            </Box>
        </Box>
    );
}
