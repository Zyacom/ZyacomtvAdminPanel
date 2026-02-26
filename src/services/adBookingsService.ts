import {
  makeGetRequest,
  makePostRequest,
  makeDeleteRequest,
} from "../config/Api";

const baseUrl = "admin/ad-bookings";

export type BookingStatus =
  | "active"
  | "approved"
  | "payment_pending"
  | "completed"
  | "rejected"
  | "disabled";

export interface AdBookingUser {
  id: number;
  fullName: string;
  email: string;
}

export interface AdBookingSlot {
  id: number;
  title: string;
  price: number;
  adPage?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface AdBooking {
  id: number;
  userId: number;
  adSlotId: number;
  title: string;
  description: string | null;
  mediaType: "image" | "video";
  mediaUrl: string;
  websiteUrl: string | null;
  status: BookingStatus;
  scheduledDate: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: AdBookingUser;
  adSlot?: AdBookingSlot;
}

export interface BookingStats {
  total: number;
  active: number;
  approved: number;
  payment_pending: number;
  completed: number;
  rejected: number;
  disabled: number;
  deleted: number;
}

export interface GetAllBookingsParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const getAllBookings = async (params?: GetAllBookingsParams) => {
  return makeGetRequest(baseUrl, undefined, params);
};

export const getDeletedBookings = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return makeGetRequest(`${baseUrl}/deleted`, undefined, params);
};

export const getBookingById = async (id: number) => {
  return makeGetRequest(`${baseUrl}/${id}`);
};

export const approveBooking = async (id: number) => {
  return makePostRequest(`${baseUrl}/${id}/approve`, {});
};

export const rejectBooking = async (id: number, reason?: string) => {
  return makePostRequest(`${baseUrl}/${id}/reject`, { reason: reason || "" });
};

export const disableBooking = async (id: number) => {
  return makePostRequest(`${baseUrl}/${id}/disable`, {});
};

export const enableBooking = async (id: number) => {
  return makePostRequest(`${baseUrl}/${id}/enable`, {});
};

export const deleteBooking = async (id: number) => {
  return makeDeleteRequest(`${baseUrl}/${id}`);
};

export const restoreBooking = async (id: number) => {
  return makePostRequest(`${baseUrl}/${id}/restore`, {});
};

export const permanentDeleteBooking = async (id: number) => {
  return makeDeleteRequest(`${baseUrl}/${id}/permanent`);
};