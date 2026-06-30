import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface EventRecord {
  id: string;
  titulo: string | null;
  ait_nombre_servicio: string | null;
  nombre_perfil: string | null;
  push_notification: string | null;
}

interface MaintenanceLogRecord {
  id: string;
  tag_code: string | null;
  descripcion: string | null;
  nombre_perfil: string | null;
  aprobacion_requerida: boolean | null;
  aprobador_email: string | null;
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const table = payload.table ?? payload.type ?? "events";
    const record = (payload.record ?? payload) as
      | EventRecord
      | MaintenanceLogRecord;

    if (!record?.id) {
      return new Response(JSON.stringify({ error: "Missing record" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const tokens: string[] = [];

    if (table === "maintenance_logs" || "aprobacion_requerida" in record) {
      const log = record as MaintenanceLogRecord;
      if (!log.aprobacion_requerida) {
        return new Response(JSON.stringify({ sent: 0, skipped: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (log.aprobador_email) {
        const { data: approver } = await supabase
          .from("profiles")
          .select("expo_push_token")
          .eq("email", log.aprobador_email)
          .maybeSingle();
        if (approver?.expo_push_token) {
          tokens.push(approver.expo_push_token);
        }
      }

      const mensaje = `Aprobación requerida: ${log.tag_code ?? ""} — ${log.descripcion ?? ""}`;
      const usuario = log.nombre_perfil ?? "MineTrack";

      if (tokens.length === 0) {
        return new Response(JSON.stringify({ sent: 0 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: tokens,
          title: usuario,
          body: mensaje,
          sound: "default",
        }),
      });

      const result = await response.json();
      return new Response(JSON.stringify({ sent: tokens.length, result }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const event = record as EventRecord;
    const { data: profiles } = await supabase
      .from("profiles")
      .select("expo_push_token")
      .not("expo_push_token", "is", null);

    (profiles ?? []).forEach((p) => {
      if (p.expo_push_token) tokens.push(p.expo_push_token);
    });

    if (event.push_notification && !tokens.includes(event.push_notification)) {
      tokens.push(event.push_notification);
    }

    if (tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const mensaje = `${event.ait_nombre_servicio ?? ""} - ${event.titulo ?? ""}`;
    const usuario = event.nombre_perfil ?? "MineTrack";

    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: tokens,
        title: usuario,
        body: mensaje,
        sound: "default",
      }),
    });

    const result = await response.json();

    return new Response(JSON.stringify({ sent: tokens.length, result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("on-event-created error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
