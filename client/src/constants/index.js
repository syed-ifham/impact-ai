import { 
  MailSearch, 
  Users, 
  FileText, 
  Sparkles, 
  CalendarCheck
} from 'lucide-react';

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
