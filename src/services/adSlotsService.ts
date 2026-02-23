import {
  makeGetRequest,
  makePostRequest,
  makePutRequest,
  makeDeleteRequest,
} from "../config/Api";

export interface AdSlot {
  id: number;
  title: string;
  description: string | null;
  price: number;
  adPageId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdSlotPayload {
  title: string;
  description?: string;
  price: number;
  adPageId: number;
}

export interface UpdateAdSlotPayload {
  title?: string;
  description?: string;
  price?: number;
  adPageId?: number;
}

export const getAdSlots = async (pageId: number) => {
  return makeGetRequest(`ad-slots/${pageId}`);
};

export const createAdSlot = async (payload: CreateAdSlotPayload) => {
  return makePostRequest("ad-slots", payload);
};

export const updateAdSlot = async (
  id: number,
  payload: UpdateAdSlotPayload,
) => {
  return makePutRequest(`ad-slots/${id}`, payload);
};

export const deleteAdSlot = async (id: number) => {
  return makeDeleteRequest(`ad-slots/${id}`);
};
