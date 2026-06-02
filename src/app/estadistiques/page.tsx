import { createClient } from "@/lib/supabase/server";
import EstadistiquesClient, {
  type ControlEstadistica,
} from "./EstadistiquesClient";

export default async function EstadistiquesPage() {
  const supabase = await createClient();

  const { data: controls } = await supabase
    .from("controls")
    .select(
      "measured_at, ph, clor, aspiracio, pastilles_skimmer, ph_corregit, clor_afegit, aigua_omplerta, estat_depuradora, fora_de_rang",
    )
    .order("measured_at", { ascending: true })
    .limit(2000);

  const dades = (controls ?? []) as ControlEstadistica[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Estadístiques</h1>
        <p className="text-sm text-slate-500">
          Evolució dels paràmetres i resum de les accions de manteniment.
        </p>
      </div>

      <EstadistiquesClient dades={dades} />
    </div>
  );
}
