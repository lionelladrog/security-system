import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AttendanceDailyStats } from "@/type";

interface AttendanceStatsProps {
  stats: AttendanceDailyStats[] | null;
}

export function AttendanceStats({ stats }: AttendanceStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {stats?.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">{stat.title}</CardTitle>
            <div
              className={`h-10 w-10 rounded-full ${stat.bgColor} flex items-center justify-center`}
            >
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl">{stat.value}</span>
              <span className="text-sm text-muted-foreground">
                / {stat.total}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
