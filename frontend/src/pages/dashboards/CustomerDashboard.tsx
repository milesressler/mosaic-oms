import { Box, Paper } from "@mantine/core";
import Transit from "src/components/transit/Transit.tsx";
import { useEffect } from "react";
import TimeWidget from "src/components/TimeWidget.tsx";
import ShowersWidget from "src/components/widgets/ShowersWidget";
import OrdersWidget from "src/components/widgets/OrdersWidget";

const CustomerDashboard = () => {


    useEffect(() => {
        // This periodically hard refreshes the page, so that long running kiosks will get new code as its deployed
        const autoRefresh = setInterval(() => {
            window.location.reload();
        }, 30 * 60 * 1000);
        return () => clearInterval(autoRefresh);
    }, []);

    return (
        <Box style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Main content area above Transit */}
            <Box style={{ flexGrow: 1, display: "flex", overflow: "hidden" }}>
                {/* Left: Orders Widget */}
                <OrdersWidget />

                {/* Right: TimeWidget + ShowersWidget */}
                <Box style={{ flex: 1, display: "flex", flexDirection: "column", padding: "1rem", gap: "0.5rem", overflow: "hidden" }}>
                    <Paper
                        shadow="sm"
                        radius="md"
                        withBorder
                        p="md"
                        style={{ flex: "1 1 20%", display: "flex", justifyContent: "center", alignItems: "center" }}
                    >
                        <TimeWidget />
                    </Paper>
                    <Paper
                        shadow="sm"
                        radius="md"
                        withBorder
                        p="md"
                        style={{ flex: "1 1 80%", overflow: "hidden" }}
                    >
                        <ShowersWidget />
                    </Paper>
                </Box>
            </Box>

            {/* Footer: Transit */}
            <Box style={{ borderTop: "1px solid #eee" }}>
                <Transit />
            </Box>
        </Box>
    );
};

export default CustomerDashboard;
