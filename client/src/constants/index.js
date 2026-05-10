import { 
  MailSearch, 
  Users, 
  FileText, 
  Sparkles, 
  CalendarCheck
} from 'lucide-react';

export const landingPage = {
  nav: {
    logo: {
      url: "/favicon.svg",
      name: "Impact AI",
      link: "/",
    },
    links: {
      link1: { name: "How it works", link: "#how-it-works" },
      link2: { name: "Impact", link: "#impact" },
      link3: { name: "Features", link: "#features" },
    }
  },
  hero: {
    eyebrow: "AI-powered administrative relief",
    headline: {
      main: "Automate the busywork.",
      highlight: "Amplify the impact."
    },
    subtitle: "Our platform uses AI to organize donor emails, match volunteers, and draft grants, so your team can focus on what actually matters—helping people.",
    primaryCTA: "I represent an NGO",
    secondaryCTA: "I want to volunteer",
    imageAlt: "NGO community work"
  },
  problem: {
    eyebrow: "The Problem",
    headline: {
      main: "Data is scattered.",
      highlight: "Help is delayed."
    },
    subtitle: "NGOs collect massive amounts of data, but without automation, it sits in inboxes and spreadsheets.",
    points: [
      "Donor emails take days to sort and reply to.",
      "Volunteer matching is done manually on spreadsheets.",
      "Grant proposals require weeks of repetitive drafting.",
      "Teams burn out from admin, not the mission."
    ],
    quote: "Millions of hours are lost to administrative silos — not because the passion isn't there, but because the data is overwhelming."
  },
  howItWorks: {
    eyebrow: "Process",
    headline: {
      main: "How Impact AI",
      highlight: "transforms your workflow"
    },
    steps: [
      {
        number: "01",
        title: "Connect & Ingest",
        description: "Securely link your existing communication channels and databases."
      },
      {
        number: "02",
        title: "AI Analysis",
        description: "Our intelligence engine categorizes, prioritizes, and drafts responses instantly."
      },
      {
        number: "03",
        title: "Human Approval",
        description: "You review and approve AI-generated actions with a single click."
      },
      {
        number: "04",
        title: "Amplify Impact",
        description: "Spend the saved time directly on your core mission and community."
      }
    ]
  },
  impact: {
    eyebrow: "Results",
    headline: {
      main: "Measurable difference,",
      highlight: "from day one."
    },
    stats: [
      { value: "70%", label: "Reduction in admin time" },
      { value: "3x", label: "Faster donor response rates" },
      { value: "10k+", label: "Volunteer hours optimized" },
      { value: "24/7", label: "Automated sorting & triage" }
    ]
  },
  features: {
    eyebrow: "Capabilities",
    headline: {
      main: "Everything you need.",
      highlight: "Nothing you don't."
    }
  },
  cta: {
    headline: "Ready to reclaim your time?",
    subtitle: "Join our platform—whether you need to organize your inbox, schedule events, or match volunteers automatically.",
    primaryCTA: "Launch Workspace",
    secondaryCTA: "View Documentation"
  }
};


export const tools = [
  {
    id: 1,
    title: 'Donor Email Organizer',
    description: 'Automatically sorts and drafts replies to donor inquiries, saving you hours of inbox management.',
    icon: MailSearch,
  },
  {
    id: 2,
    title: 'Volunteer Matcher',
    description: 'Smartly pairs new volunteers with the programs that need their specific skills the most.',
    icon: Users,
  },
  {
    id: 3,
    title: 'Grant Proposal Assistant',
    description: 'Generates structured drafts for grant applications based on your past successful proposals.',
    icon: FileText,
  },
  {
    id: 4,
    title: 'Event Scheduler AI',
    description: 'Finds the perfect time for community events by analyzing attendee availability and local calendars.',
    icon: CalendarCheck,
  },
  {
    id: 5,
    title: 'Impact Report Generator',
    description: 'Turns your raw data and spreadsheets into beautiful, ready-to-publish impact summaries.',
    icon: Sparkles,
  },
];

export const mockEmails = [
  { id: 1, subject: 'Inquiry about volunteering this weekend', sender: 'sarah.jenkins@example.com', date: 'Oct 24, 2026', status: 'Draft Ready' },
  { id: 2, subject: 'Corporate matching gift question', sender: 'mike.t@corp.com', date: 'Oct 24, 2026', status: 'Pending Analysis' },
  { id: 3, subject: 'Thank you for the recent gala!', sender: 'emily.r@gmail.com', date: 'Oct 23, 2026', status: 'Sent' },
  { id: 4, subject: 'How can I donate supplies?', sender: 'david.p@localbusiness.net', date: 'Oct 23, 2026', status: 'Draft Ready' },
];
