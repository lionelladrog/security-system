"use client";

import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";

export default function TestDbPage() {
  const [loading, setLoading] = useState(false);

  const dbTester = trpc.auth.testDB.useQuery(undefined, {
    enabled: false,
  });

  useEffect(() => {
    if (loading) {
      if (dbTester.data) {
        if (dbTester.data.success) {
          alert("DB connection successful!");
        } else {
          alert("DB connection failed: " + dbTester.data);
        }
        setLoading(false);
      } else if (dbTester.error) {
        alert("Error during DB test: " + dbTester.error.message);
        setLoading(false);
      }
    }
  }, [dbTester.data, dbTester.error, loading]);

  const handleTest = () => {
    setLoading(true);
    dbTester.refetch();
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
