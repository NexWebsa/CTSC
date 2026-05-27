import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

const PaymentTrustStrip = () => {
  const paymentMethods = [
    {
      name: "Visa",
      svg: (
        <svg viewBox="0 0 48 48" fill="none" className="h-9 w-auto drop-shadow-sm">
          <rect width="48" height="48" rx="7" fill="#1A1F71" />
          <path d="M20.3 30.2H17.4L19.2 17.9H22.1L20.3 30.2Z" fill="white" />
          <path d="M30.6 18.2C30 17.9 29.1 17.6 28 17.6C25.1 17.6 23 19.1 23 21.3C23 22.9 24.5 23.8 25.6 24.3C26.7 24.8 27.1 25.2 27.1 25.7C27.1 26.4 26.2 26.8 25.4 26.8C24.2 26.8 23.6 26.6 22.6 26.1L22.2 25.9L21.8 28.6C22.5 28.9 23.8 29.2 25.2 29.2C28.3 29.2 30.3 27.7 30.3 25.3C30.3 24 29.5 23 27.8 22.2C26.8 21.7 26.2 21.4 26.2 20.8C26.2 20.3 26.8 19.8 28 19.8C29.1 19.8 29.8 20 30.4 20.3L30.7 20.4L31.1 17.8L30.6 18.2Z" fill="white" />
          <path d="M34.2 25.5C34.4 24.8 35.4 21.9 35.4 21.9C35.4 21.9 35.7 21.2 35.8 20.8L36 21.8C36 21.8 36.6 24.6 36.7 25.5H34.2ZM38 17.9H35.8C35.1 17.9 34.6 18.1 34.3 18.8L29.9 30.2H33L33.6 28.4H37.3L37.6 30.2H40.4L38 17.9Z" fill="white" />
          <path d="M16.5 17.9L13.6 26.1L13.3 24.5C12.7 22.6 10.9 20.5 8.9 19.4L11.5 30.2H14.7L19.7 17.9H16.5Z" fill="white" />
          <path d="M10.6 17.9H5.6L5.5 18.2C9.4 19.2 11.9 21.5 12.9 24.3L11.8 18.9C11.6 18.1 11.2 17.9 10.6 17.9Z" fill="#FAA61A" />
        </svg>
      ),
    },
    {
      name: "Google Pay",
      svg: (
        <svg viewBox="0 0 48 48" fill="none" className="h-9 w-auto drop-shadow-sm">
          <rect width="48" height="48" rx="7" fill="white" />
          <defs>
            <linearGradient id="gpg2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4285F4" />
              <stop offset="33%" stopColor="#EA4335" />
              <stop offset="66%" stopColor="#FBBC05" />
              <stop offset="100%" stopColor="#34A853" />
            </linearGradient>
          </defs>
          <text x="13" y="30" fontFamily="Google Sans, Arial, sans-serif" fontSize="13" fontWeight="700" fill="url(#gpg2)">G</text>
          <text x="22" y="30" fontFamily="Google Sans, Arial, sans-serif" fontSize="12" fontWeight="500" fill="#3C4043">Pay</text>
        </svg>
      ),
    },
    {
      name: "Yoco",
      svg: (
        <svg viewBox="0 0 48 48" fill="none" className="h-9 w-auto drop-shadow-sm">
          <rect width="48" height="48" rx="7" fill="#0CA4EB" />
          <path d="M8 14L15.5 23.5V30H17.5V23.5L25 14H22.5L12.7 22.5L10.5 14H8Z" fill="white" />
          <path d="M27 14C24.2 14 22 16.7 22 20.5C22 24.3 24.2 27 27 27C29.8 27 32 24.3 32 20.5C32 16.7 29.8 14 27 14ZM27 24.8C25.6 24.8 24.2 23 24.2 20.5C24.2 18 25.6 16.2 27 16.2C28.4 16.2 29.8 18 29.8 20.5C29.8 23 28.4 24.8 27 24.8Z" fill="white" />
          <path d="M37 14C34.2 14 32 16.7 32 20.5C32 24.3 34.2 27 37 27C39.8 27 42 24.3 42 20.5C42 16.7 39.8 14 37 14ZM37 24.8C35.6 24.8 34.2 23 34.2 20.5C34.2 18 35.6 16.2 37 16.2C38.4 16.2 39.8 18 39.8 20.5C39.8 23 38.4 24.8 37 24.8Z" fill="white" />
        </svg>
      ),
    },
    {
      name: "Mastercard",
      svg: (
        <svg viewBox="0 0 48 48" fill="none" className="h-9 w-auto drop-shadow-sm">
          <rect width="48" height="48" rx="7" fill="#252525" />
          <circle cx="19" cy="24" r="9" fill="#EB001B" />
          <circle cx="29" cy="24" r="9" fill="#F79E1B" />
          <path d="M24 16.8C25.9 18.2 27.2 20.5 27.2 24C27.2 27.5 25.9 29.8 24 31.2C22.1 29.8 20.8 27.5 20.8 24C20.8 20.5 22.1 18.2 24 16.8Z" fill="#FF5F00" />
        </svg>
      ),
    },
    {
      name: "SSL Secure",
      svg: (
        <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5">
          <ShieldCheck className="w-4 h-4 text-white" strokeWidth={2} />
          <span className="text-white text-xs font-semibold tracking-wide whitespace-nowrap">SSL Secure</span>
        </div>
      ),
      isText: true,
    },
  ];

  const allMethods = [...paymentMethods, ...paymentMethods, ...paymentMethods];

  return (
    <section className="relative w-full overflow-hidden bg-[#fcae27] border-y border-black/5 py-0">

      {/* Top label strip */}
      <div className="relative w-full overflow-hidden py-2.5 bg-black/8 border-b border-black/5">
        <p className="text-center text-[10px] font-bold tracking-[0.25em] uppercase text-white/70">
          Secure &amp; Trusted Payment Methods
        </p>
      </div>

      {/* Scrolling strip */}
      <div className="relative py-5">
        {/* Edge fades */}
        <div className="pointer-events-none absolute left-0 inset-y-0 z-10 w-20 sm:w-32 bg-gradient-to-r from-[#fcae27] to-transparent" />
        <div className="pointer-events-none absolute right-0 inset-y-0 z-10 w-20 sm:w-32 bg-gradient-to-l from-[#fcae27] to-transparent" />

        <motion.div
          className="flex items-center gap-8 sm:gap-12"
          animate={{ x: ["0%", "-33.333%"] }}
          transition={{ x: { repeat: Infinity, repeatType: "loop", duration: 22, ease: "linear" } }}
        >
          {allMethods.map((method, i) => (
            <div
              key={`${method.name}-${i}`}
              className="flex items-center gap-3 shrink-0"
            >
              {method.svg}
              {!method.isText && (
                <span className="text-white/60 text-[11px] font-semibold tracking-widest uppercase hidden sm:inline whitespace-nowrap">
                  {method.name}
                </span>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PaymentTrustStrip;