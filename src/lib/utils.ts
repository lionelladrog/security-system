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
  nbOfday: number,
  forAll: boolean = false
) => {
  const stats = {
    present: 0,
    absent: 0,
    localLeave: 0,
    sickLeave: 0,
    offDuty: 0,
    extraDuty: 0,
    travelling: 0,
    training: 0,
    late: 0,
    sites: 0,
    hours: 0,
    attendanceRate: 0,
    travelAllowance: 0,
    notMarked: 0,
    nbWeeks: 0,
    nbSunday: 0,
    nbWeekTotalHours: 0,
    nbSundayTotalHours: 0,
    totalRecord: 0,
  };
  const staffs: number[] = [];
  const sites: number[] = [];
  const sitesName: string[] = [];
  const dates: Date[] = [];

  const nb_of_day = attendances
    .reduce((acc: string[], item) => {
      if ("date" in item && item.date) {
        const dateStr =
          item.date instanceof Date ? item.date.toISOString() : item.date;
        if (!acc.includes(dateStr)) {
          acc.push(dateStr);
        }
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).length;

  for (let i = 0; i < attendances.length; i++) {
    if (forAll) {
      if (!staffs.includes(attendances[i].staffId)) {
        staffs.push(attendances[i].staffId);
        if ("sumPresent" in attendances[i]) {
          stats.present += Number(attendances[i].sumPresent);
        }

        if ("sumAbsent" in attendances[i]) {
          stats.absent += Number(attendances[i].sumAbsent);
        }

        if ("sumLate" in attendances[i]) {
          stats.late += Number(attendances[i].sumLate);
        }

        if ("sumTraining" in attendances[i]) {
          stats.training += Number(attendances[i].sumTraining);
        }

        if ("sumOff" in attendances[i]) {
          stats.offDuty += Number(attendances[i].sumOff);
        }

        if ("sumLocalLeave" in attendances[i]) {
          stats.localLeave += Number(attendances[i].sumLocalLeave);
        }

        if ("sumSickLeave" in attendances[i]) {
          stats.sickLeave += Number(attendances[i].sumSickLeave);
        }

        if ("sumTravelAllowance" in attendances[i]) {
          stats.travelAllowance += Number(attendances[i].sumTravelAllowance);
        }
      }
    } else {
      if ("status" in attendances[i]) {
        const date = new Date(attendances[i].date);
        const isSunday = date.getDay() === 0;

        const updateStatsForDate = () => {
          if (!dates.includes(attendances[i].date)) {
            dates.push(attendances[i].date);
            if (isSunday) {
              stats.nbSunday++;
            } else {
              stats.nbWeeks++;
            }
          }
          if (isSunday) {
            stats.nbSundayTotalHours += Number(attendances[i].hours!);
          } else {
            stats.nbWeekTotalHours += Number(attendances[i].hours!);
          }
        };

        switch (attendances[i].statusId) {
          case 1:
            updateStatsForDate();
            stats.present++;
            break;
          case 3:
            stats.absent++;
            break;
          case 2:
            updateStatsForDate();
            stats.late++;
            break;
          case 10:
            updateStatsForDate();
            stats.training++;
            break;
          case 9:
            stats.offDuty++;
            break;
          case 11:
            stats.extraDuty++;
            break;
          case 5:
            stats.localLeave++;
            break;
          case 6:
            stats.sickLeave++;
            break;
          default:
            break;
        }
      }

      if ("travelAllowance" in attendances[i]) {
        stats.travelAllowance += Number(attendances[i].travelAllowance);
      }
    }

    if (attendances[i].sites && sites.length !== 0) {
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

  if (forAll) {
    stats.attendanceRate = stats.present + stats.absent + stats.late;
  } else {
  }

  if (nb_of_day > 0) {
    stats.attendanceRate = !forAll
      ? ((Number(stats.present) + Number(stats.training) + Number(stats.late)) /
          nb_of_day) *
        100
      : ((Number(stats.present) + Number(stats.training) + Number(stats.late)) /
          nbOfday) *
        100;
  }

  stats.notMarked =
    staffs.length -
    stats.present -
    stats.absent -
    stats.late -
    stats.training -
    stats.offDuty -
    stats.localLeave -
    stats.sickLeave;
  stats.totalRecord = nb_of_day;

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

export function decimalToHourMin(decimalHours: number) {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours}h${minutes.toString().padStart(2, "0")}min`;
}

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

export function capitalizeFirstLetter(string: string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function decimalToDayHourMin(decimalHours: number) {
  // const totalMinutes = Math.round(decimalHours * 60);
  const days = Math.floor(decimalHours / 8);
  const remainingHours = Math.floor(decimalHours % 8);
  const minutes = Math.round((decimalHours % 1) * 60) % 60;

  return `${days} days ${remainingHours}h ${minutes}min`;
}
