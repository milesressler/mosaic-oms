import client from "./client";


export interface Printer {
    id: number;
    name: string;
    description: string;
    state: string;
    computer: {
        name: string;
        state: string;
    };
    default: boolean;
}


export interface PrintJobResponse {
    id: number;
    title: string;
    state: string;
    createTimestamp: string | null;
    printerId: number;
    printerName: string;
}

const getAllPrinters = () =>
    client.get<Printer[]>("/admin/printers");

const getPrintJobs = (id: string) =>
    client.get<PrintJobResponse[]>(`/admin/printer/${id}/print-jobs`);

const getConfiguredPrinterId = () =>
    client.get<number>("/admin/configured-printer-id");

export default {
    getAllPrinters,
    getPrintJobs,
    getConfiguredPrinterId,
};
