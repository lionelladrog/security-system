"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function TestDbPage() {
  const [loading, setLoading] = useState(false);
  const dbTester = trpc.auth.testDB.useQuery(undefined, {
    enabled: false, // on trigger manuellement
  });
  console.log(dbTester.data);

  const handleTest = async () => {
    setLoading(true);
    await dbTester.refetch();
    console.log(dbTester.data);

    if (dbTester.data?.success) {
      alert("DB connection successful!");
    } else {
      alert("DB connection failed: " + dbTester.data);
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <button
        onClick={handleTest}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
        disabled={loading}
      >
        {loading ? "Testing..." : "Test DB Connection"}
      </button>
    </div>
  );
}
