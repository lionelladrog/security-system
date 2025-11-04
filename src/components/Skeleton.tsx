export function StaffTableSkeleton({ rows = 5 }) {
  return (
    <div className="w-full  rounded-md overflow-hidden">
      {/* Header */}
      {/* <div className="grid grid-cols-9 gap-4  p-3 font-semibold">
        <div>Employee ID</div>
        <div>Name</div>
        <div>Site</div>
        <div>Status</div>
        <div>Check In</div>
        <div>Check Out</div>
        <div>Hours</div>
        <div>Travel (Rs)</div>
        <div>Actions</div>
      </div> */}

      {/* Body */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="grid grid-cols-9 gap-4 items-center p-3 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded col-span-1"></div>
            <div className="h-4 bg-gray-200 rounded col-span-1"></div>
            <div className="h-4 bg-gray-200 rounded col-span-1"></div>
            <div className="h-4 bg-gray-200 rounded col-span-1"></div>
            <div className="h-4 bg-gray-200 rounded col-span-1"></div>
            <div className="h-4 bg-gray-200 rounded col-span-1"></div>
            <div className="h-4 bg-gray-200 rounded col-span-1"></div>
            <div className="h-4 bg-gray-200 rounded col-span-1"></div>
            <div className="flex gap-2">
              <div className="h-4 w-6 bg-gray-200 rounded"></div>
              <div className="h-4 w-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}

        {/* Empty state placeholder */}
        {rows === 0 && (
          <div className="p-8 text-center text-gray-400">
            No staff members found
          </div>
        )}
      </div>
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
            <div key={colIdx} className="h-4 bg-gray-200 rounded w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}
