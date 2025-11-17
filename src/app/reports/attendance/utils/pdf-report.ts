import { jsPDF } from "jspdf";
import { AttendanceStatsReport } from "@/type";
import { format } from "date-fns";
import {
  decimalToHourMin,
  capitalizeFirstLetter,
  getMonthName,
} from "@/lib/utils";
export const reportAll = async (
  doc: jsPDF,
  startTextY: number,
  coef: number,
  init: number,
  filtredAttendances: AttendanceStatsReport[],
  totalDays: number,
  attendanceRate: number,
  travelAllowance: number,
  hours: number
) => {
  const autoTable = (await import("jspdf-autotable")).default;
  const now = new Date();
  const year = now.getFullYear();
  doc.setFontSize(10);
  doc.text(`Year: ${year}`, 14, startTextY + init);
  init += coef;
  doc.text(`Total Days: ${totalDays}`, 14, startTextY + init);
  init += coef;

  const tableData = filtredAttendances.map((report) => [
    report.employeeId ?? "",
    `${capitalizeFirstLetter(report.firstName)} ${capitalizeFirstLetter(
      report.lastName
    )}`,
    report.sites ?? "",
    totalDays ?? 0,
    report.sumPresent ?? 0,
    report.sumLate ?? 0,
    report.sumTraining ?? 0,
    report.sumOff ?? 0,
    report.sumAbsent ?? 0,
    report.sumLocalLeave ?? 0,
    report.sumSickLeave ?? 0,

    `${(report.attendanceRate ?? 0).toFixed(2)}%`,
    report.sumHours != null ? report.sumHours.toFixed(1) : "0.0",
    `Rs ${
      report.sumTravelAllowance != null
        ? report.sumTravelAllowance.toFixed(2)
        : "0.00"
    }`,
  ]);
  doc.setFontSize(7);
  autoTable(doc, {
    head: [
      [
        "Employee ID",
        "Name",
        "Site",
        "Days",
        "Present",
        "Late",
        "Training",
        "Off Duty",
        "Absent",
        "Sick Leave",
        "Local Leave",
        "Rate",
        "Hours",
        "Travel",
      ],
    ],
    body: tableData,
    startY: startTextY + init + 5,
    theme: "striped",
    headStyles: { fillColor: [0, 115, 154] },
    styles: { fontSize: 7 },
    foot: [
      [
        "Total",
        "",
        "",
        totalDays,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        `${(attendanceRate * 10).toFixed(2)}%`,
        hours.toFixed(2),
        `Rs${travelAllowance}`,
      ],
    ],
    footStyles: { fillColor: [0, 115, 154], fontSize: 8 },
  });
  doc.save(`attendance_reports_${new Date().toISOString().split("T")[0]}.pdf`);

  return true;
};

