import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div>
              <Skeleton className="h-3 w-24 bg-slate-200" />
            </div>
            <CardTitle className="text-3xl">
              <Skeleton className="h-4 w-10 rounded-lg bg-slate-200" />
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

export function StaffTableSkeleton() {
  const columns = [
    "Employee ID",
    "Name",
    "Site",
    "Status",
    "Check In",
    "Check Out",
    "Hours",
    "Travelling (Rs)",
    "Actions",
  ];

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({ length: 9 }).map((_, index) => (
            <TableRow key={index}>
              {/* Employee ID */}
              <TableCell>
                <Skeleton className="h-3 w-16 bg-slate-200" />
              </TableCell>

              {/* Name */}
              <TableCell>
                <Skeleton className="h-3 w-28 bg-slate-200" />
              </TableCell>

              {/* Site */}
              <TableCell>
                <Skeleton className="h-4 w-20 rounded-full bg-slate-200" />
              </TableCell>

              {/* Status */}
              <TableCell>
                <Skeleton className="h-4 w-16 rounded-full bg-slate-200" />
              </TableCell>

              {/* Check In */}
              <TableCell>
                <Skeleton className="h-3 w-12 bg-slate-200" />
              </TableCell>

              {/* Check Out */}
              <TableCell>
                <Skeleton className="h-3 w-12 bg-slate-200" />
              </TableCell>

              {/* Hours */}
              <TableCell>
                <Skeleton className="h-3 w-10 bg-slate-200" />
              </TableCell>

              {/* Travel (Rs) */}
              <TableCell>
                <Skeleton className="h-3 w-12 bg-slate-200" />
              </TableCell>

              {/* Actions */}
              <TableCell>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-8 rounded-md bg-slate-200" />
                  <Skeleton className="h-6 w-8 rounded-md bg-slate-200" />
                  <Skeleton className="h-6 w-8 rounded-md bg-slate-200" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function StaffReportTableSkeleton() {
  const rows = Array.from({ length: 5 });

  return (
    <div className="w-full space-y-2">
      {/* Header skeleton */}
      {/* <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-2 bg-gray-100 rounded-md animate-pulse w-full">
        {Array.from({ length: 11 }).map((_, idx) => (
          <div key={idx} className="h-4 bg-gray-300 rounded w-full" />
        ))}
      </div> */}

      {/* Rows skeleton */}
      {rows.map((_, idx) => (
        <div
          key={idx}
          className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-2 bg-white rounded-md shadow-sm animate-pulse w-full"
        >
          {Array.from({ length: 11 }).map((_, colIdx) => (
            <div key={colIdx} className="h-4 bg-slate-200 rounded w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3 space-y-2">
            <Skeleton className="h-3 w-1/3 bg-slate-200" />
            <Skeleton className="h-5 w-2/3 bg-slate-200" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-3 w-1/2 bg-slate-200" />
            {i === 1 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <Skeleton className="h-2 w-1/3 bg-slate-200" />
                  <Skeleton className="h-2 w-6 bg-slate-200" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <Skeleton className="h-2 w-1/3 bg-slate-200" />
                  <Skeleton className="h-2 w-6 bg-slate-200" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <Skeleton className="h-2 w-1/3 bg-slate-200" />
                  <Skeleton className="h-2 w-6 bg-slate-200" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
export function AttendanceReportTableSkeleton() {
  const columns = [
    "Employee ID",
    "Name",
    "Site",
    "Total Days",
    "Present",
    "Absent",
    "Late",
    "Rate",
    "Total Hours",
    "Avg Hours",
    "Travel (Rs)",
  ];

  return (
    <div className="">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({ length: 8 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell>
                <Skeleton className="h-3 w-16 bg-slate-200" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3 w-24 bg-slate-200" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3 w-20 rounded-full bg-slate-200" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3 w-10 bg-slate-200" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3 w-8 bg-green-200" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3 w-8 bg-red-200" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3 w-8 bg-orange-200" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3 w-14 rounded-full bg-slate-200" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-3 w-10 bg-slate-200" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3 w-10 bg-slate-200" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-3 w-12 bg-slate-200" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
