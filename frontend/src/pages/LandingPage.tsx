import msmBg from "../assets/mosaic-street-ministry-bg.png";

function LandingPage() {
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