export const reportSingle = async (
  doc: jsPDF,
  startTextY: number,
  coef: number,
  init: number,
  filtredAttendances: AttendanceStatsReport[],
  searchName: string,
  from: Date | undefined,
  to: Date | undefined,
  month: string
) => {
  const autoTable = (await import("jspdf-autotable")).default;
  const now = new Date();
  const year = now.getFullYear();
  const currentMonth = now.getMonth();
  let employeeStats;

  let tableData;
  doc.setFontSize(9);

  if (searchName.length > 0) {
    employeeStats = getEmployeeStats(filtredAttendances);
    if (employeeStats) {
      doc.text(`SG Name: ${employeeStats.name}`, 14, startTextY + init);
      init += coef;
      doc.text(`Emp ID: ${employeeStats.employeeId}`, 14, startTextY + init);
      init += coef;
    }
  }

  if (from !== undefined && to !== undefined) {
    const dateRangeText =
      from && to
        ? `${format(from, "dd MMM yyyy")} - ${format(to, "dd MMM yyyy")}`
        : from
        ? `From ${format(from, "dd MMM yyyy")}`
        : `Until ${format(to!, "dd MMM yyyy")}`;

    doc.text(`Period: ${dateRangeText}`, 14, startTextY + init);
    init += coef;
    const weeks = getWeekFromTo(from!, to!);
    doc.text(
      `Week #: ${
        weeks.weekFrom === weeks.weekTo
          ? weeks.weekFrom
          : weeks.weekFrom + "-" + weeks.weekTo
      }`,
      14,
      startTextY + init
    );
    init += coef;
  } else {
    doc.text(
      `Month: ${
        month !== "all"
          ? getMonthName(Number(month))
          : from !== undefined
          ? `${format(from!, "MMM")}`
          : currentMonth
      }`,
      14,
      startTextY + init
    );
    init += coef;

    doc.text(`Year: ${year}`, 14, startTextY + init);
    init += coef;
  }

  const head = [];
  const foot = [];
  const nb_present = filtredAttendances.filter(
    (report) => report.statusId === 1
  ).length;
  // const nb_absent = filtredAttendances.filter(
  //   (report) => report.statusId === 3
  // ).length;
  const nb_training = filtredAttendances.filter(
    (report) => report.statusId === 10
  ).length;
  // const nb_local_leave = filtredAttendances.filter(
  //   (report) => report.statusId === 5
  // ).length;
  // const nb_sick_leave = filtredAttendances.filter(
  //   (report) => report.statusId === 6
  // ).length;
  const nb_late = filtredAttendances.filter(
    (report) => report.statusId === 2
  ).length;
  // const nb_off_duty = filtredAttendances.filter(
  //   (report) => report.statusId === 9
  // ).length;

  const nb_site = new Set(
    filtredAttendances
      .filter((report) => report.siteId !== 0)
      .map((report) => report.siteId)
  ).size;

  const nb_of_working_days = new Set(
    filtredAttendances.map((report) => report.date)
  ).size;

  const nb_employee = new Set(
    filtredAttendances.map((report) => report.employeeId)
  ).size;

  // const total_break = filtredAttendances.reduce(
  //   (acc, report) => acc + Number(report.breakTime),
  //   0
  // );

  const total_other_hours = filtredAttendances.reduce(
    (acc, report) => acc + Number(report.otherHours),
    0
  );

  const rate =
    ((nb_present + nb_training + nb_late) / filtredAttendances.length) * 100;

  if (employeeStats && Object.keys(employeeStats).length !== 0) {
    tableData = filtredAttendances.map((report) => [
      report.date ? format(new Date(report.date), "dd-MM-yyyy") : "",
      report.site ?? "",
      report.checkIn.substring(0, 5) ?? 0,
      report.checkOut.substring(0, 5) ?? 0,
      // report.breakTime ?? 0,
      report.otherHours ?? 0,
      decimalToHourMin(Number(report.hours)! ?? 0),
      `Rs${
        report.travelAllowance != null
          ? Number(report.travelAllowance).toFixed(2)
          : "0.00"
      }`,
      capitalizeFirstLetter(report.status!) ?? "",
    ]);

    head.push([
      "Date",
      "Site",
      "Start",
      "End",
      // "Break (min)",
      "Other Hours (min)",
      "Hours",
      "Travelling",
      "Status",
    ]);
    foot.push([
      nb_of_working_days + " working days",
      nb_site + " Site(s)",
      "",
      "",
      // `${employeeStats.break} min`,
      `${employeeStats.otherHours} min`,
      `${decimalToHourMin(employeeStats.hours)}`,
      `Rs${employeeStats.TravelAllowance}`,
      rate.toFixed(2) + "% Present",
    ]);
  } else {
    tableData = filtredAttendances.map((report) => {
      return [
        report.date ? format(new Date(report.date), "dd-MM-yyyy") : "",
        report.employeeId ?? "",
        `${capitalizeFirstLetter(report.firstName)} ${capitalizeFirstLetter(
          report.lastName
        )}`,
        report.site ?? "",
        report.checkIn.substring(0, 5) ?? 0,
        report.checkOut.substring(0, 5) ?? 0,
        // report.breakTime ?? 0,
        report.otherHours ?? 0,
        decimalToHourMin(Number(report.hours)! ?? 0),
        `Rs${
          report.travelAllowance != null
            ? Number(report.travelAllowance).toFixed(2)
            : "0.00"
        }`,
        capitalizeFirstLetter(report.status!) ?? "",
      ];
    });
    head.push([
      "Date",
      "Employee ID",
      "Name",
      "Site",
      "Start",
      "End",
      "Other Hours (min)",
      "Hours",
      "Travelling",
      "Status",
    ]);
    const total = filtredAttendances.reduce(
      (acc, item) => {
        acc.hours += Number(item.hours) ?? 0;
        acc.travelling += Number(item.travelAllowance);
        return acc;
      },
      {
        hours: 0,
        travelling: 0,
      }
    );
    foot.push([
      nb_of_working_days + " working days",
      nb_employee + " Employee(s)",
      "",
      nb_site + " Site(s)",
      "",
      "",
      // total_break + " min",
      total_other_hours + " min",
      `${decimalToHourMin(total.hours)}`,
      `Rs${total.travelling.toFixed(2)}`,
      rate.toFixed(2) + "% Present",
    ]);
  }

  autoTable(doc, {
    head: head,
    body: tableData,
    startY: startTextY + init + 3,
    theme: "striped",
    headStyles: { fillColor: [0, 115, 154] },
    styles: { fontSize: 8 },
    foot: foot,
    footStyles: { fillColor: [0, 115, 154], fontSize: 8 },
  });
  const finalY = doc.lastAutoTable?.finalY || startTextY + init + 10;

  doc.setFontSize(8);
  doc.text("SG Sign: ___________________", 14, finalY + 10);
  doc.text(`Sup Name: _______________________`, 130, finalY + 10, {
    align: "right",
  });
  doc.text(`Sup Sign: ___________________ `, 195, finalY + 10, {
    align: "right",
  });

  doc.text("Date: ___________________", 14, finalY + 15);
  doc.text(`Date: _______________________`, 130, finalY + 15, {
    align: "right",
  });

  const marginLeft = 15;
  const marginRight = 15;
  const pageWidth = doc.internal.pageSize.getWidth() - marginLeft - marginRight;
  const rectHeight = 25;

  const textX = marginLeft;
  const textY = finalY + 25;

  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("Remarks:", textX, textY);

  doc.rect(marginLeft, textY + 2, pageWidth, rectHeight);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Office Use:", 14, finalY + 60);
  doc.setFontSize(8);
  // doc.text("Date Started: ___________________", 14, finalY + 67);
  doc.text(`Approved By: _______________________`, 14, finalY + 67);
  // doc.text("Date Started: ___________________", 14, finalY + 73);

  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.text(
    "*Confidential – not for public release or distribution",
    75,
    pageHeight - 10
  );
  // doc.save(`attendance_reports_${new Date().toISOString().split("T")[0]}.pdf`);

  return true;
};

function getEmployeeStats(arr: AttendanceStatsReport[]) {
  const employeeStats = {
    employeeId: "",
    name: "",
    break: 0,
    otherHours: 0,
    hours: 0,
    TravelAllowance: 0,
  };
  if (arr.length === 0) return null;
  const firstId = arr[0].employeeId;
  const firstName =
    capitalizeFirstLetter(arr[0].firstName) +
    " " +
    capitalizeFirstLetter(arr[0].lastName);
  const allEqual = arr.every((item) => item.employeeId === firstId);

  if (!allEqual) return null;
  else {
    employeeStats.employeeId = firstId;
    employeeStats.name = firstName;
    return arr.reduce((acc, item) => {
      acc.break += Number(item.breakTime) ?? 0;
      acc.otherHours += Number(item.otherHours) ?? 0;
      acc.hours += Number(item.hours) ?? 0;
      acc.TravelAllowance += Number(item.travelAllowance);
      return acc;
    }, employeeStats);
  }
}

function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getWeekFromTo(dateFrom: Date, dateTo: Date) {
  return {
    weekFrom: getWeekNumber(dateFrom),
    weekTo: getWeekNumber(dateTo),
  };
}
