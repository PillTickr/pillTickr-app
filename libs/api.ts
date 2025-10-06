import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8090", // replace with your backend URL
});

// Medicines
export const getMedicines = () => API.get("/medicines");
export const createMedicine = (data: any) => API.post("/medicines", data);

// Schedules
export const getSchedules = () => API.get("/schedules");
export const createSchedule = (data: any) => API.post("/schedules", data);

// Reminders
export const getReminders = () => API.get("/reminders");
