import {BarcodeScanner} from "react-barcode-scanner";
import type {DetectedBarcode} from "react-barcode-scanner/lib/types";

// import "react-barcode-scanner/polyfill"
type QrScannerProps = {
    onOrderScanned: (order: string) => void;
}

export function QrScanner(props: QrScannerProps){

    const handleBarCodes  = (qrCodes: DetectedBarcode[]) => {
        const match = qrCodes.find((val) => JSON.parse(val.rawValue).type === 'order');
        const orderId = JSON.parse(match?.rawValue).id;
        props.onOrderScanned(orderId);

    }

    return (<>
        <BarcodeScanner onCapture={handleBarCodes}/>
    </>);
}

export default QrScanner;
