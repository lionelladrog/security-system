// app/test-db/page.tsx
"use client";

import { useState } from "react";

export default function TestDbPage() {
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/test-db");
      const data = await res.json();

      if (data.success) {
        alert("✅ Connexion DB réussie !");
      } else {
        alert("❌ Erreur connexion DB: " + data.error);
        console.log("error:", data.err);
      }
    } catch (err) {
      alert("❌ Erreur inconnue verifier vos paremetre: " + err);
    } finally {
      setLoading(false);
    }
  };

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
