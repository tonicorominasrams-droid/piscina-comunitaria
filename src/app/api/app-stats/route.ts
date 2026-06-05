import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  try {
    const supabase = createServiceClient();

    const [
      { count: totalControls },
      { count: totalVeins },
      { data: primer },
    ] = await Promise.all([
      supabase.from("controls").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("controls")
        .select("measured_at")
        .order("measured_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

    let diesActiva = 0;
    if (primer?.measured_at) {
      const primerDia = new Date(primer.measured_at);
      const ara = new Date();
      diesActiva = Math.max(
        0,
        Math.floor((ara.getTime() - primerDia.getTime()) / (1000 * 60 * 60 * 24)),
      );
    }

    return NextResponse.json({
      totalControls: totalControls ?? 0,
      totalVeins: totalVeins ?? 0,
      diesActiva,
    });
  } catch {
    return NextResponse.json(
      { totalControls: 0, totalVeins: 0, diesActiva: 0 },
      { status: 500 },
    );
  }
}
