import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export const useDriverCheck = () => {
  const { user, loading: authLoading } = useAuth();
  const [driverId, setDriverId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setDriverId(null);
      setLoading(false);
      return;
    }

    const check = async () => {
      const { data, error } = await supabase.rpc("get_current_driver_id");

      if (error) {
        console.error("Driver check failed", error);
        setDriverId(null);
      } else {
        setDriverId(data ?? null);
      }

      setLoading(false);
    };

    check();
  }, [user, authLoading]);

  return { isDriver: !!driverId, driverId, loading: loading || authLoading };
};
