import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createServiceClient();

    const [controlsResult, veinsResult, primerResult] = await Promise.all([
      supabase.from("controls").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("controls")
        .select("measured_at")
        .order("measured_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

    console.log("[app-stats] controls:", {
      count: controlsResult.count,
      error: controlsResult.error,
    });
    console.log("[app-stats] profiles:", {
      count: veinsResult.count,
      error: veinsResult.error,
    });
    console.log("[app-stats] primer control:", {
      data: primerResult.data,
      error: primerResult.error,
    });

    if (controlsResult.error || veinsResult.error) {
      console.error("[app-stats] error controls:", controlsResult.error);
      console.error("[app-stats] error profiles:", veinsResult.error);
      return NextResponse.json(
        { totalControls: 0, totalVeins: 0, diesActiva: 0 },
        { status: 500 },
      );
    }

    // If count is null (HEAD request didn't return count), fallback to a data query
    let totalControls = controlsResult.count;
    let totalVeins = veinsResult.count;

    if (totalControls === null) {
      console.log("[app-stats] controls count null, fallback query");
      const fallback = await supabase
        .from("controls")
        .select("id", { count: "exact" });
      console.log("[app-stats] controls fallback:", {
        count: fallback.count,
        error: fallback.error,
      });
      totalControls = fallback.count;
    }

    if (totalVeins === null) {
      console.log("[app-stats] profiles count null, fallback query");
      const fallback = await supabase
        .from("profiles")
        .select("id", { count: "exact" });
      console.log("[app-stats] profiles fallback:", {
        count: fallback.count,
        error: fallback.error,
      });
      totalVeins = fallback.count;
    }

    let diesActiva = 0;
    if (primerResult.data?.measured_at) {
      const primerDia = new Date(primerResult.data.measured_at);
      const ara = new Date();
      diesActiva = Math.max(
        0,
        Math.floor((ara.getTime() - primerDia.getTime()) / (1000 * 60 * 60 * 24)),
      );
    }

    const response = {
      totalControls: totalControls ?? 0,
      totalVeins: totalVeins ?? 0,
      diesActiva,
    };
    console.log("[app-stats] response:", response);

    return NextResponse.json(response);
  } catch (err) {
    console.error("[app-stats] exception:", err);
    return NextResponse.json(
      { totalControls: 0, totalVeins: 0, diesActiva: 0 },
      { status: 500 },
    );
  }
}
