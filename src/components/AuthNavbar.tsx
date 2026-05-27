import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, ChevronDown, Car, Camera, Loader2, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/storage";
import logo from "@/assets/ctsc.png";

interface AuthNavbarProps {
  role: "user" | "driver";
}

const AuthNavbar = ({ role }: AuthNavbarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  useEffect(() => {
    if (!user) return;
    const loadAvatar = async () => {
      if (role === "driver") {
        // Use RPC to get driver ID (matched by email), then load avatar
        const { data: driverId } = await supabase.rpc("get_current_driver_id");
        if (driverId) {
          const { data } = await supabase
            .from("drivers")
            .select("avatar_url")
            .eq("id", driverId)
            .single();
          if (data?.avatar_url) setAvatarUrl(data.avatar_url);
        }
      } else {
        const { data } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).single();
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
      }
    };
    loadAvatar();
  }, [user, role]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      if (role === "driver") {
        const path = `${user.id}/driver-avatar.${ext}`;
        const publicUrl = await uploadImage(file, "driver-photos", path, { cacheControl: "3600", upsert: true });
        const { data: driverId } = await supabase.rpc("get_current_driver_id");
        if (driverId) {
          await supabase.from("drivers").update({ avatar_url: publicUrl }).eq("id", driverId);
        }
        setAvatarUrl(publicUrl + "?t=" + Date.now());
      } else {
        const path = `${user.id}/avatar.${ext}`;
        const publicUrl = await uploadImage(file, "user-photos", path, { cacheControl: "3600", upsert: true });
        await supabase.from("profiles").update({ avatar_url: publicUrl, updated_at: new Date().toISOString() }).eq("id", user.id);
        setAvatarUrl(publicUrl + "?t=" + Date.now());
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="CTSC Travel" className="h-10 w-auto" />
        </Link>

        <div className="flex items-center gap-3">
          {role === "user" && (
            <Link to="/book">
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors">
                <Car className="w-4 h-4" />
                Book Now
              </button>
            </Link>
          )}

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-secondary/80 transition-colors"
            >
              <Avatar className="h-8 w-8">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                <AvatarFallback className="bg-accent/10 text-accent text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
                {displayName}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                  <div className="relative group shrink-0">
                    <Avatar className="h-10 w-10">
                      {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                      <AvatarFallback className="bg-accent/10 text-accent text-sm font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="p-1.5">
                  <Link
                    to={role === "driver" ? "/driver" : "/dashboard"}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    <Car className="w-4 h-4" />
                    Dashboard
                  </Link>
                  {role === "user" && (
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile Settings
                    </Link>
                  )}
                  {role === "driver" && (
                    <Link
                      to="/driver/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                  )}
                  <Link
                    to="/"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    Back to Site
                  </Link>
                  {role === "user" && (
                    <Link
                      to="/book"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors sm:hidden"
                    >
                      <Car className="w-4 h-4" />
                      Book Now
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AuthNavbar;
