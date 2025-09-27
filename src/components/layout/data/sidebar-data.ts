import {
  IconBrowserCheck,
  IconChecklist,
  IconHelp,
  IconLayoutDashboard,
  IconNotification,
  IconPalette,
  IconSettings,
  IconTool,
  IconUserCog,
  IconUsers,
  IconTransform,
} from '@tabler/icons-react'
import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'John Doe',
    email: 'johndoe@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Patient Intake',
      logo: Command,
      plan: 'Pro',
    },
    {
      name: 'Lab Results',
      logo: GalleryVerticalEnd, 
      plan: 'Pro',
    },
    {
      name: 'Medical Records',
      logo: AudioWaveform,
      plan: 'Basic',
    },
  ],
  navGroups: [
    {
      title: 'HL7 Tools',
      items: [
        {
          title: 'Dashboard',
          url: '/dash',
          icon: IconLayoutDashboard,
        },
        {
          title: 'HL7 Converter',
          url: '/hl7-converter',
          icon: IconTransform,
        },
      ],
    },
    {
      title: 'Core',
      items: [
        {
          title: 'Patients',
          url: '/workflow',
          icon: IconChecklist,
        },
        {
          title: 'Analytics',
          url: '/workflow/analytics',
          icon: IconUsers,
        },
      ],
    },
    
    {
      title: 'Support',
      items: [
        {
          title: 'Settings',
          icon: IconSettings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: IconUserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: IconTool,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: IconPalette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: IconNotification,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: IconBrowserCheck,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: IconHelp,
        },
      ],
    },
  ],
}