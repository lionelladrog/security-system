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

type StaffReportProps = {
  attendances: AttendanceStatsReport[];
  isLoading: boolean;
  totalDays: number;
};
export const SingleStaffReport: React.FC<StaffReportProps> = ({
  attendances,
  isLoading,
}) => {
  const dateCounts = attendances.reduce((acc, report) => {
    const dateKey = report.date
      ? format(new Date(report.date), "dd-MM-yyyy")
      : "";
    acc[dateKey] = (acc[dateKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const employeeCountsByDate = attendances.reduce((acc, report) => {
    const dateKey = report.date
      ? format(new Date(report.date), "dd-MM-yyyy")
      : "";
    const empKey = `${report.employeeId}-${report.firstName}-${report.lastName}`;
    if (!acc[dateKey]) acc[dateKey] = {};
    acc[dateKey][empKey] = (acc[dateKey][empKey] || 0) + 1;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const renderedDates = new Set<string>();
  const renderedEmployeesInDate = new Set<string>();

  return (
    <div>
      {isLoading ? (
        <AttendanceReportTableSkeleton />
      ) : (
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
            {attendances.length > 0 ? (
              attendances.map((report, index) => {
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
                    {isFirstDateOccurrence ? (
                      <TableCell rowSpan={dateCounts[dateKey]} className="">
                        {dateKey}
                      </TableCell>
                    ) : null}

                    {isFirstEmployeeOccurrenceInDate ? (
                      <TableCell
                        rowSpan={employeeCountsByDate[dateKey][empKey]}
                        className="font-medium"
                      >
                        {report.employeeId}
                      </TableCell>
                    ) : null}

                    {isFirstEmployeeOccurrenceInDate ? (
                      <TableCell
                        rowSpan={employeeCountsByDate[dateKey][empKey]}
                      >
                        {report.firstName} {report.lastName}
                      </TableCell>
                    ) : null}

                    <TableCell>
                      <SiteBadge site={report.site} />
                    </TableCell>
                    <TableCell>{report.checkIn?.substring(0, 5)}</TableCell>
                    <TableCell>{report.checkOut?.substring(0, 5)}</TableCell>
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
                  colSpan={10}
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
  );
};

export const MultipleStaffReport: React.FC<StaffReportProps> = ({
  attendances,
  isLoading,
  totalDays,
}) => {
  return (
    <div>
      {isLoading ? (
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
            {attendances.length > 0 ? (
              attendances.map((report, index) => (
                <TableRow
                  key={`${report.employeeId}-${index}`}
                  className="hover:bg-slate-50"
                >
                  <TableCell className="font-medium">
                    {report.employeeId}
                  </TableCell>
                  <TableCell>
                    {report.firstName} {report.lastName}
                  </TableCell>
                  <TableCell>
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
                          : report.attendanceRate && report.attendanceRate >= 75
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }
                    >
                      {report.attendanceRate?.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>{report.sumHours?.toFixed(2)}</TableCell>
                  <TableCell>{report.avgHours?.toFixed(2)}</TableCell>
                  <TableCell>{report.sumTravelAllowance?.toFixed(2)}</TableCell>
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
  );
};
