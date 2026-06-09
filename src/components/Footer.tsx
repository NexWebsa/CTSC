import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";
import logo from "@/assets/footer-logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative overflow-hidden"
      style={{ backgroundColor: "#0A0A08", color: "rgba(255,255,255,0.55)" }}
    >
      {/* Grid overlay — matches Hero exactly */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #F2A51F 30%, #F2A51F 70%, transparent 100%)",
          opacity: 0.35,
        }}
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Main grid ── */}
        <div className="pt-16 pb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.8fr_1fr_1fr_1.4fr] gap-10 lg:gap-12">

          {/* Brand column */}
          <div>
            <img src={logo} alt="CTSC Travel" className="h-11 w-auto mb-5 opacity-90" />
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "rgba(255,255,255,0.38)", fontFamily: "'DM Sans', sans-serif" }}
            >
              Premium shuttle and transport services across the Cape Town area.
              Punctual. Discreet. Effortless.
            </p>

            {/* CTA */}
            <Link to="/book">
              <button
                className="group relative flex items-center gap-2 px-5 py-2.5 text-xs overflow-hidden transition-all duration-300"
                style={{
                  backgroundColor: "#F2A51F",
                  color: "#0A0A08",
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                <span className="relative z-10">Reserve Now</span>
                <ArrowUpRight
                  className="w-3.5 h-3.5 relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
                <span
                  className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                />
              </button>
            </Link>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-xs mb-5"
              style={{
                color: "#F2A51F",
                fontFamily: "'DM Mono', monospace",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Home", path: "/" },
                { label: "About", path: "/about" },
                { label: "Fleet", path: "/fleet" },
                { label: "Book Now", path: "/book" },
                { label: "Terms & Conditions", path: "/terms" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-1.5 text-sm transition-colors duration-200"
                    style={{ color: "rgba(255,255,255,0.42)", fontFamily: "'DM Sans', sans-serif" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#F2A51F")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.42)")}
                  >
                    <span
                      className="inline-block w-0 group-hover:w-3 transition-all duration-200 h-px"
                      style={{ backgroundColor: "#F2A51F" }}
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4
              className="text-xs mb-5"
              style={{
                color: "#F2A51F",
                fontFamily: "'DM Mono', monospace",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Services
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Airport Transfers", path: "/services/airport-transfers" },
                { label: "Chauffeur Services", path: "/services/chauffeur" },
                { label: "Point-to-Point", path: "/services/point-to-point" },
                { label: "Employee Transport", path: "/services/employee-transportation" },
                { label: "Staff Shuttle", path: "/services/staff-shuttle" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-1.5 text-sm transition-colors duration-200"
                    style={{ color: "rgba(255,255,255,0.42)", fontFamily: "'DM Sans', sans-serif" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#F2A51F")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.42)")}
                  >
                    <span
                      className="inline-block w-0 group-hover:w-3 transition-all duration-200 h-px"
                      style={{ backgroundColor: "#F2A51F" }}
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-xs mb-5"
              style={{
                color: "#F2A51F",
                fontFamily: "'DM Mono', monospace",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Contact
            </h4>
            <ul className="space-y-3.5">
              {[
                { icon: Phone, text: "083 766 8601" },
                { icon: Mail, text: "info@ctsctravel.com" },
              ].map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-3 text-sm"
                  style={{ color: "rgba(255,255,255,0.42)", fontFamily: "'DM Sans', sans-serif" }}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: "#F2A51F" }} />
                  {text}
                </li>
              ))}
              <li
                className="flex items-start gap-3 text-sm"
                style={{ color: "rgba(255,255,255,0.42)", fontFamily: "'DM Sans', sans-serif" }}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#F2A51F" }} />
                DF Malan Street, Parow North, Cape Town, 7500
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <span
            className="text-xs"
            style={{
              color: "rgba(255,255,255,0.25)",
              fontFamily: "'DM Mono', monospace",
              letterSpacing: "0.08em",
            }}
          >
            © {currentYear} Shuttle Cape Town. Powered by <a href="https://nexwebsa.co.za/" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.25)"}} >NexWeb</a>. All rights reserved.
          </span>

          {/* Socials */}
          <div className="flex items-center gap-1">
            {[
              {
                href: "https://www.instagram.com/ctsctravelcpt?igsh=MW45NjF6ZDJmOGIxeA==",
                label: "Instagram",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none"/>
                  </svg>
                ),
              },
              {
                href: "https://www.facebook.com/shuttlecapetown/",
                label: "Facebook",
                icon: (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                ),
              },
            ].map(({ href, label, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex items-center justify-center w-8 h-8 rounded-sm transition-all duration-200"
                style={{ color: "rgba(255,255,255,0.3)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "#F2A51F";
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(242,165,31,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.3)";
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
                }}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Load same fonts as Hero */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500;600&display=swap');
      `}</style>
    </footer>
  );
};

export default Footer;