import axios from "axios";

export const externalApi = axios.create({
  timeout: 15_000,
});
