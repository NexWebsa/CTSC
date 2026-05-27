import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, User, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const checkRoleAndRedirect = async () => {
        const { data: adminRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (adminRole) { navigate("/admin"); return; }

        const { data: driverId, error: driverError } = await supabase.rpc("get_current_driver_id");
        if (driverError) console.error("Driver redirect check failed", driverError);
        navigate(driverId ? "/driver" : "/dashboard");
      };
      checkRoleAndRedirect();
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Login Failed", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      
      // Fetch user's profile to get their full name
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", currentUser.id)
          .maybeSingle();
        
        const displayName = profile?.full_name || "there";
        toast({ title: `Welcome back, ${displayName}! 👋`, description: "You have successfully signed in." });
      }
    } else {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account Created! 🎉", description: "Check your email to confirm your account." });
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-muted/40 flex items-center justify-center px-4">

      {/* Dot pattern background */}
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Soft accent glows */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(circle at top right, hsl(var(--accent) / 0.07) 0%, transparent 65%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(circle at bottom left, hsl(var(--accent) / 0.05) 0%, transparent 65%)" }}
      />

      {/* Form container */}
      <div className="relative z-10 w-full max-w-[400px]">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-7"
        >
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-white font-black text-sm leading-none">C</span>
            </div>
            <span className="font-bold text-foreground text-lg tracking-tight">
              Shuttle<span className="text-accent">CT</span>
            </span>
          </Link>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-6"
        >
          {/* Pill toggle */}
          <div className="inline-flex items-center p-1 rounded-full bg-muted border border-border mb-5">
            {["Sign In", "Sign Up"].map((label, i) => {
              const active = i === 0 ? isLogin : !isLogin;
              return (
                <button
                  key={label}
                  onClick={() => setIsLogin(i === 0)}
                  className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    active
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "li" : "su"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {isLogin ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                {isLogin
                  ? "Sign in to manage your bookings and rides."
                  : "Get started with premium Cape Town transport."}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
        >
          {/* Accent bar */}
          <div className="h-[3px] bg-gradient-to-r from-accent via-accent/50 to-transparent" />

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">

              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    key="fn"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="space-y-1.5 pb-0.5">
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
                        <Input
                          placeholder="John Doe"
                          className="h-10 pl-9 text-sm bg-muted/30 border-border/70 focus-visible:ring-accent/30 transition-colors"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="h-10 pl-9 text-sm bg-muted/30 border-border/70 focus-visible:ring-accent/30 transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-10 pl-9 pr-9 text-sm bg-muted/30 border-border/70 focus-visible:ring-accent/30 transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <Button
                variant="accent"
                size="lg"
                className="w-full h-10 gap-2 font-semibold text-sm mt-1"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Please wait...
                  </span>
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] text-muted-foreground">
                {isLogin ? "New here?" : "Have an account?"}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="w-full h-9 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted/60 active:scale-[0.99] transition-all duration-150"
            >
              {isLogin ? "Create a free account →" : "Sign in instead →"}
            </button>
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="flex items-center justify-center gap-4 mt-5 flex-wrap"
        >
          {["Secure & encrypted", "No spam, ever", "Free to join"].map((badge) => (
            <span key={badge} className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <ShieldCheck className="w-3 h-3 text-accent shrink-0" />
              {badge}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;