"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

export default function TestDbPage() {
  const [loading, setLoading] = useState(false);

  const dbTester = trpc.auth.testDB.useQuery(undefined, {
    enabled: false, // n'exécute pas automatiquement
  });

  const handleTest = () => {
    setLoading(true);
    dbTester.refetch();
  };

  // On écoute les changements de data
  useEffect(() => {
    if (!dbTester.data) return;
    console.log(dbTester.data);

    if (dbTester.data.success) {
      alert("✅ Connexion DB réussie !");
    } else {
      alert("❌ Erreur connexion DB: " + dbTester.data);
    }
    setLoading(false);
  }, [dbTester.data]);

  // On peut aussi gérer l'erreur globale
  useEffect(() => {
    if (dbTester.error) {
      alert("❌ Erreur inconnue: " + dbTester.error.message);
      setLoading(false);
    }
  }, [dbTester.error]);

  return (
    <div className="p-4">
      <button
        onClick={handleTest}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
        disabled={loading}
      >
        {loading ? "Testing..." : "Tester la connexion DB"}
      </button>
    </div>
  );
}
