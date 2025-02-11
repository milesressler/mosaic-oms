import { Scanner } from '@yudiel/react-qr-scanner';

type QrScannerProps = {
    onOrderScanned: (order: string) => void;
}

export function QrScanner(props: QrScannerProps){

    const handleBarCodes  = (qrCodes: any[]) => {
        const match = qrCodes.find((val) => JSON.parse(val.rawValue).type === 'order');
        const orderId = JSON.parse(match?.rawValue).id;
        props.onOrderScanned(orderId);

    }

    return (<>
        <Scanner onScan={handleBarCodes}/>
    </>);
}

export default QrScanner;
