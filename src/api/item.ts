import api from "@/lib/api";
import { AddCategoryRequest, AddCategoryResponse } from "@/types/item";

const axios = api;

/**
 * 새 품목 추가
 * @param req
 */
export const postAddCategory = async (
  req: AddCategoryRequest,
): Promise<AddCategoryResponse> => {
  const result = await axios.post("/data/items", req);
  return result.data;
};
