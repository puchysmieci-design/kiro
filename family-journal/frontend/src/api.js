import axios from 'axios'

// W development proxy Vite obsługuje przekierowanie do localhost:5000
// W produkcji trzeba podać URL backendu w zmiennej VITE_API_URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 10000,
  withCredentials: true,
})

export default api
