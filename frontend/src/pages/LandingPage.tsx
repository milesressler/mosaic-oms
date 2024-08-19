import msmBg from "../assets/mosaic-street-ministry-bg.png";
import {useNavigate} from "react-router-dom";
import {useAuth0} from "@auth0/auth0-react";

function LandingPage() {
    const navigate = useNavigate();
    const { isAuthenticated} = useAuth0();
    if (isAuthenticated) {
        navigate("/dashboard/filler")
    }

    return (
        <>
            <div style={{height: '3000px',
                width: '100%',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundImage: `url(${msmBg})`,
                paddingTop: '200px',
                }}>
            </div>
        </>)}

export default LandingPage;
