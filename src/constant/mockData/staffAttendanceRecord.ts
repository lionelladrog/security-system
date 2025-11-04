import { StaffMember } from "../../type";
export interface AttendanceRecord {
  id: number;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
  hours: string;
  notes: string;
}

// Initial mock data
export const initialRecords: AttendanceRecord[] = [
  {
    id: 1,
    date: "2025-10-07",
    checkIn: "09:15 AM",
    checkOut: "06:05 PM",
    status: "late",
    hours: "8h 50m",
    notes: "",
  },
  {
    id: 2,
    date: "2025-10-06",
    checkIn: "08:55 AM",
    checkOut: "06:10 PM",
    status: "present",
    hours: "9h 15m",
    notes: "",
  },
  {
    id: 3,
    date: "2025-10-05",
    checkIn: "-",
    checkOut: "-",
    status: "absent",
    hours: "-",
    notes: "Sick leave",
  },
  {
    id: 4,
    date: "2025-10-04",
    checkIn: "09:02 AM",
    checkOut: "06:00 PM",
    status: "present",
    hours: "8h 58m",
    notes: "",
  },
  {
    id: 5,
    date: "2025-10-03",
    checkIn: "09:00 AM",
    checkOut: "06:15 PM",
    status: "present",
    hours: "9h 15m",
    notes: "",
  },
  {
    id: 6,
    date: "2025-10-02",
    checkIn: "09:20 AM",
    checkOut: "06:00 PM",
    status: "late",
    hours: "8h 40m",
    notes: "",
  },
  {
    id: 7,
    date: "2025-10-01",
    checkIn: "08:58 AM",
    checkOut: "06:05 PM",
    status: "present",
    hours: "9h 7m",
    notes: "",
  },
];
export const defaultInitialStaff: StaffMember[] = [
  {
    id: 1,
    employeeId: "EMP001",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@company.com",
    site: "Main Office",
  },
  {
    id: 2,
    employeeId: "EMP002",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@company.com",
    site: "Branch A",
  },
  {
    id: 3,
    employeeId: "EMP003",
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.brown@company.com",
    site: "Main Office",
  },
  {
    id: 4,
    employeeId: "EMP004",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@company.com",
    site: "Branch B",
  },
  {
    id: 5,
    employeeId: "EMP005",
    firstName: "David",
    lastName: "Wilson",
    email: "david.wilson@company.com",
    site: "Main Office",
  },
  {
    id: 6,
    employeeId: "EMP006",
    firstName: "Lisa",
    lastName: "Anderson",
    email: "lisa.anderson@company.com",
    site: "Branch A",
  },
  {
    id: 7,
    employeeId: "EMP007",
    firstName: "James",
    lastName: "Taylor",
    email: "james.taylor@company.com",
    site: "Branch B",
  },
  {
    id: 8,
    employeeId: "EMP008",
    firstName: "Jessica",
    lastName: "Martinez",
    email: "jessica.martinez@company.com",
    site: "Main Office",
  },
];

export const initialStaff: StaffMember[] = [
  {
    id: 1,
    employeeId: "EMP001",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@company.com",
    site: "Main Office",
  },
  {
    id: 2,
    employeeId: "EMP002",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@company.com",
    site: "Branch A",
  },
  {
    id: 3,
    employeeId: "EMP003",
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.brown@company.com",
    site: "Main Office",
  },
  {
    id: 4,
    employeeId: "EMP004",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@company.com",
    site: "Branch B",
  },
  {
    id: 5,
    employeeId: "EMP005",
    firstName: "David",
    lastName: "Wilson",
    email: "david.wilson@company.com",
    site: "Main Office",
  },
  {
    id: 6,
    employeeId: "EMP006",
    firstName: "Lisa",
    lastName: "Anderson",
    email: "lisa.anderson@company.com",
    site: "Branch A",
  },
  {
    id: 7,
    employeeId: "EMP007",
    firstName: "James",
    lastName: "Taylor",
    email: "james.taylor@company.com",
    site: "Branch B",
  },
  {
    id: 8,
    employeeId: "EMP008",
    firstName: "Jessica",
    lastName: "Martinez",
    email: "jessica.martinez@company.com",
    site: "Main Office",
  },
];
