import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useDriverCheck } from "@/hooks/useDriverCheck";
import logo from "@/assets/ctscnav.png";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  {
    label: "Services",
    path: "/services",
    children: [
      { label: "Airport Transfers", path: "/services/airport-transfers" },
      { label: "Chauffeur Services", path: "/services/chauffeur" },
      { label: "Point-to-Point", path: "/services/point-to-point" },
      { label: "Employee Transportation", path: "/services/employee-transportation" },
      { label: "Staff Shuttle Service", path: "/services/staff-shuttle" },
    ],
  },
  { label: "Gallery", path: "/gallery" },
  { label: "Fleet", path: "/fleet" },
  { label: "Contact", path: "/contact" },
  { label: "Terms", path: "/terms"},
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { isDriver } = useDriverCheck();
  const navigate = useNavigate();

  // If logged in as user or driver, don't render this navbar at all
  // (AuthNavbar is used instead on their dashboards)
  // Admin uses AdminLayout so also skip here
  // But we still show public navbar on public pages even when logged in

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-4 left-4 right-4 z-50"
    >
      <nav className="container mx-auto flex items-center justify-between px-6 py-2.5 rounded-full bg-background/70 backdrop-blur-xl border border-border/50 shadow-lg shadow-black/5">
        {/* Mobile: auth left | Desktop: logo left */}
        <div className="lg:hidden flex items-center">
          {user ? (
            <div className="flex items-center gap-1">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="rounded-full text-xs font-medium">
                    Admin
                  </Button>
                </Link>
              )}
              {isDriver && (
                <Link to="/driver">
                  <Button variant="ghost" size="sm" className="rounded-full text-xs font-medium">
                    Dashboard
                  </Button>
                </Link>
              )}
              {!isDriver && !isAdmin && (
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="rounded-full text-xs font-medium">
                    Dashboard
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <Link to="/auth">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground/70 hover:text-foreground rounded-full"
              >
                <User className="w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>

        {/* Logo: always visible, centered on mobile */}
        <Link to="/" className="flex items-center gap-2 lg:order-first">
          <img src={logo} alt="CTSC Travel" className="h-12 w-auto" />
        </Link>

        <div className="hidden lg:flex items-center gap-0.5 bg-secondary/50 rounded-full px-1.5 py-1">
          {navLinks.map((link) =>
            link.children ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <Link
                  to={link.path!}
                  className={`flex items-center gap-1 px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                    location.pathname.startsWith("/services")
                      ? "bg-background text-foreground shadow-sm"
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {link.label}
                  <ChevronDown className="w-3 h-3" />
                </Link>
                <AnimatePresence>
                  {servicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-56 rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl p-2 shadow-xl"
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className="block px-4 py-2.5 text-sm text-foreground/70 hover:text-foreground hover:bg-secondary rounded-xl transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={link.path}
                to={link.path!}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                  location.pathname === link.path
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ),
          )}
        </div>

        {/* Desktop: right side buttons | Mobile: burger only */}
        <div className="flex items-center gap-2.5">
          <Link to="/book" className="hidden sm:block">
            <Button variant="accent" size="sm" className="rounded-full px-5">
              Book Now
            </Button>
          </Link>
          {/* Desktop auth buttons */}
          <div className="hidden lg:flex items-center gap-1.5">
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="rounded-full text-xs font-medium">
                      Admin
                    </Button>
                  </Link>
                )}
                {isDriver && (
                  <Link to="/driver">
                    <Button variant="ghost" size="sm" className="rounded-full text-xs font-medium">
                      Dashboard
                    </Button>
                  </Link>
                )}
                {!isDriver && !isAdmin && (
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="rounded-full text-xs font-medium">
                      Dashboard
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <Link to="/auth">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground/70 hover:text-foreground rounded-full"
                >
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            )}
          </div>
          <button
            className="lg:hidden text-foreground/70 hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden mt-2 mx-2 rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-xl"
          >
            <div className="p-4 space-y-1">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label}>
                    <div className="flex items-center">
                      <Link
                        to={link.path!}
                        onClick={() => setMobileOpen(false)}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-foreground/80 hover:text-foreground rounded-xl"
                      >
                        {link.label}
                      </Link>
                      <button
                        onClick={() => setServicesOpen(!servicesOpen)}
                        className="px-4 py-2.5 text-foreground/70 hover:text-foreground"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                    <AnimatePresence>
                      {servicesOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="ml-4 space-y-1 overflow-hidden"
                        >
                          {link.children.map((child) => (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={() => setMobileOpen(false)}
                              className="block px-4 py-2 text-sm text-foreground/60 hover:text-foreground rounded-xl"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path!}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-foreground/80 hover:text-foreground rounded-xl"
                  >
                    {link.label}
                  </Link>
                ),
              )}
              <div className="pt-2 space-y-2">
                <Link to="/book" onClick={() => setMobileOpen(false)}>
                  <Button variant="accent" className="w-full rounded-full">
                    Book Now
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
