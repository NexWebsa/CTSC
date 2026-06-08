import { motion } from "framer-motion";

const icons: { [key: string]: string } = {
  "Bookings, Confirmations and Costs": "💳",
  "Cancellations and Refunds": "↩️",
  "No-shows and Punctuality": "⏱️",
  "Luggage": "🧳",
  "Health and Safety": "🛡️",
  "Privacy": "🔐",
  "Other": "⚙️",
};

const Section = ({
  title,
  items,
  isActive,
  index,
}: {
  title: string;
  items: string[];
  isActive?: boolean;
  index?: number;
}) => (
  <motion.div
    id={`section-${index}`}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.4 }}
    className="mb-12 scroll-mt-24"
  >
    <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-2xl p-8 hover:border-accent/30 transition-all duration-300 shadow-sm hover:shadow-md">
      {/* Section Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
            <span className="text-2xl">{icons[title] || "📌"}</span>
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h2>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-accent/20 via-accent/10 to-transparent mb-6" />

      {/* Items List */}
      <ul className="space-y-3">
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.02 }}
            className="flex gap-4 text-muted-foreground leading-relaxed group"
          >
            <span className="flex-shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-accent/60 group-hover:bg-accent transition-colors" />
            <span className="flex-1 text-sm sm:text-base group-hover:text-foreground/90 transition-colors">
              {item}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  </motion.div>
);

