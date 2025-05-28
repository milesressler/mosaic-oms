import msmBg from "../assets/mosaic-street-ministry-bg.png";
import {useNavigate} from "react-router-dom";
import {useAuth0} from "@auth0/auth0-react";
import {useEffect} from "react";

function LandingPage() {
    const navigate = useNavigate();
    const { isAuthenticated} = useAuth0();


    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard/filler")
        }
    }, []);


    return (
        <>
            <div
                style={{
                    height: 'auto',             // Allows it to grow if needed
                    width: '100%',
                    backgroundImage: `url(${msmBg})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'top center',
                    paddingTop: 'calc(100vh - 60px)',
                }}
            ></div>


        </>)}

export default LandingPage;
