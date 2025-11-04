"use client";
import { useState, useEffect } from "react";
import { AttendanceChart } from "../../components/AttendanceChart";

import { AttendanceTableRecord } from "@/type";
import { trpc } from "@/lib/trpc";

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

  return (
    <div>
      <AttendanceChart staffRecords={filtredAttendances} />
    </div>
  );
};

export default Dashboard;
