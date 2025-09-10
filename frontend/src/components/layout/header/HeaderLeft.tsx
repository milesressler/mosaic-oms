import { Burger, Group } from "@mantine/core";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import mosaicLogo from "src/assets/Mosaic-Church-logo-horizontal-web-dark-180-pad.png";

interface HeaderLeftProps {
    isMonitor: boolean;
    opened: boolean;
    onToggle: () => void;
    onAsideClose: () => void;
}

export function HeaderLeft({ isMonitor, opened, onToggle, onAsideClose }: HeaderLeftProps) {
    const { isAuthenticated } = useAuth0();

    const handleBurgerClick = () => {
        onToggle();
        onAsideClose();
    };

    return (
        <Group>
            {isAuthenticated && !isMonitor && (
                <Burger opened={opened} onClick={handleBurgerClick} size="sm" />
            )}
            <Link to="/">
                <img src={mosaicLogo} className="m-logo" alt="Mosaic Church logo" />
            </Link>
        </Group>
    );
}