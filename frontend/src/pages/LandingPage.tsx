import msmBg from "../assets/mosaic-street-ministry-bg.png";

function LandingPage() {
    return (
        <>
            <div id={'content'} style={{height: '660px',
                width: '100%',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundImage: `url(${msmBg})`, paddingTop: '560px'}}>
            </div>
        </>)}

export default LandingPage;
