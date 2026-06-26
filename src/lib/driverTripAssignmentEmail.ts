import { supabase } from "@/lib/supabase";

type FunctionErrorPayload = {
  error?: unknown;
  message?: unknown;
  detail?: unknown;
};

export type TripAssignmentEmailResult = {
  success?: boolean;
  status?: string;
  bookingId?: string;
  driverId?: string;
  to?: string;
  emailId?: string;
  error?: string;
  detail?: string;
  message?: string;
};

export type TripAssignmentEmailOutcome = {
  sent: boolean;
  result?: TripAssignmentEmailResult;
  error?: string;
};

export type TripAssignmentEmailsResult = {
  driver: TripAssignmentEmailOutcome;
  customer: TripAssignmentEmailOutcome;
};

const getFunctionErrorMessage = async (error: unknown, response?: Response) => {
  const fallback = error instanceof Error && error.message ? error.message : "Something went wrong";
  const context =
    typeof error === "object" && error !== null && "context" in error
      ? (error as { context?: Response }).context
      : undefined;
  const errorResponse = response || context;

  if (!errorResponse || typeof errorResponse.clone !== "function") return fallback;

  try {
    const body = (await errorResponse.clone().json()) as FunctionErrorPayload;
    const serverMessage = [body.error, body.message, body.detail].find(
      (value): value is string => typeof value === "string" && value.trim().length > 0
    );
    if (serverMessage) return serverMessage.trim();
  } catch {
    try {
      const text = await errorResponse.clone().text();
      if (text.trim()) return text.trim();
    } catch {
      return fallback;
    }
  }

  return fallback;
};

const invokeTripAssignmentEmail = async (
  functionName: "send-driver-trip-assignment" | "send-user-trip-assignment",
  bookingId: string,
  driverId: string
): Promise<TripAssignmentEmailResult> => {
  const { data, error, response } =
    await supabase.functions.invoke<TripAssignmentEmailResult>(
      functionName,
      {
        body: { bookingId, driverId },
      }
    );

  if (error) {
    throw new Error(await getFunctionErrorMessage(error, response));
  }

  if (data?.success === false || data?.error) {
    throw new Error(data.error || data.message || data.detail || "Driver trip email could not be sent");
  }

  return data ?? {};
};

const settleTripEmail = async (
  promise: Promise<TripAssignmentEmailResult>
): Promise<TripAssignmentEmailOutcome> => {
  try {
    return { sent: true, result: await promise };
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : "Trip assignment email could not be sent",
    };
  }
};

export const sendDriverTripAssignmentEmail = async (
  bookingId: string,
  driverId: string
): Promise<TripAssignmentEmailResult> =>
  invokeTripAssignmentEmail("send-driver-trip-assignment", bookingId, driverId);

export const sendUserTripAssignmentEmail = async (
  bookingId: string,
  driverId: string
): Promise<TripAssignmentEmailResult> =>
  invokeTripAssignmentEmail("send-user-trip-assignment", bookingId, driverId);

export const sendTripAssignmentEmails = async (
  bookingId: string,
  driverId: string
): Promise<TripAssignmentEmailsResult> => {
  const [driver, customer] = await Promise.all([
    settleTripEmail(sendDriverTripAssignmentEmail(bookingId, driverId)),
    settleTripEmail(sendUserTripAssignmentEmail(bookingId, driverId)),
  ]);

  return { driver, customer };
};
