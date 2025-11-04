// Mock data for frontend-only SafeWatch Attendance System

export interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "manager" | "user";
}

export interface StaffMember {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  site: string;
  position: string;
  department: string;
  status: "active" | "inactive" | "on-leave";
  hireDate: string;
}

export interface AttendanceRecord {
  id: number;
  staffId: number;
  employeeId: string;
  name: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: "present" | "late" | "absent" | "leave";
  hours: number;
  site: string;
  notes?: string;
}

// Mock users
export const mockUsers: User[] = [
  {
    id: 1,
    email: "admin@safewatch.com",
    name: "Admin User",
    role: "admin",
  },
  {
    id: 2,
    email: "manager@safewatch.com",
    name: "Manager User",
    role: "manager",
  },
];

// Mock staff members
export const mockStaff: StaffMember[] = [
  {
    id: 1,
    employeeId: "EMP001",
    firstName: "Michael",
    lastName: "Johnson",
    email: "mjohnson@safewatch.com",
    phone: "555-1001",
    site: "Main Office",
    position: "Security Guard",
    department: "Security",
    status: "active",
    hireDate: "2024-01-15",
  },
  {
    id: 2,
    employeeId: "EMP002",
    firstName: "Sarah",
    lastName: "Williams",
    email: "swilliams@safewatch.com",
    phone: "555-1002",
    site: "Main Office",
    position: "Senior Guard",
    department: "Security",
    status: "active",
    hireDate: "2023-11-20",
  },
  {
    id: 3,
    employeeId: "EMP003",
    firstName: "David",
    lastName: "Brown",
    email: "dbrown@safewatch.com",
    phone: "555-1003",
    site: "North Branch",
    position: "Security Guard",
    department: "Security",
    status: "active",
    hireDate: "2024-02-10",
  },
  {
    id: 4,
    employeeId: "EMP004",
    firstName: "Emily",
    lastName: "Davis",
    email: "edavis@safewatch.com",
    phone: "555-1004",
    site: "North Branch",
    position: "Supervisor",
    department: "Management",
    status: "active",
    hireDate: "2023-09-05",
  },
  {
    id: 5,
    employeeId: "EMP005",
    firstName: "James",
    lastName: "Miller",
    email: "jmiller@safewatch.com",
    phone: "555-1005",
    site: "South Branch",
    position: "Security Guard",
    department: "Security",
    status: "active",
    hireDate: "2024-03-01",
  },
  {
    id: 6,
    employeeId: "EMP006",
    firstName: "Jennifer",
    lastName: "Garcia",
    email: "jgarcia@safewatch.com",
    phone: "555-1006",
    site: "Main Office",
    position: "Security Guard",
    department: "Security",
    status: "active",
    hireDate: "2024-01-20",
  },
  {
    id: 7,
    employeeId: "EMP007",
    firstName: "Robert",
    lastName: "Martinez",
    email: "rmartinez@safewatch.com",
    phone: "555-1007",
    site: "South Branch",
    position: "Senior Guard",
    department: "Security",
    status: "active",
    hireDate: "2023-10-15",
  },
  {
    id: 8,
    employeeId: "EMP008",
    firstName: "Lisa",
    lastName: "Anderson",
    email: "landerson@safewatch.com",
    phone: "555-1008",
    site: "North Branch",
    position: "Security Guard",
    department: "Security",
    status: "active",
    hireDate: "2024-04-10",
  },
];

// Generate mock attendance records for the last 7 days
const generateAttendanceRecords = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split("T")[0];

    mockStaff.forEach((staff) => {
      // Randomize some absences and late arrivals
      const random = Math.random();
      let status: "present" | "late" | "absent" | "leave";
      let checkIn: string | null;
      let checkOut: string | null;
      let hours: number;
      let notes: string | undefined;

      if (random < 0.05) {
        // 5% absent
        status = "absent";
        checkIn = null;
        checkOut = null;
        hours = 0;
        notes = "Sick leave";
      } else if (random < 0.15) {
        // 10% late
        status = "late";
        checkIn = "09:30:00";
        checkOut = "17:00:00";
        hours = 7.5;
        notes = "Traffic delay";
      } else {
        // 85% present
        status = "present";
        checkIn = "09:00:00";
        checkOut = "17:00:00";
        hours = 8.0;
      }

      records.push({
        id: records.length + 1,
        staffId: staff.id,
        employeeId: staff.employeeId,
        name: `${staff.firstName} ${staff.lastName}`,
        date: dateStr,
        checkIn,
        checkOut,
        status,
        hours,
        site: staff.site,
        notes,
      });
    });
  }

  return records;
};

export const mockAttendance: AttendanceRecord[] = generateAttendanceRecords();

// Helper functions
export const getStaffById = (id: number): StaffMember | undefined => {
  return mockStaff.find((s) => s.id === id);
};

export const getStaffByEmployeeId = (
  employeeId: string
): StaffMember | undefined => {
  return mockStaff.find((s) => s.employeeId === employeeId);
};

export const getTodayAttendance = (): AttendanceRecord[] => {
  const today = new Date().toISOString().split("T")[0];
  return mockAttendance.filter((a) => a.date === today);
};

export const getAttendanceByDateRange = (
  startDate: string,
  endDate: string
): AttendanceRecord[] => {
  return mockAttendance.filter((a) => a.date >= startDate && a.date <= endDate);
};

export const getAttendanceStats = (records: AttendanceRecord[]) => {
  const total = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  const absent = records.filter((r) => r.status === "absent").length;

  return {
    total,
    present,
    late,
    absent,
    presentPercent: total > 0 ? Math.round((present / total) * 100) : 0,
    latePercent: total > 0 ? Math.round((late / total) * 100) : 0,
    absentPercent: total > 0 ? Math.round((absent / total) * 100) : 0,
    totalStaff: mockStaff.filter((s) => s.status === "active").length,
  };
};

export const sites = ["Main Office", "North Branch", "South Branch"];
