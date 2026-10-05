// ============================================================
// FAKE DATA for the landing page.
// Later, replace these with data from the backend.
// ============================================================

/* ---------- Hero ---------- */
export const TRUST_POINTS = ["Free for visitors", "No app needed", "Verified businesses"];

/* ---------- Trusted by ---------- */
// Logo files go in /public/logos/
export const PARTNER_LOGOS = [
  { name: "BBK", src: "/logos/bbk.png" },
  { name: "NBB", src: "/logos/nbb.png" },
  { name: "ila", src: "/logos/ila.png" },
  { name: "alsalam", src: "/logos/alsalam.png" },
  { name: "stc", src: "/logos/stc.svg" },
  { name: "zain", src: "/logos/zain.jpeg" },
  { name: "batelco", src: "/logos/batelco.png" },
  { name: "ewa", src: "/logos/EWA.webp" },
  { name: "bahrainpost", src: "/logos/bahrainpost.svg" },
];

// SAMPLE reviews. Replace with real reviews before going public.
export const REVIEWS = [
  {
    before: "",
    highlight: "Our waiting room is finally calm.",
    after: " Patients wait in their cars or a nearby café and come in right on time.",
    name: "Huda A.",
    place: "Noor Clinic",
  },
  {
    before: "Visitors used to crowd the counters every morning. Now ",
    highlight: "everyone knows their number and when to come back.",
    after: "",
    name: "Khalid R.",
    place: "City Services Centre",
  },
  {
    before: "Setting up our branches and services took one afternoon. ",
    highlight: "Our staff picked it up straight away.",
    after: "",
    name: "Layla S.",
    place: "Harbor Bank",
  },
  {
    before: "",
    highlight: "Fewer people leave without being served,",
    after: " because nobody has to stand and wait anymore.",
    name: "Ahmed J.",
    place: "Campus Help Desk",
  },
  {
    before: "I joined the queue from home, finished my errands and ",
    highlight: "walked in exactly when it was my turn.",
    after: "",
    name: "Mariam K.",
    place: "Visitor",
  },
  {
    before: "When we close early, we post one announcement and ",
    highlight: "everyone in the queue sees it instantly.",
    after: "",
    name: "Yousif H.",
    place: "Paws Vet Clinic",
  },
];

/* ---------- Moving queue (scroll section) ---------- */
export const QUEUE_SCROLL = {
  yourNumber: 107,
  firstNumber: 104, // the person being served when the section starts
  counter: 2,
};

/* ---------- Steps ---------- */
export const STEPS = [
  {
    title: "Join the queue",
    text: "Find the place on QLess or open its link, then pick the service you need.",
  },
  {
    title: "Wait anywhere",
    text: "Follow your place in line live while you get on with your day.",
  },
  {
    title: "Get called",
    text: "We let you know when it's almost your turn and which counter to go to.",
  },
];

/* ---------- Two sides ---------- */
export const AUDIENCES = {
  visitors: {
    tag: "For visitors",
    title: "Wait less. Live more.",
    text: "Take a ticket from anywhere and get on with your day.",
    points: [
      "Join from anywhere, no app needed",
      "See your number and place in line live",
      "Get an alert before your turn",
      "Know exactly which counter to go to",
    ],
    button: { label: "Find a place", to: "/businesses" },
  },
  business: {
    tag: "For businesses",
    title: "Run every branch from one place.",
    text: "Everything your front desk needs, without the crowded lobby.",
    points: [
      "Branches, services and opening hours",
      "Staff accounts to call the next visitor",
      "Announcements for delays or closures",
      "Verified by our team before going live",
    ],
    button: { label: "Register your business", to: "/business/register" },
  },
};

/* ---------- Features grid ---------- */
export const FEATURES = [
  {
    icon: "bell",
    title: "Live notifications",
    text: "Visitors get a heads-up when they're close and a clear alert when it's their turn.",
  },
  {
    icon: "calendar",
    title: "Bookings",
    text: "Let visitors book a time in advance and manage bookings next to walk-ins.",
  },
  {
    icon: "buildings",
    title: "Multi-branch",
    text: "Each branch has its own services, opening hours and queues.",
  },
  {
    icon: "users",
    title: "Staff console",
    text: "Staff call the next visitor, check people in and mark visits complete.",
  },
  {
    icon: "megaphone",
    title: "Announcements",
    text: "Tell visitors about delays, closures or changes in seconds.",
  },
  {
    icon: "star",
    title: "Reviews and favourites",
    text: "Visitors rate their visit and save the places they go to often.",
  },
];

