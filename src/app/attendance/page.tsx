"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CalendarIcon, UserPlus, Clock, Search } from "lucide-react";
import { format } from "date-fns";
import { trpc } from "@/lib/trpc";
import { months } from "@/constant";
import {
  AttendanceTableRecord,
  NewStaffMember,
  StatsType,
  AttendanceStatus as AttendanceStatusType,
} from "@/type";
import { StaffForm } from "@/components/StaffForm";
import StaffAttendanceForm from "@/components/StaffAttendanceForm";
import { AttendanceTable } from "@/components/AttendanceTable";
import { getAttendanceStats } from "@/lib/utils";
import { StatsCardsSkeleton } from "@/components/Skeleton";
import { Toaster } from "@/components/ui/sonner";
import userStore from "@/store/userStore";

export interface StaffMember {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  site: string;
}

export interface StaffAttendanceRecord {
  staffId: number;
  date: string;
  status: "present" | "absent" | "late";
  checkIn?: string;
  checkOut?: string;
  breakTime?: number;
  travelAllowance?: number;
  hours?: number;
  site?: string;
  notes?: string;
  hasPendingRequest?: boolean;
}

function StaffAttendance() {
  const StaffsData = trpc.user.getSatffs.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const AttendanceStatusData = trpc.attendance.getAttendanceStatus.useQuery(
    undefined,
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  const [filtredAttendances, setAttendanceState] = useState<
    AttendanceTableRecord[]
  >([]);
  const [
    recordToUpdate,
    setRecordToUpdate,
  ] = useState<AttendanceTableRecord | null>(null);

  const user = userStore((state) => state.user);

  const today = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const allowedDates = [
    new Date(today.getTime()),
    new Date(today.getTime() - oneDay),
    new Date(today.getTime() - 2 * oneDay),
  ];
  //   filter params
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [searchName, setSearchName] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});

  const [totalStaff, setTotalStaff] = useState(0);
  const [attendanceStats, setAttendanceStats] = useState<StatsType>({
    present: 0,
    absent: 0,
    late: 0,
    localLeave: 0,
    sickLeave: 0,
    offDuty: 0,
    training: 0,
    sites: 0,
    travelAllowance: 0,
    attendanceRate: 0,
    hours: 0,
    notMarked: 0,
    totalRecord: 0,
  });
  const [staffs, setStaffs] = useState<NewStaffMember[]>([]);
  const [AttendanceStatus, setAttendanceStatus] = useState<
    AttendanceStatusType[]
  >([]);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [isDelete, setStaffIsDelete] = useState<boolean>(false);

  useEffect(() => {
    const newParams: Record<string, string> = {};

    if (searchName !== "") {
      newParams.employee = searchName;
    }
    if (selectedMonth !== "all") {
      newParams.month = selectedMonth;
    } else if (dateRange.from && dateRange.to) {
      newParams.date_from = format(dateRange.from, "yyyy-MM-dd");
      newParams.date_to = format(dateRange.to, "yyyy-MM-dd");
    } else if (selectedDate) {
      newParams.date = format(selectedDate, "yyyy-MM-dd");
    }

    setQueryParams(newParams);
  }, [searchName, selectedMonth, dateRange, selectedDate]);

  //query

  const Attendances = trpc.attendance.get.useQuery(
    { ...queryParams },
    {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    }
  );

  useEffect(() => {
    if (StaffsData.data) {
      const transformed = StaffsData.data.map((s) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
        hireDate: s.hireDate ? new Date(s.hireDate) : undefined,
      }));
      setStaffs(transformed);
      setTotalStaff(transformed.length);
    }
  }, [StaffsData.data]);

  useEffect(() => {
    if (!showAddStaff) {
      StaffsData.refetch();
    }
  }, [showAddStaff, StaffsData]);

  useEffect(() => {
    if (AttendanceStatusData.data) {
      setAttendanceStatus(AttendanceStatusData.data);
    }
  }, [AttendanceStatusData.data]);

  useEffect(() => {
    if (isDelete || queryParams) {
      Attendances.refetch();

      setStaffIsDelete(false);
    }
  }, [isDelete, queryParams, Attendances]);

  useEffect(() => {
    if (recordToUpdate) {
      setShowAttendanceForm(true);
    }
  }, [recordToUpdate]);

  useEffect(() => {
    if (Attendances.data) {
      const parsed = Attendances.data.map((item) => ({
        ...item,
        date: new Date(item.date),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        approvedAt: new Date(item.approvedAt),
        status: item.status ? item.status : "",
      }));

      setAttendanceState(parsed);

      const newparsed = Attendances.data.map((item) => ({
        ...item,
        date: new Date(item.date),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        approvedAt: new Date(item.approvedAt),
        status: item.status ? item.status : "",
        hours: "",
      }));

      const stats = getAttendanceStats(newparsed, 0, false);

      setAttendanceStats(stats);
    }
  }, [Attendances.data]);

  const handleOpenAttendanceForm = () => {
    setRecordToUpdate(null);
    if (!showAttendanceForm) {
      setShowAttendanceForm(true);
    }
  };

  const handleCloseAttendanceForm = () => {
    setShowAttendanceForm(false);
    setRecordToUpdate(null);
  };

  const isDateDisabled = (date: Date) => {
    return !allowedDates.some(
      (allowedDate) => allowedDate.toDateString() === date.toDateString()
    );
  };

  return (
    <div className="space-y-6">
      <Toaster position="bottom-right" />
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2>Staff Attendance</h2>
          <p className="text-muted-foreground">
            Manage and track staff attendance records
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Dialog open={showAddStaff} onOpenChange={setShowAddStaff}>
            <DialogTrigger asChild>
              {user?.role === "admin" && (
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Staff
                </Button>
              )}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogDescription>
                  Enter the details of the new staff member
                </DialogDescription>
              </DialogHeader>
              <StaffForm
                showAddStaffForm={showAddStaff}
                callback={setShowAddStaff}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <CardTitle>Today&apos;s Status</CardTitle>
      {Attendances.isLoading ? (
        <StatsCardsSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Staff</CardDescription>
              <CardTitle className="text-3xl">{totalStaff}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Present</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {attendanceStats.present}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Absent</CardDescription>
              <CardTitle className="text-3xl text-red-600">
                {attendanceStats.absent}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Late</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">
                {attendanceStats.late}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Not Marked</CardDescription>
              <CardTitle className="text-3xl text-gray-600">
                {attendanceStats.notMarked}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Date Selector */}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Select Date</CardTitle>
              <CardDescription>
                Choose a date to mark attendance
              </CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) =>
                    date && (setSelectedDate(date), setSelectedMonth("all"))
                  }
                  disabled={user?.role !== "admin" && isDateDisabled}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
      </Card>

      {/* Today's Status */}
      {user?.role === "viewer" ? null : (
        <Card>
          <CardHeader>
            <CardDescription>{format(selectedDate, "PPP")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={handleOpenAttendanceForm}>
              <Clock className="h-4 w-4 mr-2" />
              Record Attendance
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff List</CardTitle>
          <CardDescription>
            Mark attendance for {format(selectedDate, "PPP")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, employee ID, email..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            {user?.role === "admin" && (
              <div className="flex gap-4">
                <div className="">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="min-w-[280px] justify-start"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} -{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Filter by date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="range"
                        selected={{ from: dateRange.from, to: dateRange.to }}
                        onSelect={(range) =>
                          setDateRange({ from: range?.from, to: range?.to })
                        }
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className=" ">
                  <Select
                    value={selectedMonth}
                    onValueChange={setSelectedMonth}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Export filter" />
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
              </div>
            )}
          </div>

          {/* Results count */}
          <div className="mb-3 text-sm text-muted-foreground">
            Showing {staffs.length} of {staffs.length} staff members
          </div>

          <div className="rounded-md border">
            <AttendanceTable
              filteredStaffs={filtredAttendances}
              isLoading={Attendances.isLoading}
              onDelete={() => setStaffIsDelete(true)}
              onEdit={setRecordToUpdate}
            />
          </div>
        </CardContent>
      </Card>

      {/* Attendance Form Dialog */}
      <Dialog
        open={showAttendanceForm}
        onOpenChange={handleCloseAttendanceForm}
      >
        <DialogContent
          className="max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {recordToUpdate
                ? `Update Attendance of ${format(
                    recordToUpdate.date,
                    "eee, PPP"
                  )}`
                : `Record Attendance on ${format(selectedDate, "eee, PPP")}`}
            </DialogTitle>
            <DialogDescription className="mb-2">
              Enter attendance details with clock in/out times
            </DialogDescription>
          </DialogHeader>
          <StaffAttendanceForm
            staffs={staffs}
            AttendanceStatus={AttendanceStatus}
            attendanceCallBack={() => Attendances.refetch()}
            selectedDate={selectedDate}
            attendanceRecord={recordToUpdate}
            showAttendanceForm={showAttendanceForm}
            formCallback={setShowAttendanceForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default StaffAttendance;
