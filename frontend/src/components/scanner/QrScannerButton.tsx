import { Button, Modal, ActionIcon, useMantineTheme } from "@mantine/core";
import QrScanner from "src/components/scanner/QrScanner.tsx";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconCameraSearch } from "@tabler/icons-react";

type QrModalProps = {
    label?: string;
    onOrderScanned: (order: {id: number, uuid: string}) => void;
};

export function QrScannerButton({ label, onOrderScanned }: QrModalProps) {
    const [opened, { toggle, close }] = useDisclosure(false);
    const isMobile = useMediaQuery("(max-width: 50em)");
    const theme = useMantineTheme();

    const onScan = (order: {id: number, uuid: string} ) => {
        close();
        onOrderScanned(order);
    };

    const shouldShowLabel = label !== "";
    const glow = `${theme.colors[theme.primaryColor][6]}80`;

    return (
        <>
            {shouldShowLabel ? (
                <Button
                    onClick={toggle}
                    variant="outline"
                    rightSection={<IconCameraSearch />}
                >
                    {opened ? "Dismiss Scanner" : label || "Scan Label"}
                </Button>
            ) : (
                <ActionIcon
                    onClick={toggle}
                    variant="filled"
                    color={theme.primaryColor}
                    radius="xl"
                    size="xl" // Larger size for prominence

                    style={{
                        boxShadow: `0 0 8px ${glow}`,          // 🔆 subtle glow
                        transition: 'box-shadow 120ms ease',   // smooth hover
                    }}
                >
                    <IconCameraSearch size={28} color="white" />
                </ActionIcon>
            )}

                <Modal
                    opened={opened}
                    onClose={close}
                    title="Scan the QR code at the top of an order label"
                    fullScreen={isMobile}
                    transitionProps={{ transition: "fade", duration: 200 }}
                >
                    <QrScanner onOrderScanned={onScan} />
                </Modal>
        </>
    );
}

export default QrScannerButton;
