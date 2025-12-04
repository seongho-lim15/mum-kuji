import api from "@/lib/api";

const axios = api;

export const postLogin = async ({ email, password }) => {
  const result = await axios.post("/auth/login", { email, password });
  return result.data;
};

export const postSignUp = async ({ email, password }) => {
  const result = await axios.post("/auth/register", { email, password });
  return result.data;
};
