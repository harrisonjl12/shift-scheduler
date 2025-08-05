import axios from 'axios';

export const API = axios.create({
    baseURL: 'https://shift-scheduler-api-lz8q.onrender.com',
});