"use client";
import { useState, useEffect } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
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
import { Edit, Trash2, Bell, ChevronLeft, ChevronRight } from "lucide-react";
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

  // --- PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPages = Math.ceil(filteredStaffs.length / itemsPerPage);

  const paginatedStaffs = filteredStaffs.slice(
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
  }, [filteredStaffs, itemsPerPage]);

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

  const dateCounts = paginatedStaffs.reduce((acc, report) => {
    const dateKey = report.date
      ? format(new Date(report.date), "dd-MM-yyyy")
      : "";
    acc[dateKey] = (acc[dateKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const renderedDates = new Set<string>();

  return (
    <div className="">
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
      {/* TABLE */}
      {/* Results count */}
      <div className="mb-3 text-sm text-muted-foreground">
        Showing {paginatedStaffs.length} of {filteredStaffs.length} attendance
        Records
      </div>
      <div className="w-full overflow-x-auto rounded-md border">
        <Table className="w-full table-auto ">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Break time</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Other hours</TableHead>
              <TableHead>Travelling (Rs)</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedStaffs.length > 0 ? (
              paginatedStaffs.map((member) => {
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
                      <TableCell rowSpan={dateCounts[dateKey]} className="py-1">
                        {dateKey}
                      </TableCell>
                    ) : null}

                    <TableCell className="font-medium py-1">
                      {member.employeeId}
                    </TableCell>
                    <TableCell className="py-1 break-words whitespace-normal max-w-[250px]">
                      {member.firstName} {member.lastName}
                    </TableCell>
                    <TableCell className="py-1">
                      <Badge variant="outline">{member.site}</Badge>
                    </TableCell>
                    <TableCell className="py-1">
                      {member.status ? getStatusBadge(member.status) : ""}
                    </TableCell>
                    <TableCell className="py-1">
                      {member?.checkIn || "-"}
                    </TableCell>
                    <TableCell className="py-1">
                      {member?.checkOut || "-"}
                    </TableCell>
                    <TableCell className="py-1">
                      {`${member?.breakTime} min` || ""}
                    </TableCell>
                    <TableCell className="py-1">
                      {decimalToHourMin(Number(member.hours) ?? 0)}
                    </TableCell>
                    <TableCell className="py-1">
                      {decimalToHourMin(Number(member.otherHours) ?? 0)}
                    </TableCell>
                    <TableCell className="py-1">
                      {member.travelAllowance ? member.travelAllowance : "-"}
                    </TableCell>
                    <TableCell className="py-1">
                      {user && user.role !== "viewer" && (
                        <div className="flex gap-2 items-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(member)}
                            style={{ padding: "2px 8px" }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDeleteDialog(member.id ?? 0)}
                            style={{ padding: "2px 8px" }}
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
                  colSpan={10}
                  className="text-center py-8 text-muted-foreground"
                >
                  No staff members found matching your search
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION + DROPDOWN */}
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

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              style={{ padding: "2px 14px" }}
            >
              {page}
            </Button>
          ))}

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
  );
}
