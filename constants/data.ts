import { icons } from "./icons";

export const TABS: AppTab[] = [
  { name: "index", title: "Home", icon: icons.home },
  { name: "subscriptions", title: "Subscriptions", icon: icons.wallet },
  { name: "insights", title: "Insights", icon: icons.activity },
  { name: "settings", title: "Settings", icon: icons.setting },
];

export const HOME_USER = {
  name: "Mohit",
};

export const HOME_BALANCE = {
  amount: 2489.48,
  nextRenewalDate: "2026-05-28T09:00:00.000Z",
};

export const UPCOMING_SUBSCRIPTIONS: UpcomingSubscription[] = [
  {
    id: "1",
    name: "Spotify",
    price: "$5.99",
    daysLeft: 6,
    icon: 'spotify' as const,
    color: "#1DB954",
  },
  {
    id: "2",
    name: "GitHub",
    price: "$18.99",
    daysLeft: 3,
    icon: 'github' as const,
    color: "#000000",
  },
  {
    id: "3",
    name: "Figma",
    price: "$15.00",
    daysLeft: 4,
    icon: '' as const,
    color: "#F24E1E",
  },
  {
    id: "4",
    name: "Open AI",
    price: "$9.99",
    daysLeft: 8,
    icon: 'open-a-i' as const,
    color: "#000000",
  },
];

export const HOME_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "adobe-creative-cloud",
    icon: icons.adobe,
    name: "Adobe Creative Cloud",
    plan: "Teams Plan",
    category: "Design",
    paymentMethod: "Visa ending in 8530",
    status: "active",
    startDate: "2025-03-20T10:00:00.000Z",
    price: 77.49,
    currency: "USD",
    billing: "Monthly",
    renewalDate: "2026-03-20T10:00:00.000Z",
    color: "#f5c542",
  },
  {
    id: "github-pro",
    icon: icons.github,
    name: "GitHub Pro",
    plan: "Developer",
    category: "Developer Tools",
    paymentMethod: "Mastercard ending in 2408",
    status: "active",
    startDate: "2024-11-24T10:00:00.000Z",
    price: 9.99,
    currency: "USD",
    billing: "Monthly",
    renewalDate: "2026-03-24T10:00:00.000Z",
    color: "#e8def8",
  },
  {
    id: "claude-pro",
    icon: icons.claude,
    name: "Claude Pro",
    plan: "Pro Plan",
    category: "AI Tools",
    paymentMethod: "Amex ending in 1010",
    status: "paused",
    startDate: "2025-06-27T10:00:00.000Z",
    price: 20.0,
    currency: "USD",
    billing: "Monthly",
    renewalDate: "2026-03-27T10:00:00.000Z",
    color: "#b8d4e3",
  },
  {
    id: "canva-pro",
    icon: icons.canva,
    name: "Canva Pro",
    plan: "Yearly Access",
    category: "Design",
    paymentMethod: "Visa ending in 7784",
    status: "cancelled",
    startDate: "2024-04-02T10:00:00.000Z",
    price: 119.99,
    currency: "USD",
    billing: "Yearly",
    renewalDate: "2026-04-02T10:00:00.000Z",
    color: "#b8e8d0",
  },
];
