import ExcelJS from "exceljs";
import { format } from "date-fns";
import { capitalizeFirstLetter, getMonthName } from "@/lib/utils";
import { AttendanceStatsReport } from "@/type";

export const loadImageAsArrayBuffer = async (
  url: string
): Promise<ArrayBuffer> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load image: ${url}`);
  return response.arrayBuffer();
};

export const autoFitColumns = (sheet: ExcelJS.Worksheet) => {
  sheet.columns.forEach((col) => {
    if (!col) return;
    let maxLength = 10;
    (col as ExcelJS.Column).eachCell({ includeEmpty: true }, (cell) => {
      const len = cell.value ? cell.value.toString().length : 10;
      if (len > maxLength) maxLength = len;
    });
    col.width = Math.min(maxLength + 2, 30);
  });
};

export const reportAllExcel = async (
  workbook: ExcelJS.Workbook,
  sheet: ExcelJS.Worksheet,
  filtredAttendances: AttendanceStatsReport[],
  totalDays: number,
  attendanceRate: number,
  travelAllowance: number,
  hours: number,
  dateRange: { from?: Date; to?: Date },
  searchName: string,
  selectedMonth: string,
  selectedSite: string
) => {
  // ——— Logo ———
  const imageBuffer = await loadImageAsArrayBuffer("/logo.png");
  const imageId = workbook.addImage({
    buffer: imageBuffer,
    extension: "png",
  });

  sheet.addImage(imageId, {
    tl: { col: 0, row: 0 },
    ext: { width: 150, height: 50 },
  });

  // ——— Titre ———
  sheet.mergeCells("C1", "H2");
  const titleCell = sheet.getCell("C1");
  titleCell.value = "Staff Attendance Reports";
  titleCell.font = { size: 18, bold: true, color: { argb: "00739A" } };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  // ——— Métadonnées ———
  let currentRow = 4;

  const metaRows: [string, string][] = [];

  if (dateRange.from || dateRange.to) {
    const dateRangeText =
      dateRange.from && dateRange.to
        ? `${format(dateRange.from, "MMM dd, yyyy")} - ${format(
            dateRange.to,
            "MMM dd, yyyy"
          )}`
        : dateRange.from
        ? `From ${format(dateRange.from, "MMM dd, yyyy")}`
        : `Until ${format(dateRange.to!, "MMM dd, yyyy")}`;
    metaRows.push(["Period:", dateRangeText]);
  }

  if (searchName) metaRows.push(["Employee:", searchName]);
  if (selectedMonth !== "all")
    metaRows.push(["Month:", getMonthName(Number(selectedMonth))]);
  if (selectedSite !== "all") metaRows.push(["Site:", selectedSite]);
  metaRows.push(["Total Days:", totalDays.toString()]);

  for (const [label, value] of metaRows) {
    const labelCell = sheet.getCell(`B${currentRow}`);
    const valueCell = sheet.getCell(`C${currentRow}`);
    labelCell.value = label;
    labelCell.font = { bold: true };
    valueCell.value = value;
    currentRow++;
  }

  currentRow += 1;

  // ——— En-têtes ———
  const headers = [
    "Employee ID",
    "Name",
    "Site",
    "Days",
    "Present",
    "Absent",
    "Late",
    "Rate",
    "Hours",
    "Travel",
  ];

  const headerRow = sheet.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "00739A" },
    };
    cell.font = { color: { argb: "FFFFFF" }, bold: true };
    cell.alignment = { horizontal: "center" };
  });

  // ——— Données ———
  filtredAttendances.forEach((report) => {
    sheet.addRow([
      report.employeeId ?? "",
      `${capitalizeFirstLetter(report.firstName ?? "")} ${capitalizeFirstLetter(
        report.lastName ?? ""
      )}`.trim(),
      report.sites ?? "",
      totalDays ?? 0,
      report.sumPresent ?? 0,
      report.sumAbsent ?? 0,
      report.sumLate ?? 0,
      `${(report.attendanceRate ?? 0).toFixed(2)}%`,
      report.sumHours != null ? report.sumHours.toFixed(1) : "0.0",
      `Rs${
        report.sumTravelAllowance != null
          ? report.sumTravelAllowance.toFixed(2)
          : "0.00"
      }`,
    ]);
  });

  // ——— Pied de tableau ———
  const footerRow = sheet.addRow([
    "Total",
    "",
    "",
    totalDays ?? 0,
    "",
    "",
    "",
    `${(attendanceRate * 100).toFixed(2)}%`,
    hours.toFixed(2),
    `Rs${travelAllowance.toFixed(2)}`,
  ]);

  footerRow.eachCell((cell, colNumber) => {
    if (colNumber <= 4 || colNumber >= 8) {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "00739A" },
      };
      cell.font = { color: { argb: "FFFFFF" }, bold: true };
    }
  });

  autoFitColumns(sheet);
};

// 📋 Mode "Filtre actif" (employé unique ou période filtrée)
export const reportSingleExcel = async (
  workbook: ExcelJS.Workbook,
  sheet: ExcelJS.Worksheet,
  filtredAttendances: AttendanceStatsReport[],
  searchName: string,
  dateRange: { from?: Date; to?: Date },
  selectedMonth: string,
  selectedSite: string
) => {
  // ——— Logo ———
  const imageBuffer = await loadImageAsArrayBuffer("/logo.png");
  const imageId = workbook.addImage({
    buffer: imageBuffer,
    extension: "png",
  });

  sheet.addImage(imageId, {
    tl: { col: 0, row: 0 },
    ext: { width: 150, height: 50 },
  });

  // ——— Titre ———
  sheet.mergeCells("C1", "H2");
  const titleCell = sheet.getCell("C1");
  titleCell.value = "Staff Attendance Reports";
  titleCell.font = { size: 18, bold: true, color: { argb: "00739A" } };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  // ——— Métadonnées ———
  let currentRow = 4;

  const metaRows: [string, string][] = [];

  // Nom de l'employé si filtré
  if (searchName) metaRows.push(["Employee:", searchName]);

  // Période ou mois
  if (dateRange.from || dateRange.to) {
    const dateRangeText =
      dateRange.from && dateRange.to
        ? `${format(dateRange.from, "dd MMM yyyy")} - ${format(
            dateRange.to,
            "dd MMM yyyy"
          )}`
        : dateRange.from
        ? `From ${format(dateRange.from, "dd MMM yyyy")}`
        : `Until ${format(dateRange.to!, "dd MMM yyyy")}`;
    metaRows.push(["Period:", dateRangeText]);

    // Calcul des semaines (optionnel, comme dans le PDF)
    const getWeekNumber = (date: Date): number => {
      const d = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
      );
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil(
        ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
      );
    };
    const weekFrom = getWeekNumber(dateRange.from!);
    const weekTo = getWeekNumber(dateRange.to!);
    metaRows.push([
      "Week #:",
      weekFrom === weekTo ? `${weekFrom}` : `${weekFrom}-${weekTo}`,
    ]);
  } else if (selectedMonth !== "all") {
    metaRows.push(["Month:", getMonthName(Number(selectedMonth))]);
  }

  if (selectedSite !== "all") metaRows.push(["Site:", selectedSite]);

  // Stats globales du jeu de données
  const nbWorkingDays = new Set(filtredAttendances.map((r) => r.date)).size;
  const nbSites = new Set(filtredAttendances.map((r) => r.site)).size;
  const nbEmployees = new Set(filtredAttendances.map((r) => r.employeeId)).size;
  const totalBreak = filtredAttendances.reduce(
    (acc, r) => acc + Number(r.breakTime || 0),
    0
  );
  const totalHours = filtredAttendances.reduce(
    (acc, r) => acc + Number(r.hours || 0),
    0
  );
  const totalTravel = filtredAttendances.reduce(
    (acc, r) => acc + Number(r.travelAllowance || 0),
    0
  );
  const presentCount = filtredAttendances.filter(
    (r) => r.status === "present"
  ).length;
  const absentCount = filtredAttendances.filter(
    (r) => r.status === "absent"
  ).length; // ✅ corrigé "absnet" → "absent"
  const rate =
    nbWorkingDays > 0
      ? ((presentCount - absentCount) / nbWorkingDays) * 100
      : 0;

  metaRows.push(["Working Days:", nbWorkingDays.toString()]);
  metaRows.push(["Sites:", nbSites.toString()]);
  metaRows.push(["Employees:", nbEmployees.toString()]);
  metaRows.push(["Total Break (min):", totalBreak.toString()]);
  metaRows.push(["Total Hours:", totalHours.toFixed(1)]);
  metaRows.push(["Total Travel:", `Rs${totalTravel.toFixed(2)}`]);
  metaRows.push(["Attendance Rate:", `${rate.toFixed(2)}%`]);

  for (const [label, value] of metaRows) {
    const labelCell = sheet.getCell(`B${currentRow}`);
    const valueCell = sheet.getCell(`C${currentRow}`);
    labelCell.value = label;
    labelCell.font = { bold: true };
    valueCell.value = value;
    currentRow++;
  }

  currentRow += 1;

  // ——— Déterminer le type de tableau ———
  const allSameEmployee =
    filtredAttendances.length > 0 &&
    filtredAttendances.every(
      (r) => r.employeeId === filtredAttendances[0].employeeId
    );

  let headers: string[];
  let rows: (string | number)[][];

  if (allSameEmployee && searchName) {
    //  Tableau *par date* pour un employé unique
    headers = [
      "Date",
      "Site",
      "Start",
      "End",
      "Break (min)",
      "Hours",
      "Travelling",
      "Status",
    ];
    rows = filtredAttendances.map((report) => [
      report.date ? format(new Date(report.date), "dd-MM-yyyy") : "",
      report.site ?? "",
      report.checkIn?.substring(0, 5) ?? "",
      report.checkOut?.substring(0, 5) ?? "",
      report.breakTime ?? 0,
      report.hours != null ? Number(report.hours).toFixed(1) : "0.0",
      `Rs${
        report.travelAllowance != null
          ? Number(report.travelAllowance).toFixed(2)
          : "0.00"
      }`,
      capitalizeFirstLetter(report.status ?? ""),
    ]);
  } else {
    //  Tableau *par employé* (plusieurs employés ou pas de filtre nom)
    headers = [
      "Date",
      "Employee ID",
      "Name",
      "Site",
      "Start",
      "End",
      "Break (min)",
      "Hours",
      "Travelling",
      "Status",
    ];
    rows = filtredAttendances.map((report) => [
      report.date ? format(new Date(report.date), "dd-MM-yyyy") : "",
      report.employeeId ?? "",
      `${capitalizeFirstLetter(report.firstName ?? "")} ${capitalizeFirstLetter(
        report.lastName ?? ""
      )}`.trim(),
      report.site ?? "",
      report.checkIn?.substring(0, 5) ?? "",
      report.checkOut?.substring(0, 5) ?? "",
      report.breakTime ?? 0,
      report.hours != null ? Number(report.hours).toFixed(1) : "0.0",
      `Rs${
        report.travelAllowance != null
          ? Number(report.travelAllowance).toFixed(2)
          : "0.00"
      }`,
      capitalizeFirstLetter(report.status ?? ""),
    ]);
  }

  // ——— En-têtes ———
  const headerRow = sheet.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "00739A" },
    };
    cell.font = { color: { argb: "FFFFFF" }, bold: true };
    cell.alignment = { horizontal: "center" };
  });

  // ——— Données ———
  rows.forEach((row) => sheet.addRow(row));

  // ——— Pied (optionnel, comme dans le PDF) ———
  const footer = allSameEmployee
    ? [
        `${nbWorkingDays} working days`,
        `${nbSites} Site(s)`,
        "",
        "",
        `${totalBreak} min`,
        totalHours.toFixed(1),
        `Rs${totalTravel.toFixed(2)}`,
        `${rate.toFixed(2)}% Present`,
      ]
    : [
        `${nbWorkingDays} working days`,
        `${nbEmployees} Employee(s)`,
        "",
        `${nbSites} Site(s)`,
        "",
        "",
        `${totalBreak} min`,
        totalHours.toFixed(1),
        `Rs${totalTravel.toFixed(2)}`,
        `${rate.toFixed(2)}% Present`,
      ];

  const footerRow = sheet.addRow(footer);
  footerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "00739A" },
    };
    cell.font = { color: { argb: "FFFFFF" }, bold: true };
  });

  autoFitColumns(sheet);
};
