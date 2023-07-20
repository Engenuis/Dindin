import axios from "axios";

export const api = axios.create({
  baseURL: 'https://desafio-backend-03-dindin.pedagogico.cubos.academy/',
  timeout: 10000,
  headers: {'Content-Type': 'Application/json'}
});