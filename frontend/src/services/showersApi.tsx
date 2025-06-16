import client from "./client";
import {
    ShowerReservationGroupedResponse,
    ShowerReservationResponse,
    Page,
} from "src/models/types.tsx";

// GET /reservations/shower/queue
const getShowerQueue = () =>
    client.get<ShowerReservationGroupedResponse>("/reservations/shower/queue");

// GET /reservations/shower
const getAllReservations = (params?: object) =>
    client.get<Page<ShowerReservationResponse>>("/reservations/shower", { params });

// POST /reservations/shower
const createReservation = (data: {
    customerUuid?: string;
    customerFirstName?: string;
    customerLastName?: string;
    notes?: string;
}) => client.post<ShowerReservationResponse>("/reservations/shower", data);

// PUT /reservations/{id}/position
const updatePosition = (id: string, newPosition: number) =>
    client.put<ShowerReservationResponse>(`/reservations/${id}/position`, { newPosition });

// PUT /reservations/{id}/start
const startShower = (id: string, showerNumber: number) =>
    client.put<ShowerReservationResponse>(`/reservations/${id}/start`, { showerNumber });

const endShower = (id: string) =>
    client.put<ShowerReservationResponse>(`/reservations/${id}/end`);

// DELETE /reservations/{id}
const cancelReservation = (id: string) =>
    client.delete<ShowerReservationResponse>(`/reservations/${id}`);

export default {
    getShowerQueue,
    getAllReservations,
    createReservation,
    updatePosition,
    startShower,
    endShower,
    cancelReservation,
};
