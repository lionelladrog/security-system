import { AttendanceStatsReport } from "../type";
export const calculateHours = (
  checkIn: string,
  checkOut: string,
  breakTime: number
) => {
  if (!checkIn || !checkOut) return 0;

  const [inHour, inMin] = checkIn.split(":").map(Number);
  const [outHour, outMin] = checkOut.split(":").map(Number);

  const inMinutes = inHour * 60 + inMin;
  const outMinutes = outHour * 60 + outMin;

  const totalMinutes = outMinutes - inMinutes;
  const workMinutes = totalMinutes - (breakTime || 0);

  return Math.max(0, Number((workMinutes / 60).toFixed(2)));
};

export const getAttendanceStats = (
  attendances: AttendanceStatsReport[],
  totalDays: number = 0
) => {
  const stats = {
    present: 0,
    absent: 0,
    late: 0,
    sites: 0,
    hours: 0,
    attendanceRate: 0,
    travelAllowance: 0,
    notMarked: 0,
    totalRecord: 0,
  };
  const staffs: number[] = [];
  const sites: number[] = [];
  const sitesName: string[] = [];

  for (let i = 0; i < attendances.length; i++) {
    if ("status" in attendances[i]) {
      if (!staffs.includes(attendances[i].staffId)) {
        staffs.push(attendances[i].staffId);
        if (
          "sumPresent" in attendances[i] &&
          "sumAbsent" in attendances[i] &&
          "sumLate" in attendances[i]
        ) {
          stats.present += Number(attendances[i].sumPresent);
          stats.absent += Number(attendances[i].sumAbsent);
          stats.late += Number(attendances[i].sumLate);
          if (totalDays > 0) {
            stats.attendanceRate +=
              Number(attendances[i].sumPresent) +
              Number(attendances[i].sumAbsent) / totalDays;
          }
        } else {
          switch (attendances[i].status) {
            case "present":
              stats.present++;
              break;
            case "absent":
              stats.absent++;
              break;
            case "late":
              stats.late++;
              break;
            default:
              break;
          }
        }

        if ("travelAllowance" in attendances[i]) {
          stats.travelAllowance += Number(attendances[i].sumTravelAllowance);
        }
      }

      if (attendances[i].sites) {
        const name = attendances[i].sites?.split(",");
        if (name && name?.length > 0) {
          for (let j = 0; j < name.length; j++) {
            if (!sitesName.includes(name[j].trim().toLowerCase())) {
              sitesName.push(name[j].trim().toLowerCase());
              stats.sites++;
            }
          }
        }
      } else if (
        "siteId" in attendances[i] &&
        !sites.includes(attendances[i].siteId!)
      ) {
        sites.push(attendances[i].siteId!);
        stats.sites++;
      }
      if ("sumHours" in attendances[i]) {
        stats.hours += Number(attendances[i].sumHours);
      } else if ("hours" in attendances[i]) {
        stats.hours += Number(attendances[i].hours);
      }
    }
  }

  stats.attendanceRate = stats.attendanceRate;
  stats.notMarked = staffs.length - stats.present - stats.absent - stats.late;
  stats.totalRecord = attendances.length;

  return stats;
};

export const convertDate = (dateISOString: Date) => {
  const date = new Date(dateISOString);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const sqlDate = `${yyyy}-${mm}-${dd}`;
  return sqlDate;
};

export const loadImageAsBase64 = async (url: string): Promise<string> => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export function getMonthName(monthNumber: number) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  if (monthNumber < 1 || monthNumber > 12) {
    throw new Error("Month number must be between 1 and 12");
  }
  return months[monthNumber - 1];
}

export function daysElapsed(date: Date): number {
  const now = new Date();

  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return diffDays;
}
