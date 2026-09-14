import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = [
  "https://attendance-tracker-phi-inky.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const isAllowed = allowedOrigins.includes(origin) || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "https://attendance-tracker-phi-inky.vercel.app",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
    const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "";
    const appUrl = Deno.env.get("APP_URL") || "https://attendance-tracker-phi-inky.vercel.app/";

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Server misconfiguration: missing Supabase credentials." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!resendApiKey || !resendFromEmail) {
      return new Response(
        JSON.stringify({
          error: "Server misconfiguration: RESEND_API_KEY or RESEND_FROM_EMAIL secret is not configured.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Client to authenticate requesting user's Bearer JWT
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();

    if (userError || !user || !user.email) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid authentication token or missing user email." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!user.email_confirmed_at) {
      return new Response(
        JSON.stringify({ success: true, skipped: "unverified_email", message: "User email is not confirmed." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let body: any = {};
    try { body = await req.json(); } catch (e) {}

    const subjectId = body.subject_id || body.subjectId;
    if (!subjectId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: subject_id." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: profileData } = await adminClient
      .from("profiles")
      .select("full_name, email_alerts_enabled")
      .eq("id", user.id)
      .maybeSingle();

    if (profileData && profileData.email_alerts_enabled === false) {
      return new Response(
        JSON.stringify({ success: true, skipped: "alerts_disabled", message: "Student disabled email alerts." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const studentName = profileData?.full_name || "Student";

    const { data: subjectData } = await adminClient
      .from("subjects")
      .select("name, code")
      .eq("id", subjectId)
      .maybeSingle();

    const subjectName = subjectData?.name || "Subject";
    const subjectCode = subjectData?.code || "";

    const { data: logsData, error: logsErr } = await adminClient
      .from("attendance_logs")
      .select("status")
      .eq("student_id", user.id)
      .eq("subject_id", subjectId);

    if (logsErr) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch attendance logs: ${logsErr.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const logs = logsData || [];
    let presentCount = 0;
    let absentCount = 0;

    for (const l of logs) {
      if (l.status === "PRESENT") presentCount++;
      else if (l.status === "ABSENT") absentCount++;
    }

    const conductedCount = presentCount + absentCount;
    const percentage = conductedCount > 0 ? (presentCount / conductedCount) * 100 : 100;
    const formattedPercentage = Number(percentage.toFixed(1));

    const { data: claimData, error: claimErr } = await adminClient.rpc("claim_attendance_alert", {
      p_student_id: user.id,
      p_subject_id: subjectId,
      p_current_percentage: formattedPercentage,
    });

    if (claimErr) {
      return new Response(
        JSON.stringify({ error: `Atomic alert claim failed: ${claimErr.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const claimResult = claimData && claimData.length > 0 ? claimData[0] : null;
    const shouldAlert = Boolean(claimResult?.should_alert);
    const reason = claimResult?.reason || "NO_ALERT_REQUIRED";

    if (!shouldAlert) {
      return new Response(
        JSON.stringify({
          success: true,
          alerted: false,
          reason: reason,
          percentage: formattedPercentage,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailSubject = `Attendance Warning: ${subjectName}`;
    const htmlBody = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #dc2626; margin: 0; font-size: 22px;">⚠️ Low Attendance Warning</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Attendance Tracker Alert System</p>
        </div>
        <p style="font-size: 15px; color: #1e293b;">Hello <strong>${studentName}</strong>,</p>
        <p style="font-size: 14px; color: #334155; line-height: 1.6;">
          Your attendance in <strong>${subjectName}</strong> (${subjectCode}) has fallen below the mandatory <strong>75%</strong> threshold.
        </p>
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px; margin: 20px 0; text-align: center;">
          <div style="font-size: 13px; color: #991b1b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Current Subject Attendance</div>
          <div style="font-size: 32px; font-weight: 800; color: #dc2626; margin: 6px 0;">${formattedPercentage}%</div>
          <div style="font-size: 13px; color: #7f1d1d;">
            Attended: <strong>${presentCount}</strong> / <strong>${conductedCount}</strong> conducted lectures
          </div>
        </div>
        <p style="font-size: 14px; color: #334155; line-height: 1.6;">
          Please attend your upcoming classes to recover your attendance percentage above 75%.
        </p>
        <div style="text-align: center; margin-top: 28px;">
          <a href="${appUrl}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
            View Attendance Dashboard
          </a>
        </div>
      </div>
    `;

    const textBody = `Hello ${studentName},\n\nYour attendance in ${subjectName} (${subjectCode}) has fallen below 75%.\nCurrent Attendance: ${formattedPercentage}% (${presentCount}/${conductedCount} lectures).\n\nPlease attend upcoming classes to recover your attendance.\nView Dashboard: ${appUrl}`;

    let resendResponse: Response;
    try {
      resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: resendFromEmail,
          to: [user.email],
          subject: emailSubject,
          html: htmlBody,
          text: textBody,
        }),
      });
    } catch (netErr: any) {
      console.error("Resend API Network Exception (uncertain delivery status):", netErr);
      // Uncertain network drop: Keep state as CLAIMED with claimed_at timestamp so 10-min backoff prevents duplicate spam
      return new Response(
        JSON.stringify({
          error: "Network exception communicating with Resend API. State remains claimed to prevent duplicate email spam.",
          details: netErr.message || String(netErr),
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendResult = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API HTTP Error:", resendResponse.status, resendResult);

      // Explicit 4xx client errors (e.g. invalid recipient, domain error): email was NOT sent
      if (resendResponse.status >= 400 && resendResponse.status < 500) {
        await adminClient.rpc("rollback_attendance_alert_claim", {
          p_student_id: user.id,
          p_subject_id: subjectId,
        });
      }
      // 5xx server errors: uncertain delivery state, leave state as CLAIMED until 10-minute timeout window expires

      return new Response(
        JSON.stringify({
          error: `Resend API Error (Status ${resendResponse.status})`,
          details: resendResult,
        }),
        { status: resendResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Confirm alert state to BELOW_THRESHOLD on Resend API HTTP 2xx success
    await adminClient.rpc("confirm_attendance_alert_sent", {
      p_student_id: user.id,
      p_subject_id: subjectId,
    });

    return new Response(
      JSON.stringify({
        success: true,
        alerted: true,
        messageId: resendResult.id,
        percentage: formattedPercentage,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Unexpected Edge Function Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
