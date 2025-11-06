"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Search, FileDown, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import { trpc } from "@/lib/trpc";
import { months } from "@/constant";
import { StatsType, AttendanceStatsReport } from "@/type";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import siteStore from "@/store/siteStore";
import {
  StatsSkeleton,
  AttendanceReportTableSkeleton,
} from "@/components/Skeleton";

import {
  getAttendanceStats,
  loadImageAsBase64,
  getMonthName,
} from "@/lib/utils";

function AttendanceReports() {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const sites = siteStore((state) => state.site);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedSite, setSelectedSite] = useState("all");
  const [searchName, setSearchName] = useState("");
  const [queryParams, setQueryParams] = useState<
    Record<string, string | number>
  >({});
  const [filtredAttendances, setAttendanceStats] = useState<
    AttendanceStatsReport[]
  >([]);

  const [Stats, setStats] = useState<StatsType>({
    present: 0,
    absent: 0,
    late: 0,
    sites: 0,
    attendanceRate: 0,
    travelAllowance: 0,
    hours: 0,
    notMarked: 0,
    totalRecord: 0,
  });

  const [totalRecord, setTotalRecord] = useState<number>(0);
  const [totalDays, setTotalDays] = useState<number>(0);

  const Attendances = trpc.attendance.getAttendanceReport.useQuery(
    { ...queryParams },
    {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    }
  );

  useEffect(() => {
    const newParams: Record<string, string | number> = {};

    if (searchName !== "") {
      newParams.employee = searchName;
    }
    if (selectedSite !== "all") {
      newParams.siteId = Number(selectedSite);
    }
    if (selectedMonth !== "all") {
      newParams.month = selectedMonth;
    } else if (dateRange.from && dateRange.to) {
      newParams.date_from = format(dateRange.from, "yyyy-MM-dd");
      newParams.date_to = format(dateRange.to, "yyyy-MM-dd");
    }

    setQueryParams(newParams);
  }, [searchName, selectedMonth, dateRange, selectedSite]);

  useEffect(() => {
    if (queryParams) {
      Attendances.refetch();
    }
  }, [queryParams, Attendances]);

  useEffect(() => {
    if (Attendances.data?.totalDays) {
      setTotalDays(Attendances.data.totalDays);
    }

    if (Attendances.data?.results) {
      const parsed: AttendanceStatsReport[] = Attendances.data.results.map(
        (item) => {
          const rate =
            (Number(item.sumPresent) / Number(Attendances.data?.totalDays)) *
            100;

          return {
            ...item,

            sites: String(item.sites),
            sumPresent: Number(item.sumPresent ?? 0),
            sumAbsent: Number(item.sumAbsent ?? 0),
            sumLate: Number(item.sumLate ?? 0),
            sumHours: Number(item.sumHours ?? 0),
            avgHours: Number(item.avgHours ?? 0),
            status: "",
            siteId: 0,
            hours: 0,
            sumTravelAllowance: Number(item.sumTravelAllowance ?? 0),

            attendanceRate: rate,
          };
        }
      );

      const nbOfday = Attendances.data?.totalDays || 0;

      const stats = getAttendanceStats(parsed, nbOfday);

      setStats(stats);

      setAttendanceStats(parsed);
    }

    setTotalRecord(Attendances.data?.totalRecords ?? 0);
  }, [Attendances.data]);

  const exportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Staff Reports");

      const response = await fetch("/logo.png");
      const imageBuffer = await response.arrayBuffer();
      const imageId = workbook.addImage({
        buffer: imageBuffer,
        extension: "png",
      });

      sheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 150, height: 50 },
      });

      sheet.mergeCells("C1", "H2");
      const titleCell = sheet.getCell("C1");
      titleCell.value = "Staff Attendance Reports";
      titleCell.font = { size: 18, bold: true, color: { argb: "00739A" } };
      titleCell.alignment = { vertical: "middle", horizontal: "center" };

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

      filtredAttendances.forEach((report) => {
        sheet.addRow([
          report.employeeId ?? "",
          `${report.firstName ?? ""} ${report.lastName ?? ""}`.trim(),
          report.sites ?? "",
          totalDays ?? 0,
          report.sumPresent ?? 0,
          report.sumAbsent ?? 0,
          report.sumLate ?? 0,
          `${report.attendanceRate?.toFixed(2)}%`,
          report.sumHours?.toFixed(1) ?? "0.0",
          `$${report.sumTravelAllowance?.toFixed(2)}`,
        ]);
      });

      const footerRow = sheet.addRow([
        "Total",
        "",
        "",
        totalDays ?? 0,
        "",
        "",
        "",
        `${(Stats.attendanceRate * 100).toFixed(2)}%`,
        Stats.hours?.toFixed(2) ?? "0.00",
        `Rs${Stats.travelAllowance?.toFixed(2) ?? "0.00"}`,
      ]);

      footerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "00739A" },
        };
        cell.font = { color: { argb: "FFFFFF" }, bold: true };
      });

      sheet.columns.forEach((col) => {
        let maxLength = 0;
        if (col) {
          (col as ExcelJS.Column).eachCell({ includeEmpty: true }, (cell) => {
            const len = cell.value ? cell.value.toString().length : 10;
            if (len > maxLength) maxLength = len;
          });
        }

        col.width = maxLength + 2;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer], {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `attendance_reports_${new Date().toISOString().split("T")[0]}.xlsx`
      );

      import("sonner").then(({ toast }) => {
        toast.success("Exported to Excel successfully!");
      });
    } catch (error) {
      import("sonner").then(({ toast }) => {
        toast.error("Failed to export to Excel");
      });
      console.error("Export error:", error);
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
    try {
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();
      const base64Image = await loadImageAsBase64("/logo.png");
      doc.addImage(base64Image, "PNG", 10, 10, 50, 15);
      const startTextY = 10 + 20 + 5;
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 200, 15, {
        align: "right",
      });

      doc.setFontSize(18);
      doc.text("Staff Attendance Reports", 65, startTextY);

      doc.setFontSize(10);

      let init = 15;
      const coef = 6;

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

        doc.text(`Period: ${dateRangeText}`, 14, startTextY + init);
        init += coef;
      }
      if (searchName) {
        doc.text(`Employee: ${searchName}`, 14, startTextY + init);
        init += coef;
      }
      if (selectedMonth !== "all") {
        const month = getMonthName(Number(selectedMonth));
        doc.text(`Month: ${month}`, 14, startTextY + init);
        init += coef;
      }
      if (selectedSite !== "all") {
        doc.text(`Site: ${selectedSite}`, 14, startTextY + init);
        init += coef;
      }

      doc.text(`Total Days: ${totalDays}`, 14, startTextY + init);
      init += coef;

      const tableData = filtredAttendances.map((report) => [
        report.employeeId ?? "",
        `${report.firstName} ${report.lastName}`,
        report.sites ?? "",
        totalDays ?? 0,
        report.sumPresent ?? 0,
        report.sumAbsent ?? 0,
        report.sumLate ?? 0,
        `${(report.attendanceRate ?? 0).toFixed(2)}%`,
        report.sumHours != null ? report.sumHours.toFixed(1) : "0.0",
        `$${
          report.sumTravelAllowance != null
            ? report.sumTravelAllowance.toFixed(2)
            : "0.00"
        }`,
      ]);

      autoTable(doc, {
        head: [
          [
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
          ],
        ],
        body: tableData,
        startY: startTextY + init + 5,
        theme: "striped",
        headStyles: { fillColor: [0, 115, 154] },
        styles: { fontSize: 8 },
        foot: [
          [
            "Total",
            "",
            "",
            totalDays,
            "",
            "",
            "",
            `${(Stats.attendanceRate * 10).toFixed(2)}%`,
            Stats.hours.toFixed(2),
            `Rs${Stats.travelAllowance}`,
          ],
        ],
        footStyles: { fillColor: [0, 115, 154], fontSize: 10 },
      });

      doc.save(
        `attendance_reports_${new Date().toISOString().split("T")[0]}.pdf`
      );

      import("sonner").then(({ toast }) => {
        toast.success("Exported to PDF successfully!");
      });
    } catch (error) {
      import("sonner").then(({ toast }) => {
        toast.error("Failed to export to PDF");
      });
      console.error("Export error:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2>Attendance Reports</h2>
          <p className="text-muted-foreground">
            View detailed attendance analytics and reports
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={exportToExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <FileDown className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM dd")} -{" "}
                          {format(dateRange.to, "MMM dd")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM dd, yyyy")
                      )
                    ) : (
                      <span>Select date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      setDateRange({ from: range?.from, to: range?.to });
                      setSelectedMonth("all");
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select
                value={selectedMonth}
                onValueChange={(value) => {
                  setSelectedMonth(value);
                  setDateRange({ from: undefined, to: undefined });
                }}
              >
                <SelectTrigger id="month">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="site">Site</Label>
              <Select
                value={selectedSite}
                onValueChange={(value) => {
                  setSelectedSite(value);
                }}
              >
                <SelectTrigger id="site">
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  {sites?.map((site) => (
                    <SelectItem key={site.id} value={`${site.id}`}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Search Staff</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Name or ID..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Statistics */}
      <div>
        {Attendances.isLoading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Period</CardDescription>
                <CardTitle className="text-2xl">
                  {dateRange.from && dateRange.to
                    ? `${
                        Math.ceil(
                          (dateRange.to.getTime() - dateRange.from.getTime()) /
                            (1000 * 60 * 60 * 24)
                        ) + 1
                      } days`
                    : dateRange.from || dateRange.to
                    ? "Custom"
                    : totalRecord > 0
                    ? `${totalRecord} records`
                    : "No data"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {dateRange.from && dateRange.to
                    ? `${format(dateRange.from, "MMM dd")} - ${format(
                        dateRange.to,
                        "MMM dd"
                      )}`
                    : "All time"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Attendance Rate</CardDescription>
                <CardTitle className="text-3xl">
                  {(Stats.attendanceRate * 10).toFixed(1)}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Present:</span>
                    <span className="text-green-600">{Stats.present}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Absent:</span>
                    <span className="text-red-600">{Stats.absent}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Late:</span>
                    <span className="text-orange-600">{Stats.late}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Hours</CardDescription>
                <CardTitle className="text-3xl">
                  {Stats.hours.toFixed(2)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Avg: {(Stats.hours / totalDays).toFixed(2)} hrs/day
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Travel Allowance</CardDescription>
                <CardTitle className="text-3xl">
                  Rs {Stats.travelAllowance.toFixed(0)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Total used</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Number of Sites</CardDescription>
                <CardTitle className="text-3xl">{Stats.sites}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Active locations
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Staff Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Staff Reports</CardTitle>
          <CardDescription>
            Showing {filtredAttendances.length} of{" "}
            {filtredAttendances.length ?? 0} staff members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {Attendances.isLoading ? (
              <AttendanceReportTableSkeleton />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Total Days</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Avg Hours</TableHead>
                    <TableHead>Travel (Rs)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtredAttendances.length > 0 ? (
                    filtredAttendances.map((report) => (
                      <TableRow key={report.employeeId}>
                        <TableCell className="font-medium">
                          {report.employeeId}
                        </TableCell>
                        <TableCell>
                          {report.firstName} {report.lastName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{report.sites}</Badge>
                        </TableCell>
                        <TableCell>{totalDays}</TableCell>
                        <TableCell className="text-green-600">
                          {report.sumPresent}
                        </TableCell>
                        <TableCell className="text-red-600">
                          {report.sumAbsent}
                        </TableCell>
                        <TableCell className="text-orange-600">
                          {report.sumLate}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              Number(report.attendanceRate) >= 90
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : report.attendanceRate &&
                                  report.attendanceRate >= 75
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                : "bg-red-100 text-red-800 hover:bg-red-100"
                            }
                          >
                            {report.attendanceRate?.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>{report.sumHours?.toFixed(2)}</TableCell>
                        <TableCell>{report.avgHours?.toFixed(2)}</TableCell>
                        <TableCell>
                          {report.sumTravelAllowance?.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={11}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No data available for the selected filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default AttendanceReports;
