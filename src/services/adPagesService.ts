import {
  makeGetRequest,
  makePostRequest,
  makePutRequest,
  makeDeleteRequest,
} from "../config/Api";

const baseUrl = "ad-pages";

export interface AdPage {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  slots?: any[];
}

export interface CreateAdPagePayload {
  name: string;
  slug: string;
  description?: string;
  status?: "active" | "inactive";
}

export interface UpdateAdPagePayload {
  name?: string;
  slug?: string;
  description?: string;
  status?: "active" | "inactive";
}

export const getAdPages = async () => {
  return makeGetRequest(baseUrl);
};

export const createAdPage = async (payload: CreateAdPagePayload) => {
  return makePostRequest(baseUrl, payload);
};

export const updateAdPage = async (
  id: number,
  payload: UpdateAdPagePayload,
) => {
  return makePutRequest(`${baseUrl}/${id}`, payload);
};

export const deleteAdPage = async (id: number) => {
  return makeDeleteRequest(`${baseUrl}/${id}`);
};
