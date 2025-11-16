import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AttendanceTableRecord } from "@/type";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AttendanceStats } from "@/components/AttendanceStats";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Hospital,
  House,
  Presentation,
  CircleOff,
} from "lucide-react";
import { AttendanceDailyStats, StatAccumulator } from "@/type";

interface AttendanceChartProps {
  staffRecords: AttendanceTableRecord[];
  isLoading: boolean;
}

interface ChartDataItem {
  chartType?: string;
  color: string;
  dataKey: string;
  fill: string;
  hide?: boolean;
  name: string;
  payload: {
    Absent: number;
    Late: number;
    Present: number;
    absentCount: number;
    absentPercent: number;
    lateCount: number;
    latePercent: number;
    presentCount: number;
    presentPercent: number;
    localLeaveCount: number;
    localLeavePercent: number;
    sickLeaveCount: number;
    sickLeavePercent: number;
    offDutyCount: number;
    offDutyPercent: number;
    trainingCount: number;
    trainingPercent: number;
    total: number;
  };
  type?: string;
  unit?: string;
  value: number;
}

interface CustomLabelProps {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: ChartDataItem[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-2">{label}</p>
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[hsl(142,76%,36%)]" />
              <span>Present:</span>
            </div>
            <span className="font-medium">
              {data.presentCount} ({data.presentPercent}%)
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[hsl(38,92%,50%)]" />
              <span>Late:</span>
            </div>
            <span className="font-medium">
              {data.lateCount} ({data.latePercent}%)
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[hsl(346,77%,49%)]" />
              <span>Absent:</span>
            </div>
            <span className="font-medium">
              {data.absentCount} ({data.absentPercent}%)
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[hsl(259,47%,39%)]" />
              <span>Local Leave:</span>
            </div>
            <span className="font-medium">
              {data.localLeaveCount} ({data.localLeavePercent}%)
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[hsl(337,65%,40%)]" />
              <span>Sick Leave:</span>
            </div>
            <span className="font-medium">
              {data.sickLeaveCount} ({data.sickLeavePercent}%)
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[hsl(192,57%,33%)]" />
              <span>Training:</span>
            </div>
            <span className="font-medium">
              {data.trainingCount} ({data.trainingPercent}%)
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[hsl(220,15%,18%)]" />
              <span>Off Duty:</span>
            </div>
            <span className="font-medium">
              {data.offDutyCount} ({data.offDutyPercent}%)
            </span>
          </div>

          <div className="border-t border-border mt-2 pt-2">
            <div className="flex items-center justify-between gap-4">
              <span>Total Staff:</span>
              <span className="font-medium">{data.total}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = (props: CustomLabelProps) => {
  const { x, y, width, height, value } = props;

  if (!value || value === 0) return <g />;

  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="white"
      textAnchor="middle"
      dominantBaseline="middle"
      className="text-xs font-bold"
    >
      {`${value}%`}
    </text>
  );
};

export function AttendanceChart({
  staffRecords,
  isLoading,
}: AttendanceChartProps) {
  const [dailyStat, setDailyStat] = useState<AttendanceDailyStats[] | null>(
    null
  );

  const chartData = useMemo(() => {
    // Group records by date
    const recordsByDate = (() => {
      const acc: Record<string, AttendanceTableRecord[]> = {};
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

      for (
        let d = new Date(firstDayOfMonth);
        d <= today;
        d.setDate(d.getDate() + 1)
      ) {
        const key = d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        acc[key] = [];
      }

      staffRecords.forEach((record) => {
        const date = new Date(record.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        if (acc[date]) {
          acc[date].push(record);
        }
      });

      return acc;
    })();

    // Get last 20 days and calculate percentages
    const dates = Object.keys(recordsByDate).sort();
    // const last14Dates = dates.slice(-20);

    return dates.map((dateStr) => {
      const dayRecords = recordsByDate[dateStr];
      const total = dayRecords.length;
      const staffs: number[] = [];

      const presentCount = dayRecords.filter((r) => {
        if (!staffs.includes(r.staffId)) {
          staffs.push(r.staffId);
          return r.statusId === 1;
        }
      }).length;

      const lateCount = dayRecords.filter((r) => {
        if (staffs.includes(r.staffId)) {
          return r.statusId === 2;
        }
      }).length;
      const absentCount = dayRecords.filter((r) => {
        if (staffs.includes(r.staffId)) {
          return r.statusId === 3;
        }
      }).length;

      const localLeaveCount = dayRecords.filter((r) => {
        if (staffs.includes(r.staffId)) {
          return r.statusId === 5;
        }
      }).length;

      const sickLeaveCount = dayRecords.filter((r) => {
        if (staffs.includes(r.staffId)) {
          return r.statusId === 6;
        }
      }).length;
      const trainingCount = dayRecords.filter((r) => {
        if (staffs.includes(r.staffId)) {
          return r.statusId === 10;
        }
      }).length;
      const offDutyCount = dayRecords.filter((r) => {
        if (staffs.includes(r.staffId)) {
          return r.statusId === 9;
        }
      }).length;

      const presentPercent =
        total > 0 ? Math.round((presentCount / total) * 100) : 0;
      const latePercent = total > 0 ? Math.round((lateCount / total) * 100) : 0;
      const absentPercent =
        total > 0 ? Math.round((absentCount / total) * 100) : 0;

      const localLeavePercent =
        total > 0 ? Math.round((localLeaveCount / total) * 100) : 0;
      const sickLeavePercent =
        total > 0 ? Math.round((sickLeaveCount / total) * 100) : 0;
      const trainingPercent =
        total > 0 ? Math.round((trainingCount / total) * 100) : 0;
      const offDutyPercent =
        total > 0 ? Math.round((offDutyCount / total) * 100) : 0;

      const year = new Date().getFullYear();
      const Fulldate = new Date(`${dateStr} ${year}`);
      const date = new Date(Fulldate);
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      return {
        date: formattedDate,
        Present: presentPercent,
        Late: latePercent,
        Absent: absentPercent,
        SickLeave: sickLeavePercent,
        LocalLeave: localLeavePercent,
        Training: trainingPercent,
        OffDuty: offDutyPercent,
        presentCount,
        localLeaveCount,
        sickLeaveCount,
        trainingCount,
        offDutyCount,
        localLeavePercent: localLeavePercent,
        sickLeavePercent: sickLeavePercent,
        trainingPercent: trainingPercent,
        offDutyPercent: offDutyPercent,
        lateCount,
        absentCount,
        presentPercent,
        latePercent,
        absentPercent,
        total,
      };
    });
  }, [staffRecords]);

  useEffect(() => {
    if (chartData.length > 0) {
      const monthlyStat = chartData.reduce<StatAccumulator>(
        (acc, curr) => ({
          presentCount: acc.presentCount + curr.presentCount,
          lateCount: acc.lateCount + curr.lateCount,
          absentCount: acc.absentCount + curr.absentCount,
          localLeaveCount: acc.localLeaveCount + curr.localLeaveCount,
          sickLeaveCount: acc.sickLeaveCount + curr.sickLeaveCount,
          trainingCount: acc.trainingCount + curr.trainingCount,
          offDutyCount: acc.offDutyCount + curr.offDutyCount,
          total: acc.total + curr.total,
        }),
        {
          presentCount: 0,
          lateCount: 0,
          absentCount: 0,
          localLeaveCount: 0,
          sickLeaveCount: 0,
          trainingCount: 0,
          offDutyCount: 0,
          total: 0,
        }
      );

      const {
        presentCount,
        absentCount,
        localLeaveCount,
        sickLeaveCount,
        trainingCount,
        offDutyCount,
        lateCount,
        total,
      } = monthlyStat;

      const attendanceRate =
        total > 0
          ? Math.round(
              ((presentCount + trainingCount) / chartData.length) * 100
            )
          : 0;

      setDailyStat([
        {
          title: "Present Days",
          value: presentCount.toString(),
          total: chartData.length.toString(),
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-50",
        },
        {
          title: "Training Days",
          value: trainingCount.toString(),
          total: chartData.length.toString(),
          icon: Presentation,
          color: "text-cyan-600",
          bgColor: "bg-cyan-50",
        },
        {
          title: "Late Arrivals",
          value: lateCount.toString(),
          total: chartData.length.toString(),
          icon: Clock,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
        },
        {
          title: "Off Duty Days",
          value: offDutyCount.toString(),
          total: chartData.length.toString(),
          icon: CircleOff,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
        },

        {
          title: "Absent Days",
          value: absentCount.toString(),
          total: chartData.length.toString(),
          icon: XCircle,
          color: "text-red-600",
          bgColor: "bg-red-50",
        },

        {
          title: "Local Leave Days",
          value: localLeaveCount.toString(),
          total: chartData.length.toString(),
          icon: House,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
        },
        {
          title: "Sick Leave Days",
          value: sickLeaveCount.toString(),
          total: chartData.length.toString(),
          icon: Hospital,
          color: "text-pink-600",
          bgColor: "bg-pink-50",
        },

        {
          title: "Attendance Rate",
          value: `${attendanceRate}%`,
          total: "This month",
          icon: Calendar,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        },
      ]);
    }
  }, [chartData]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="">
      <AttendanceStats stats={dailyStat} />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Attendance Overview</CardTitle>
          <CardDescription>
            Daily attendance distribution across all staff
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-sm"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-sm"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  label={{
                    value: "Percentage (%)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "hsl(var(--muted-foreground))" },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                <Bar
                  dataKey="Present"
                  stackId="a"
                  fill="hsl(145,55%,41%)"
                  label={renderCustomLabel}
                />
                <Bar
                  dataKey="Training"
                  stackId="a"
                  fill="hsl(192,91%,37%)"
                  // label={renderCustomLabel}
                />
                <Bar
                  dataKey="LocalLeave"
                  stackId="a"
                  fill="hsl(259,72%,52%)"
                  // label={renderCustomLabel}
                />
                <Bar
                  dataKey="SickLeave"
                  stackId="a"
                  fill="hsl(330,70%,54%)"
                  // label={renderCustomLabel}
                />
                <Bar
                  dataKey="OffDuty"
                  stackId="a"
                  fill="hsl(210,15%,43%)"
                  // label={renderCustomLabel}
                />

                <Bar
                  dataKey="Late"
                  stackId="a"
                  fill="hsl(25,94%,54%)"
                  // label={renderCustomLabel}
                />
                <Bar
                  dataKey="Absent"
                  stackId="a"
                  fill="hsl(346, 77%, 49%)"
                  // label={renderCustomLabel}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
