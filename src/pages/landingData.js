// ============================================================
// FAKE DATA for the landing page.
// Later, replace these with data from the backend.
// ============================================================

// Words typed in the hero headline
export const TYPED_PLACES = [
  "clinics",
  "banks",
  "ministries",
  "restaurants",
  "salons",
  "universities",
];

// Logos in the moving strip. Files go in /public/logos/
export const PARTNER_LOGOS = [
  { name: "BBK", src: "/logos/bbk.png" },
  { name: "NBB", src: "/logos/nbb.png" },
  // Add more like this:
  // { name: "Company name", src: "/logos/company.svg" },
];

// Live board in the hero
export const HERO_QUEUE = {
  branch: "City Centre Branch",
  service: "General services",
  startNumber: 104, // first "Now serving" number
  yourNumber: 107,  // the visitor's ticket
  counters: 3,
};

// Three steps for visitors
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

// Stacking cards
export const FEATURES = [
  {
    id: "join",
    tab: "Join",
    tone: "mist",
    eyebrow: "For visitors",
    title: "Join from anywhere",
    text: "Browse approved places, pick a branch and service, and take a ticket without stepping inside.",
    link: { label: "Find a place", to: "/businesses" },
  },
  {
    id: "track",
    tab: "Track",
    tone: "peach",
    eyebrow: "Live updates",
    title: "Know your place, live",
    text: "Your position and wait time update in real time, so you always know when to leave.",
    link: { label: "Join a queue", to: "/register" },
  },
  {
    id: "notify",
    tab: "Notify",
    tone: "dark",
    eyebrow: "Smart alerts",
    title: "Get called right on time",
    text: "A heads-up when you're close, and a clear alert when it's your turn.",
    link: { label: "Create an account", to: "/register" },
  },
  {
    id: "manage",
    tab: "Manage",
    tone: "paper",
    eyebrow: "For businesses",
    title: "Run every branch from one place",
    text: "Call the next visitor, see who's waiting, and manage services, hours and staff.",
    link: { label: "Register your business", to: "/business/register" },
  },
  {
    id: "verify",
    tab: "Verify",
    tone: "orange",
    eyebrow: "Trust and safety",
    title: "Every business is verified",
    text: "New businesses are reviewed before their queues go live, and every admin action is logged.",
    link: { label: "Register your business", to: "/business/register" },
  },
];

// Made for every place (icon names match INDUSTRY_ICONS in LandingPage.jsx)
export const INDUSTRIES = [
  { name: "Healthcare", icon: "healthcare" },
  { name: "Government", icon: "government" },
  { name: "Banks", icon: "banks" },
  { name: "Restaurants", icon: "restaurants" },
  { name: "Veterinary", icon: "veterinary" },
  { name: "Pharmacies", icon: "pharmacies" },
  { name: "Salons and beauty", icon: "salons" },
  { name: "Universities", icon: "universities" },
  { name: "Events", icon: "events" },
  { name: "Retail", icon: "retail" },
  { name: "Car services", icon: "car" },
  { name: "Post and logistics", icon: "post" },
];

// Places on QLess (later: GET /api/businesses)
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
    name: "Bloom Salon",
    category: "Beauty",
    city: "Riffa",
    description: "Haircuts, styling and nail care for walk-ins and regulars.",
    waiting: 2,
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
    name: "Campus Help Desk",
    category: "Education",
    city: "Sakhir",
    description: "Registration, student ID cards and fee payments.",
    waiting: 5,
  },
];

// Questions answered
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