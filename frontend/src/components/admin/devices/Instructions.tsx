import { useState, useEffect } from "react";
import { List, Code, Button, Text } from "@mantine/core";
import {Link} from "react-router-dom";

function Instructions() {
    // Use current domain (fallback for server-side rendering)
    const currentDomain =
        typeof window !== "undefined" ? window.location.origin : "";

    // Define the file content, injecting the dynamic domain in the Exec line
    const fileContent = `[Desktop Entry]
Type=Application
Name=Firefox Kiosk
Exec=chromium-browser --kiosk --noerrdialogs --disable-session-crashed-bubble --disable-infobars --disable-translate --no-first-run --zoom=4 ${currentDomain}/dashboard/public
GNOME-Autostart-enabled=true
`;

    const [downloadUrl, setDownloadUrl] = useState("");

    // Create a blob URL for the downloadable file
    useEffect(() => {
        const blob = new Blob([fileContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [fileContent]);

    return (
        <>
            <Text mb={'xs'} size={'l'}>
                Complete setup:
            </Text>

            <List spacing="sm" size="sm" mt="md">
               {/*<List.Item>*/}
               {/*     Download and save <Button*/}
               {/*        component="a"*/}
               {/*        href={downloadUrl}*/}
               {/*        download="mosaic.desktop"*/}
               {/*        variant="light"*/}
               {/*        size="xs"*/}
               {/*    >mosaic.desktop*/}
               {/*</Button> to <Code>~/.config/autostart/mosaic.desktop</Code>  to open app in kiosk mode on startup (may need to make file executable)*/}
               {/* </List.Item>*/}
               {/* <List.Item>*/}
               {/*     <Code block>{fileContent}</Code>*/}
               {/* </List.Item>*/}
                <List.Item>
                    Navigate to{" "}
                    <Link to="/kiosk" >
                        {currentDomain}/kiosk
                    </Link>
                </List.Item>
                <List.Item>Set an appropriate zoom level for the display</List.Item>
                <List.Item>Reboot device</List.Item>
            </List>
        </>
    );
}

export default Instructions;