/* ---------- Why QLess ---------- */
export const VALUES = [
  {
    icon: "smile",
    title: "Easy to use",
    text: "Visitors join in a few taps, and staff learn the console in minutes.",
  },
  {
    icon: "scales",
    title: "Fair for everyone",
    text: "First come, first served, with clear numbers, so nobody gets skipped.",
  },
  {
    icon: "stack",
    title: "Works for any branch",
    text: "From one small clinic to a network of service centres.",
  },
  {
    icon: "chat",
    title: "Built on feedback",
    text: "Reviews from visitors help businesses improve every day.",
  },
];

/* ---------- Numbers (count up) ---------- */
// SAMPLE numbers. Later: load real ones from the admin stats API.
export const STATS = [
  { value: 313, suffix: "+", label: "visitors trust QLess" },
  { value: 25, suffix: "", label: "businesses on QLess" },
  { value: 60, suffix: "+", label: "branches with live queues" },
  { value: 5, suffix: " min", label: "average wait" },
];

/* ---------- Industries ---------- */
export const INDUSTRIES = [
  { name: "Government services", icon: "government" },
  { name: "Banks", icon: "banks" },
  { name: "Hospitals and clinics", icon: "healthcare" },
  { name: "Medical labs", icon: "labs" },
  { name: "Pharmacies", icon: "pharmacies" },
  { name: "Telecom stores", icon: "telecom" },
  { name: "Utility offices", icon: "utilities" },
  { name: "Universities", icon: "universities" },
];

/* ---------- Places (later: GET /api/businesses) ---------- */
export const PLACES = [
  {
    id: 1,
    name: "Noor Clinic",
    category: "Healthcare",
    city: "Manama",
    description: "Family clinic with general consultations, lab tests and pharmacy pickup.",
    waiting: 7,
  },
  {
    id: 2,
    name: "Harbor Bank",
    category: "Banking",
    city: "Seef",
    description: "Account services, cards and loan appointments at the main branch.",
    waiting: 4,
  },
  {
    id: 3,
    name: "City Services Centre",
    category: "Government",
    city: "Isa Town",
    description: "ID renewals, certificates and general enquiries.",
    waiting: 12,
  },
  {
    id: 4,
    name: "Campus Help Desk",
    category: "Education",
    city: "Sakhir",
    description: "Registration, student ID cards and fee payments.",
    waiting: 5,
  },
  {
    id: 5,
    name: "Paws Vet Clinic",
    category: "Veterinary",
    city: "Saar",
    description: "Check-ups, vaccinations and grooming for cats and dogs.",
    waiting: 3,
  },
  {
    id: 6,
    name: "Link Telecom Store",
    category: "Telecom",
    city: "Riffa",
    description: "New lines, SIM cards, bill payments and device repairs.",
    waiting: 6,
  },
];

/* ---------- FAQ ---------- */
export const FAQS = [
  {
    q: "Do visitors need to download an app?",
    a: "No. QLess works in the phone's browser, so visitors can join a queue right away.",
  },
  {
    q: "How do visitors know when it's their turn?",
    a: "Their ticket updates live, and they get a notification when it's almost their turn and which counter to go to.",
  },
  {
    q: "Can I manage more than one branch?",
    a: "Yes. Each branch has its own services, opening hours and staff, and you manage them all from one dashboard.",
  },
  {
    q: "Why does my business need to be approved?",
    a: "Every business is reviewed by an administrator before it goes live, so visitors can trust every queue on QLess.",
  },
  {
    q: "Can I tell visitors about delays or closures?",
    a: "Yes. Post an announcement and it appears for visitors at the branches you choose.",
  },
  {
    q: "Is QLess free for visitors?",
    a: "Yes. Visitors can join queues and follow their place at no cost.",
  },
];

/* ---------- Footer ---------- */
export const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { label: "Find a place", to: "/businesses" },
      { label: "Join a queue", to: "/register" },
      { label: "Bookings", to: "/register" },
      { label: "For businesses", to: "/business/register" },
    ],
  },
  {
    title: "Industries",
    links: [
      { label: "Government", to: "/businesses?category=Government%20services" },
      { label: "Banks", to: "/businesses?category=Banks" },
      { label: "Healthcare", to: "/businesses?category=Hospitals%20and%20clinics" },
      { label: "Telecom", to: "/businesses?category=Telecom%20stores" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "FAQ", to: "/#faq" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help centre", to: "/help" },
      { label: "Privacy policy", to: "/privacy" },
      { label: "Terms of use", to: "/terms" },
    ],
  },
];