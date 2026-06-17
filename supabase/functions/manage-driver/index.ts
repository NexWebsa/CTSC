import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type DriverRecord = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  license_number: string | null;
};

type RequestBody = {
  action?: unknown;
  driver_id?: unknown;
  email?: unknown;
  full_name?: unknown;
  phone?: unknown;
  license_number?: unknown;
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const asTrimmedString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const normalizeEmail = (value: unknown) => asTrimmedString(value).toLowerCase();

const findAuthUserByEmail = async (
  adminClient: ReturnType<typeof createClient>,
  email: string
) => {
  const target = email.toLowerCase();
  const perPage = 1000;
  let page = 1;

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);

    const users = data.users || [];
    const match = users.find((user) => user.email?.toLowerCase() === target);
    if (match) return match;

    if (users.length < perPage || page * perPage >= (data.total || 0)) return null;
    page += 1;
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Missing authorization" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: callerData } = await callerClient.auth.getUser();
    if (!callerData.user) return jsonResponse({ error: "Unauthorized" }, 401);

    const { data: adminRole } = await callerClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminRole) return jsonResponse({ error: "Admin access required" }, 403);

    const body = (await req.json()) as RequestBody;
    const action = asTrimmedString(body.action);
    const driverId = asTrimmedString(body.driver_id);

    if (!driverId) return jsonResponse({ error: "Driver ID is required" }, 400);
    if (action !== "update" && action !== "delete") {
      return jsonResponse({ error: "Unsupported driver action" }, 400);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: driverData, error: driverError } = await adminClient
      .from("drivers")
      .select("id, full_name, email, phone, license_number")
      .eq("id", driverId)
      .maybeSingle();

    if (driverError) return jsonResponse({ error: driverError.message }, 500);
    if (!driverData) return jsonResponse({ error: "Driver not found" }, 404);

    const driver = driverData as DriverRecord;
    const existingEmail = (driver.email || "").trim().toLowerCase();

    if (action === "delete") {
      const authUser = existingEmail ? await findAuthUserByEmail(adminClient, existingEmail) : null;

      const { error: bookingUpdateError } = await adminClient
        .from("bookings")
        .update({ driver_id: null, updated_at: new Date().toISOString() })
        .eq("driver_id", driverId);
      if (bookingUpdateError) return jsonResponse({ error: bookingUpdateError.message }, 500);

      const { error: ratingUpdateError } = await adminClient
        .from("booking_ratings")
        .update({ driver_id: null })
        .eq("driver_id", driverId);
      if (ratingUpdateError) return jsonResponse({ error: ratingUpdateError.message }, 500);

      const { error: deleteDriverError } = await adminClient
        .from("drivers")
        .delete()
        .eq("id", driverId);
      if (deleteDriverError) return jsonResponse({ error: deleteDriverError.message }, 500);

      if (authUser) {
        const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(authUser.id);
        if (deleteUserError) {
          return jsonResponse({
            error: `Driver row was deleted, but the login account could not be removed: ${deleteUserError.message}`,
          }, 500);
        }
      }

      return jsonResponse({ success: true });
    }

    const fullName = asTrimmedString(body.full_name);
    const email = normalizeEmail(body.email);
    const phone = asTrimmedString(body.phone);
    const licenseNumber = asTrimmedString(body.license_number);

    if (!fullName) return jsonResponse({ error: "Full name is required" }, 400);
    if (!email) return jsonResponse({ error: "Email is required" }, 400);

    const authUser = existingEmail ? await findAuthUserByEmail(adminClient, existingEmail) : null;
    if (!authUser) {
      return jsonResponse({
        error: "Could not find this driver's login account. The driver email was not changed.",
      }, 400);
    }

    const { error: updateUserError } = await adminClient.auth.admin.updateUserById(authUser.id, {
      email,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (updateUserError) return jsonResponse({ error: updateUserError.message }, 400);

    const { error: profileError } = await adminClient
      .from("profiles")
      .update({ full_name: fullName, phone: phone || null })
      .eq("id", authUser.id);
    if (profileError) return jsonResponse({ error: profileError.message }, 500);

    const { error: updateDriverError } = await adminClient
      .from("drivers")
      .update({
        full_name: fullName,
        email,
        phone: phone || null,
        license_number: licenseNumber || null,
      })
      .eq("id", driverId);
    if (updateDriverError) return jsonResponse({ error: updateDriverError.message }, 500);

    return jsonResponse({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 500);
  }
});
