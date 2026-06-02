import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Desa (o actualitza) la subscripció push de l'usuari autenticat.
 * El cos és l'objecte PushSubscription serialitzat del navegador.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticat." }, { status: 401 });
  }

  let cos: unknown;
  try {
    cos = await request.json();
  } catch {
    return NextResponse.json({ error: "Cos no vàlid." }, { status: 400 });
  }

  const sub = cos as {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };

  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return NextResponse.json(
      { error: "Falten dades de la subscripció." },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
    { onConflict: "endpoint" },
  );

  if (error) {
    return NextResponse.json(
      { error: "No s'ha pogut desar la subscripció." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

/** Elimina la subscripció push (quan l'usuari les desactiva). */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticat." }, { status: 401 });
  }

  let cos: unknown;
  try {
    cos = await request.json();
  } catch {
    return NextResponse.json({ error: "Cos no vàlid." }, { status: 400 });
  }

  const endpoint = (cos as { endpoint?: string })?.endpoint;
  if (!endpoint) {
    return NextResponse.json({ error: "Falta l'endpoint." }, { status: 400 });
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);

  if (error) {
    return NextResponse.json(
      { error: "No s'ha pogut eliminar la subscripció." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
