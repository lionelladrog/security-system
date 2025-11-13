"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
import * as Switch from "@radix-ui/react-switch";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Search, FileDown, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import { trpc } from "@/lib/trpc";
import { months } from "@/constant";
import { StatsType, AttendanceStatsReport } from "@/type";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import siteStore from "@/store/siteStore";
import { StatsSkeleton } from "@/components/Skeleton";
import { reportAll, reportSingle } from "./utils/pdf-report";
import {
  getAttendanceStats,
  loadImageAsBase64,
  getMonthName,
} from "@/lib/utils";
import userStore from "@/store/userStore";
import { SingleStaffReport, MultipleStaffReport } from "./templates";

function AttendanceReports() {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const user = userStore((state) => state.user);
  const sites = siteStore((state) => state.site);
  const [batchPrint, setBatchPrint] = useState(false);
  const [batchIsvisible, setBatchIsvisible] = useState(false);
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
    const isFiltered =
      searchName !== "" ||
      selectedSite !== "all" ||
      selectedMonth !== "all" ||
      dateRange.from != undefined ||
      dateRange.to != undefined;

    if (isFiltered) {
      setBatchIsvisible(true);
    } else {
      setBatchIsvisible(false);
    }
  }, [searchName, selectedMonth, dateRange, selectedSite]);

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
            sites: String(item.sites ?? ""),
            sumPresent: Number(item.sumPresent ?? 0),
            sumAbsent: Number(item.sumAbsent ?? 0),
            sumLate: Number(item.sumLate ?? 0),
            sumHours: Number(item.sumHours ?? 0),
            avgHours: Number(item.avgHours ?? 0),
            sumTravelAllowance: Number(item.sumTravelAllowance ?? 0),
            attendanceRate: rate,
            status: (item as AttendanceStatsReport).status ?? "",
            site: (item as AttendanceStatsReport).site ?? "",
            date: (item as AttendanceStatsReport).date ?? null,
            checkIn: (item as AttendanceStatsReport).checkIn ?? null,
            checkOut: (item as AttendanceStatsReport).checkOut ?? null,
            approvedBy: 0,
            siteId: 0,
          };
        }
      );

      const nbOfday = Attendances.data?.totalDays || 0;
      let stats;
      const isFiltered =
        searchName !== "" ||
        selectedSite !== "all" ||
        selectedMonth !== "all" ||
        dateRange.from != undefined ||
        dateRange.to != undefined;
      if (isFiltered) {
        parsed.forEach((item) => {
          if (item) {
            delete item.sumPresent;
            delete item.sumAbsent;
            delete item.sumLate;
            delete item.sumHours;
            delete item.avgHours;
            delete item.sumTravelAllowance;
            delete item.sites;
            delete item.attendanceRate;
          }
        });
        stats = getAttendanceStats(parsed, nbOfday);
      } else {
        stats = getAttendanceStats(parsed, nbOfday, true);
      }

      setStats(stats);

      setAttendanceStats(parsed);
    }

    setTotalRecord(Attendances.data?.totalRecords ?? 0);
  }, [Attendances.data]);

  const exportToExcel = async () => {
    try {
      const ExcelJS = (await import("exceljs")).default;
      const { reportAllExcel, reportSingleExcel } = await import(
        "./utils/excel-report"
      );

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Staff Reports");

      const isFiltered =
        searchName !== "" ||
        selectedSite !== "all" ||
        selectedMonth !== "all" ||
        dateRange.from != undefined ||
        dateRange.to != undefined;

      if (!isFiltered) {
        await reportAllExcel(
          workbook,
          sheet,
          filtredAttendances,
          totalDays,
          Stats.attendanceRate,
          Stats.travelAllowance,
          Stats.hours,
          dateRange,
          searchName,
          selectedMonth,
          selectedSite
        );
      } else {
        await reportSingleExcel(
          workbook,
          sheet,
          filtredAttendances,
          searchName,
          dateRange,
          selectedMonth,
          selectedSite
        );
      }

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
      const base64Image = await loadImageAsBase64("/logo.png");

      const isFiltered =
        searchName !== "" ||
        selectedSite !== "all" ||
        selectedMonth !== "all" ||
        dateRange.from != undefined ||
        dateRange.to != undefined;

      if (!isFiltered) {
        const doc = new jsPDF();
        doc.addImage(base64Image, "PNG", 10, 10, 50, 15);
        const startTextY = 10 + 20 + 5;
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 200, 15, {
          align: "right",
        });
        doc.setFontSize(18);
        doc.text("Staff Attendance Reports", 65, startTextY);

        await reportAll(
          doc,
          startTextY,
          6,
          15,
          filtredAttendances,
          totalDays,
          Stats.attendanceRate,
          Stats.travelAllowance,
          Stats.hours
        );

        doc.save(`Attendance_Report.pdf`);
      } else {
        if (batchPrint) {
          const sorted = filtredAttendances.sort((a, b) =>
            a.employeeId.localeCompare(b.employeeId)
          );
          const grouped: AttendanceStatsReport[][] = sorted.reduce(
            (acc: AttendanceStatsReport[][], curr) => {
              if (
                acc.length > 0 &&
                acc[acc.length - 1][0].employeeId === curr.employeeId
              ) {
                acc[acc.length - 1].push(curr);
              } else {
                acc.push([curr]);
              }
              return acc;
            },
            []
          );

          for (const group of grouped) {
            const doc = new jsPDF();
            doc.addImage(base64Image, "PNG", 10, 10, 50, 15);
            const startTextY = 10 + 20 + 5;
            doc.setFontSize(10);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 200, 15, {
              align: "right",
            });
            doc.setFontSize(18);
            doc.text("Staff Attendance Report", 65, startTextY);

            const name = `${group[0].employeeId}_${group[0].firstName}_${
              group[0].lastName
            }_${new Date().toLocaleDateString()}`;
            await reportSingle(
              doc,
              startTextY,
              6,
              15,
              group,
              name,
              dateRange.from,
              dateRange.to,
              selectedMonth
            );

            doc.save(`Attendance_Report_${name.replace(" ", "_")}.pdf`);
          }
          return;
        } else {
          const doc = new jsPDF();
          doc.addImage(base64Image, "PNG", 10, 10, 50, 15);
          const startTextY = 10 + 20 + 5;
          doc.setFontSize(10);
          doc.text(`Generated: ${new Date().toLocaleDateString()}`, 200, 15, {
            align: "right",
          });
          doc.setFontSize(18);
          doc.text("Staff Attendance Reports", 65, startTextY);

          await reportSingle(
            doc,
            startTextY,
            6,
            15,
            filtredAttendances,
            searchName,
            dateRange.from,
            dateRange.to,
            selectedMonth
          );

          doc.save(
            `attendance_reports_${new Date().toISOString().split("T")[0]}.pdf`
          );
        }
      }
    } catch (error) {
      import("sonner").then(({ toast }) => {
        toast.error("Failed to export to PDF");
      });
      console.error("Export error:", error);
    }
  };

  const attendanceReportTableTemplate = useCallback(
    () =>
      searchName !== "" ||
      selectedSite !== "all" ||
      selectedMonth !== "all" ||
      dateRange.from != undefined ||
      dateRange.to != undefined ? (
        <SingleStaffReport
          attendances={filtredAttendances}
          isLoading={Attendances.isLoading}
          totalDays={totalDays}
        />
      ) : (
        <MultipleStaffReport
          attendances={filtredAttendances}
          isLoading={Attendances.isLoading}
          totalDays={totalDays}
        />
      ),
    [searchName, selectedSite, filtredAttendances, Attendances.isLoading]
  );
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

        {user?.role === "admin" && (
          <div className="flex gap-2 flex-wrap">
            {batchIsvisible && (
              <div className="flex items-center">
                <span className="text-sm pr-2">Bulk printing</span>
                <Switch.Root
                  checked={batchPrint}
                  onCheckedChange={() => setBatchPrint(!batchPrint)}
                  id="hasPendingRequest"
                  className=" relative h-[20px] w-[32px] cursor-default rounded-full bg-primary/50 shadow-primary/70 outline-none focus:shadow-primary data-[state=checked]:bg-primary"
                >
                  <Switch.Thumb className="block size-[18px] translate-x-0.5 rounded-full bg-white shadow transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[13px]" />
                </Switch.Root>
              </div>
            )}

            <Button variant="outline" size="sm" onClick={exportToExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={exportToPDF}>
              <FileDown className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        )}
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
          <CardTitle>
            {" "}
            <span className="capitalize">{searchName}</span> Attendance Reports
          </CardTitle>
          <CardDescription>
            Showing {filtredAttendances.length} of{" "}
            {filtredAttendances.length ?? 0} attendance record
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {attendanceReportTableTemplate()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default AttendanceReports;
