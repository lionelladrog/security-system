import { Badge } from "@/components/ui/badge";
export const getStatusBadge = (status: string) => {
  switch (status) {
    case "present":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Present
        </Badge>
      );
    case "absent":
      return <Badge variant="destructive">Absent</Badge>;
    case "late":
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
          Late
        </Badge>
      );
    case "half-day":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          Half Day
        </Badge>
      );
    case "leave":
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
          WFH
        </Badge>
      );
    case "sick":
      return (
        <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-100">
          Sick
        </Badge>
      );
    case "off":
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
          Off
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};