const TermsContent = ({ activeSection, onSectionChange }: { activeSection?: number; onSectionChange?: (idx: number) => void }) => {
  return (
    <div className="space-y-2">
      <Section
        index={0}
        title="Bookings, Confirmations and Costs"
        isActive={activeSection === 0}
        items={[
          "All bookings are subject to availability.",
          "Your booking is confirmed when you receive e-mail confirmation.",
          "Bookings must be made at least 12 hours in advance. For bookings within 12 hours, please contact us directly via WhatsApp or email for availability.",
          "Full payment is due strictly 24 hours prior to departure, or before commencement of the service on short notice bookings. Long distance transfers must be paid in advance (no cash).",
          "Method of payment via direct bank transfer (details can be found on our invoices), card or cash.",
          "We regret that we don't accept cheques as payment.",
          "All prices exclude any parking related costs that might occur should a client request a driver to wait.",
          "Rates are quoted in South African Rand (ZAR).",
          "Bank charges on international bank transfers are strictly for the clients' account.",
        ]}
      />
      <Section
        index={1}
        title="Cancellations and Refunds"
        isActive={activeSection === 1}
        items={[
          "We have a 48 hour cancellation period for all transport services. Any transfer not cancelled or changed in writing 48 hours before the reserved time, a full cancellation fee will be charged.",
          "Third party partners, transfers, purchased tickets reserve the right not to provide refunds for cancellations.",
          "All cancellations to be in writing via email to: info@ctsctravel.com.",
        ]}
      />
      <Section
        index={2}
        title="No-shows and Punctuality"
        isActive={activeSection === 2}
        items={[
          "It is the responsibility of the client to ensure that sufficient time is allowed to arrive at their destination.",
          "In the case of a no-show, the full booking fee will be charged, and we reserve the right to take immediate legal action should payment not be received.",
          "The driver WILL depart the collection point 15 minutes after the scheduled collection time, except in the case of airport collections where we are aware of the time taken to clear customs and/or collect luggage, and when flights are delayed. Please be considerate of the fact that our drivers are working on a fixed schedule, and delays will affect other paying clients.",
          "You hereby acknowledge that if (and only if) our schedule allows the driver to wait longer than 15 minutes, you will be charged R250 sedan / R350 minibus per hour or part thereof for waiting time.",
          "We request that you contact us telephonically in case of change in flight plans (diverted, cancelled or indefinitely delayed flights). Please keep our contact numbers at hand: +27 (0)21 300 5297 or WhatsApp +27 72 617 8577.",
          "If a flight is delayed, we will endeavour to monitor the situation and accommodate the change, as we are dependent on information provided to us by the Airport Company of South Africa (ACSA).",
          "However, we will not be held liable for delays caused should ACSA provide us with erroneous information.",
          "Unforeseen circumstances may delay our service. We request that clients wait 15 minutes after the scheduled collection time before making alternative arrangements. If your driver is late for your collection by more than 15 minutes, you will not be charged for the transfer.",
          "NB: Please ensure that we have a mobile number of the passenger(s) so that we can liaise with them should we be unexpectedly delayed.",
          "As much as we pride ourselves on our reliability and punctuality, unforeseen circumstances may delay or cancel our service without prior notice. CTSC Travel, their employees, agents, associates and any other person indirectly in the employ or service of CTSC Travel will not be liable for any loss, damage, injury, accident, death, delay or inconvenience to any person or their belongings, unless it has been proven that such damage was caused due to malicious intent or gross negligence by the driver or any person acting on behalf of CTSC Travel.",
          "CTSC Travel reserves the right to refuse to undertake the conveyance of any passengers.",
          "There will be no refunds or compensation for entertainment or air-conditioning system failure on our shuttle services.",
          "NB: Any changes to your itinerary or route, or any new / extra bookings must be made with CTSC Travel and not directly with the driver.",
          "If a passenger fails to join a transfer no refund or rebate will be made.",
        ]}
      />
      <Section
        index={3}
        title="Luggage"
        isActive={activeSection === 3}
        items={[
          "Passengers are allowed to take onto a service one medium sized suitcase or rucksack, and one small item of 'hand luggage' with exception of a passenger with a wheelchair (must be conveyed to booking agent at time of booking). We shall have no obligation to carry luggage in excess of the permitted amount (as per standard airline regulations).",
          "Unaccompanied luggage will not be carried for safety reasons.",
          "CTSC Travel carries no responsibility for loss or damage to a passenger's luggage or personal belongings, unless it has been proven that such damage was caused due to malicious intent or gross negligence by the driver or any person acting on behalf of CTSC Travel.",
          "Passengers are advised to fully inspect vehicles for personal belongings before departing. CTSC Travel reserves the right to apply a delivery charge should luggage be left behind.",
        ]}
      />
      <Section
        index={4}
        title="Health and Safety"
        isActive={activeSection === 4}
        items={[
          "It is a mandatory legal requirement for all passengers to wear seat belts.",
          "The driver has the right to refuse any client who in his/her opinion is a danger to the driver, vehicle or the other passengers.",
          "In the interest of Health and Safety, CTSC Travel reserves the right to refuse admission to any of our services where it may hinder the health and safety of fellow passengers.",
          "Smoking and the consumption of alcoholic beverages, or excessive intoxication by use of alcohol or drugs is NOT permitted on our shuttle services under any circumstances and passengers will be refused boarding at the sole discretion of the driver. In the event of the passenger being refused boarding, the passenger will forfeit any right to a refund or compensation. Note that any open alcoholic beverages are forbidden by law in any vehicle.",
          "You will be held fully responsible for valet and/or repair fees should you / your clients sully or damage our vehicles.",
          "No animals will be carried on CTSC Travel with exception of trained guide dogs accompanying a visually impaired passenger.",
          "CTSC Travel is committed to passenger safety. Each vehicle is insured with passenger liability insurance. We only employ drivers that have been issued a Professional Driving Permit (PDP), which is obtained after they pass a medical examination and once a police clearance certificate has been issued.",
          "CTSC Travel is a platform which connects third-party drivers with passengers. These drivers are vetted and pre-approved independent contractors and not employees of CTSC Travel. By entering into this agreement, the client acknowledges and agrees that CTSC Travel may engage third-party drivers to fulfil its obligations in terms of this agreement/contract.",
        ]}
      />
      <Section
        index={5}
        title="Privacy"
        isActive={activeSection === 5}
        items={[
          "We completely respect your privacy at CTSC Travel and shall take all reasonable steps to protect the personal information of users. For the purpose of this clause, 'personal information' shall be defined as detailed in the Promotion of Access to Information Act 2 of 2000 (PAIA).",
          "For your convenience, the PAIA may be downloaded at: www.polity.org.za/html/govdocs/legislation/2000/act.pdf.",
          "We will never sell, rent or give away your name, email or address to anyone — ever. We will use your email address only to communicate with you about your orders and information from CTSC Travel.",
          "Please note that if you register as a customer, your details will be kept in a secure server for your use the next time you book with us.",
          "However, this information is exclusively used for the handling of your orders and for your added convenience. It will never be sold, rented or given away to a third party.",
        ]}
      />
      <Section
        index={6}
        title="Other"
        isActive={activeSection === 6}
        items={[
          "Travel routes are decided at the sole discretion of the driver. Suggestions are welcome, but the driver will decide on the final route, and no discussion to the contrary will be entered into.",
          "For children under the age of 3 years a car seat is mandatory. The charge is R100 per seat. Please indicate this when making your reservation.",
          "All transfers are door to door. A surcharge of R50 will be levied per additional stop (unless completely out of the way).",
          "If a luggage trailer is required, an additional R350 will be charged for a standard luggage trailer. Please enquire about the rates for larger trailers when making your booking.",
          "Our call centre is open 7am–10pm daily and transport service operates 24 hours a day.",
          "These Terms and Conditions may be subject to change without notice.",
        ]}
      />
    </div>
  );
};

export default TermsContent;
