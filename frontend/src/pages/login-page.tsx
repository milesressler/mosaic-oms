import mosaicLogo from "../assets/Mosaic-Church-logo-horizontal-web-dark-180-pad.png";
import LoginButton from "../components/auth0/login-button.tsx";

function LoginPage() {
    return (
        <>
            <div>
                <a href="https://mosaicchurchaustin.com" target="_blank">
                    <img src={mosaicLogo} className="logo" alt="Mosaic Church logo" />
                </a>
            </div>
            <h1>Mosaic Street Ministry</h1>
            <h2>Order Management</h2>
            <div className="card">
                <LoginButton></LoginButton>
            </div>
        </>)}

export default LoginPage;