import { useState, useEffect } from "react";
import { AttendanceStatsReport } from "@/type";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AttendanceReportTableSkeleton } from "@/components/Skeleton";
import { format } from "date-fns";
import { decimalToHourMin } from "@/lib/utils";
import { getStatusBadge } from "@/lib/helperTemplate";
import { SiteBadge } from "@/components/siteBadge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type StaffReportProps = {
  attendances: AttendanceStatsReport[];
  isLoading: boolean;
  totalDays: number;
};
export const SingleStaffReport: React.FC<StaffReportProps> = ({
  attendances,
  isLoading,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPages = Math.ceil(attendances.length / itemsPerPage);

  // PAGINATION : staffs sur la page courante
  const paginatedStaffs = attendances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [attendances, itemsPerPage]);

  // Regroupement sur data paginée (page courante) : évite les décales de colonne
  const dateCountsOnPage = paginatedStaffs.reduce((acc, report) => {
    const dateKey = report.date
      ? format(new Date(report.date), "dd-MM-yyyy")
      : "";
    acc[dateKey] = (acc[dateKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const employeeCountsByDateOnPage = paginatedStaffs.reduce((acc, report) => {
    const dateKey = report.date
      ? format(new Date(report.date), "dd-MM-yyyy")
      : "";
    const empKey = `${report.employeeId}-${report.firstName}-${report.lastName}`;
    if (!acc[dateKey]) acc[dateKey] = {};
    acc[dateKey][empKey] = (acc[dateKey][empKey] || 0) + 1;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  return (
    <div>
      {isLoading ? (
        <AttendanceReportTableSkeleton />
      ) : (
        <div>
          <div className="w-full overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Check in</TableHead>
                  <TableHead>Check out</TableHead>
                  <TableHead>break time</TableHead>
                  <TableHead>Other time</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Travelling</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const renderedDates = new Set<string>();
                  const renderedEmployeesInDate = new Set<string>();

                  return paginatedStaffs.length > 0 ? (
                    paginatedStaffs.map((report, index) => {
                      const dateKey = report.date
                        ? format(new Date(report.date), "dd-MM-yyyy")
                        : "";
                      const empKey = `${report.employeeId}-${report.firstName}-${report.lastName}`;

                      const isFirstDateOccurrence = !renderedDates.has(dateKey);
                      if (isFirstDateOccurrence) renderedDates.add(dateKey);

                      const employeeDateKey = `${dateKey}-${empKey}`;
                      const isFirstEmployeeOccurrenceInDate = !renderedEmployeesInDate.has(
                        employeeDateKey
                      );
                      if (isFirstEmployeeOccurrenceInDate)
                        renderedEmployeesInDate.add(employeeDateKey);

                      return (
                        <TableRow
                          key={`${report.id}-${index}`}
                          className="hover:bg-slate-50"
                        >
                          {isFirstDateOccurrence && (
                            <TableCell rowSpan={dateCountsOnPage[dateKey]}>
                              {dateKey}
                            </TableCell>
                          )}
                          {isFirstEmployeeOccurrenceInDate && (
                            <>
                              <TableCell
                                rowSpan={
                                  employeeCountsByDateOnPage[dateKey][empKey]
                                }
                              >
                                {report.employeeId}
                              </TableCell>
                              <TableCell
                                rowSpan={
                                  employeeCountsByDateOnPage[dateKey][empKey]
                                }
                              >
                                {report.firstName} {report.lastName}
                              </TableCell>
                            </>
                          )}
                          <TableCell>
                            <SiteBadge site={report.site} />
                          </TableCell>
                          <TableCell>
                            {report.checkIn?.substring(0, 5)}
                          </TableCell>
                          <TableCell>
                            {report.checkOut?.substring(0, 5)}
                          </TableCell>
                          <TableCell>{report.breakTime}min</TableCell>
                          <TableCell>{report.otherHours}min</TableCell>
                          <TableCell>
                            {decimalToHourMin(Number(report.hours))}
                          </TableCell>
                          <TableCell>
                            Rs {Number(report.travelAllowance).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {report.status ? getStatusBadge(report.status) : ""}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={11}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No data available for the selected filters
                      </TableCell>
                    </TableRow>
                  );
                })()}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">Rows per page:</span>
              <Select onValueChange={(v) => setItemsPerPage(Number(v))}>
                <SelectTrigger className="w-15 bg-transparent border border-gray-300 rounded px-2 py-0 !important">
                  <SelectValue placeholder={itemsPerPage} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {[10, 20, 50, 100].map((n) => (
                    <SelectItem
                      key={n}
                      value={String(n)}
                      className="py-1 hover:bg-blue-100"
                    >
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                style={{ padding: "2px 10px" }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    style={{ padding: "2px 14px" }}
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                variant="outline"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                style={{ padding: "2px 10px" }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const MultipleStaffReport: React.FC<StaffReportProps> = ({
  attendances,
  isLoading,
  totalDays,
}) => {
  // --- PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPages = Math.ceil(attendances.length / itemsPerPage);

  const paginatedStaffs = attendances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [attendances, itemsPerPage]);
  return (
    <div>
      {isLoading ? (
        <AttendanceReportTableSkeleton />
      ) : (
        <div>
          <div className="w-full overflow-x-auto  rounded-md border">
            <Table className="min-w-max">
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Total Days</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Training</TableHead>
                  <TableHead>Off Duty</TableHead>
                  <TableHead>Absent</TableHead>
                  <TableHead>Local Leave</TableHead>
                  <TableHead>Sick Leave</TableHead>
                  <TableHead>Late</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Avg Hours</TableHead>
                  <TableHead>Travel (Rs)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStaffs.length > 0 ? (
                  paginatedStaffs.map((report, index) => (
                    <TableRow
                      key={`${report.employeeId}-${index}`}
                      className="hover:bg-slate-50"
                    >
                      <TableCell className="font-medium">
                        {report.employeeId}
                      </TableCell>
                      <TableCell className="break-words whitespace-normal max-w-[250px]">
                        {report.firstName} {report.lastName}
                      </TableCell>
                      <TableCell className="break-words whitespace-normal max-w-[150px] ">
                        {report.sites &&
                          report.sites.split(", ").map((site, index) => (
                            <span key={index}>
                              <SiteBadge site={site} />
                            </span>
                          ))}
                      </TableCell>
                      <TableCell>{totalDays}</TableCell>
                      <TableCell className="text-green-600">
                        {report.sumPresent}
                      </TableCell>
                      <TableCell className="text-cyan-600">
                        {report.sumTraining}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {report.sumOff}
                      </TableCell>
                      <TableCell className="text-red-600">
                        {report.sumAbsent}
                      </TableCell>
                      <TableCell className="text-purple-600">
                        {report.sumLocalLeave}
                      </TableCell>
                      <TableCell className="text-pink-600">
                        {report.sumSickLeave}
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
          </div>
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">Rows per page:</span>

              <Select onValueChange={(v) => setItemsPerPage(Number(v))}>
                <SelectTrigger className="w-15 bg-transparent border border-gray-300  rounded px-2 py-0 !important">
                  <SelectValue placeholder={itemsPerPage} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {[10, 20, 50, 100].map((n) => (
                    <SelectItem
                      key={n}
                      value={String(n)}
                      className=" py-1 hover:bg-blue-100"
                    >
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                style={{ padding: "2px 10px" }}
              >
                <ChevronLeft className=" h-4 w-4 " />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    style={{ padding: "2px 14px" }}
                  >
                    {page}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                style={{ padding: "2px 10px" }}
              >
                <ChevronRight className=" h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
