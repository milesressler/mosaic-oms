import client from "./client";
import {
    ShowerReservationResponse,
    Page, ShowerQueueResponse,
} from "src/models/types.tsx";

// GET /reservations/shower/queue
const getShowerQueue = () =>
    client.get<ShowerQueueResponse>("/reservations/shower/queue");

// GET /reservations/shower/queue
const getPublicShowerQueue = () =>
    client.get<ShowerQueueResponse>("/reservations/shower/public");

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

// PUT /reservations/{id}/move-up
const moveUp = (id: string) =>
    client.put<ShowerReservationResponse>(`/reservations/${id}/move-up`);

// PUT /reservations/{id}/move-down
const moveDown = (id: string) =>
    client.put<ShowerReservationResponse>(`/reservations/${id}/move-down`);

// PUT /reservations/{id}/start
const startShower = (id: string) =>
    client.put<ShowerReservationResponse>(`/reservations/${id}/start`);

// PUT /reservations/{id}/start
const showerReady = (id: string, showerNumber: number) =>
    client.put<ShowerReservationResponse>(`/reservations/${id}/ready`, { showerNumber });

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
    moveUp,
    moveDown,
    startShower,
    showerReady,
    endShower,
    cancelReservation,
    getPublicShowerQueue,
};
