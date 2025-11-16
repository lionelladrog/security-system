"use client";
import { useState, useEffect } from "react";
import { AttendanceChart } from "../../components/AttendanceChart";

import { AttendanceTableRecord } from "@/type";
import { trpc } from "@/lib/trpc";
import { getMonthName } from "@/lib/utils";
const Dashboard = () => {
  const [filtredAttendances, setAttendanceStats] = useState<
    AttendanceTableRecord[]
  >([]);

  const Attendances = trpc.attendance.get.useQuery(
    {},
    {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    }
  );

  useEffect(() => {
    if (Attendances.data) {
      const parsed: AttendanceTableRecord[] = Attendances.data.map((item) => {
        return {
          ...item,
          date: new Date(item.date),
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          approvedAt: new Date(item.approvedAt),
        };
      });
      setAttendanceStats(parsed);
    }
  }, [Attendances.data]);
  const now = new Date();
  const currentMonthIndex = now.getMonth() + 1;
  const currentYear = new Date().getFullYear();

  return (
    <div>
      <div className="mb-4">
        <h2>
          Attendance analytics of {getMonthName(currentMonthIndex)}{" "}
          {currentYear}
        </h2>
        <p className="text-muted-foreground">
          View detailed attendance analytics
        </p>
      </div>
      <AttendanceChart
        staffRecords={filtredAttendances}
        isLoading={Attendances.isLoading}
      />
    </div>
  );
};

export default Dashboard;
