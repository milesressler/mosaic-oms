import { Scanner } from '@yudiel/react-qr-scanner';

type QrScannerProps = {
    onOrderScanned: (order: {id: number, uuid: string}) => void;
}

export function QrScanner(props: QrScannerProps){
    const handleBarCodes  = (qrCodes: any[]) => {
        const match = qrCodes.find((val) => JSON.parse(val.rawValue).type === 'order');
        const orderId = JSON.parse(match?.rawValue).id;
        const orderUuid = JSON.parse(match?.rawValue).uuid;
        props.onOrderScanned({id: orderId, uuid: orderUuid});
    }

    return (<>
        <Scanner onScan={handleBarCodes}/>
    </>);
}

export default QrScanner;
