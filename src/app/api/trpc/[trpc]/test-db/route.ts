// app/api/test-db/route.ts
import { NextResponse } from "next/server";
import { testDbConnection } from "@/lib/testDb";

export async function GET() {
  const result = await testDbConnection();
  return NextResponse.json(result);
}
