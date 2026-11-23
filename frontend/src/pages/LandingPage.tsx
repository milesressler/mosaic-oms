import msmBg from "../assets/mosaic-street-ministry-bg.png";
import {useNavigate} from "react-router-dom";
import {useAuth0} from "@auth0/auth0-react";
import {useEffect} from "react";
import {useFeatures} from "src/context/FeaturesContext.tsx";

function LandingPage() {
    const navigate = useNavigate();
    const { isAuthenticated} = useAuth0();
    const { activeSpecialEvent, featuresLoaded } = useFeatures();

    // While a special event is running, start on its page instead of the filler queue
    useEffect(() => {
        if (!isAuthenticated) return;
        if (featuresLoaded) {
            navigate(activeSpecialEvent ? "/dashboard/event" : "/dashboard/filler");
            return;
        }
        // Don't strand people here if the feature config is slow or fails to load
        const fallback = setTimeout(() => navigate("/dashboard/filler"), 3000);
        return () => clearTimeout(fallback);
    }, [isAuthenticated, featuresLoaded]);


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
