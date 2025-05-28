import { Box, Text, Button, useMantineTheme } from '@mantine/core';

export const StyleTest = () => {
    const theme = useMantineTheme();

    return (
        <Box
            style={{
                height: '100%',            // for debugging—replace with "100%" when in AppShell.Main
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,               // let children shrink
            }}
        >
            {/* scrollable content */}
            <Box
                style={{
                    flex: 1,
                    minHeight: 0,             // critical in flex layouts!
                    overflowY: 'auto',
                    padding: theme.spacing.md,
                }}
            >
                <Text>…lots of dynamic content…</Text>
                <Text>More lines…</Text>
                <Text>Even more…</Text>
            </Box>

            {/* sticky footer */}
            <Box
                style={{
                    flex: '0 0 60px',         // fixed height
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingLeft: theme.spacing.md,
                    paddingRight: theme.spacing.md,
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    borderTop: `1px solid ${theme.colors.gray[2]}`,
                    backgroundColor: theme.white,
                }}
            >
                <Button variant="default">Cancel</Button>
                <Button>Submit</Button>
            </Box>
        </Box>
    );
};

export default StyleTest;
