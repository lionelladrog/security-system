"use client";
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Edit, Trash2, Bell, Pencil } from "lucide-react";
import { AttendanceTableRecord } from "../type";
import { trpc } from "../lib/trpc";
import userStore from "../store/userStore";
import { StaffTableSkeleton } from "@/components/Skeleton";
import { getStatusBadge } from "@/lib/helperTemplate";
import { decimalToHourMin } from "@/lib/utils";
import { format } from "date-fns";

interface AttendanceTableProps {
  filteredStaffs: AttendanceTableRecord[];
  isLoading: boolean;
  onDelete: () => void;
  onEdit: (attendance: AttendanceTableRecord) => void;
}

export function AttendanceTable({
  filteredStaffs,
  isLoading,
  onDelete,
  onEdit,
}: AttendanceTableProps) {
  const user = userStore((state) => state.user);

  const [staffToDelete, setStaffToDelete] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const AttendanceMutation = trpc.attendance.delete.useMutation();

  const openDeleteDialog = (staffId: number) => {
    setStaffToDelete(staffId);
    setShowDeleteDialog(true);
  };

  const handleDeleteStaff = () => {
    if (staffToDelete === null) return;
    AttendanceMutation.mutate(
      { id: staffToDelete },
      {
        onSuccess: () => {
          onDelete();
          toast.success("Attendance record deleted successfully");
          setShowDeleteDialog(false);
        },
        onError: () => {
          toast.error("Failed to delete attendance record");
        },
      }
    );
  };

  if (isLoading) {
    return <StaffTableSkeleton />;
  }

  const dateCounts = filteredStaffs.reduce((acc, report) => {
    const dateKey = report.date
      ? format(new Date(report.date), "dd-MM-yyyy")
      : "";
    acc[dateKey] = (acc[dateKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const renderedDates = new Set<string>();

  return (
    <div>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the staff attendance record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStaff}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Employee ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Site</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Check In</TableHead>
            <TableHead>Check Out</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Travelling (Rs)</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStaffs.length > 0 ? (
            filteredStaffs.map((member) => {
              const dateKey = member.date
                ? format(new Date(member.date), "dd-MM-yyyy")
                : "";
              const isFirstDateOccurrence = !renderedDates.has(dateKey);
              if (isFirstDateOccurrence) renderedDates.add(dateKey);
              return (
                <TableRow
                  key={member.id}
                  className={member?.hasPendingRequest ? "bg-primary/10" : ""}
                >
                  {isFirstDateOccurrence ? (
                    <TableCell rowSpan={dateCounts[dateKey]} className="">
                      {dateKey}
                    </TableCell>
                  ) : null}
                  <TableCell className="font-medium">
                    {member.employeeId}
                  </TableCell>
                  <TableCell>
                    {member.firstName} {member.lastName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{member.site}</Badge>
                  </TableCell>
                  <TableCell>
                    {member?.status ? getStatusBadge(member?.status) : ""}
                  </TableCell>
                  <TableCell>{member?.checkIn || "-"}</TableCell>
                  <TableCell>{member?.checkOut || "-"}</TableCell>
                  <TableCell>
                    {decimalToHourMin(Number(member?.hours) ?? 0)}
                  </TableCell>
                  <TableCell>
                    {member?.travelAllowance
                      ? `${member.travelAllowance}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {user && user.role !== "viewer" && (
                      <div className="flex gap-2 items-center">
                        {member ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(member)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button size="sm" variant="default">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDeleteDialog(member.id ?? 0)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        {member?.hasPendingRequest && (
                          <TooltipPrimitive.Root>
                            <TooltipPrimitive.Trigger>
                              <Bell className="h-4 w-4 text-orange-500 animate-pulse" />
                            </TooltipPrimitive.Trigger>
                            <TooltipPrimitive.Content
                              side="bottom"
                              className="bg-white text-black px-3 py-2 rounded-sm shadow-lg"
                            >
                              {member?.notes}
                              <TooltipPrimitive.Arrow className="fill-white" />
                            </TooltipPrimitive.Content>
                          </TooltipPrimitive.Root>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-center py-8 text-muted-foreground"
              >
                No staff members found matching your search
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
