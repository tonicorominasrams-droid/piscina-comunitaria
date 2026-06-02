import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FormulariControl from "./FormulariControl";

export default async function NouControlPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Només els administradors poden accedir a aquesta pàgina.
  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nou control</h1>
        <p className="text-sm text-slate-500">
          Registra els valors de pH, clor i aspiració de la piscina.
        </p>
      </div>
      <FormulariControl />
    </div>
  );
}
