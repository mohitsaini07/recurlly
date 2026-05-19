# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Recurlly Expo app. The following changes were made:

- **`app.config.js`** — Created to replace `app.json`, adding `extra.posthogProjectToken` and `extra.posthogHost` loaded from environment variables.
- **`src/config/posthog.ts`** — New PostHog client initialized using `expo-constants` to read config from `app.config.js` extras.
- **`app/_layout.tsx`** — Added `PostHogProvider` wrapping the app, plus manual screen tracking via `usePathname`/`useGlobalSearchParams` for Expo Router compatibility.
- **`app/(auth)/sign-in.tsx`** — Added `user_signed_in`, `user_sign_in_failed` events and `posthog.identify()` on successful sign-in.
- **`app/(auth)/sign-up.tsx`** — Added `user_signed_up`, `email_verification_completed`, `user_sign_up_failed` events and `posthog.identify()` on successful email verification.
- **`components/SubscriptionCard.tsx`** — Added `subscription_expanded` and `subscription_cancel_tapped` events.
- **`app/(tabs)/index.tsx`** — Added `home_add_subscription_tapped`, `home_see_all_upcoming_tapped`, and `home_subscriptions_filter_tapped` events.

## Events

| Event | Description | File |
|-------|-------------|------|
| `user_signed_in` | User successfully signs in with email and password | `app/(auth)/sign-in.tsx` |
| `user_sign_in_failed` | User sign-in attempt failed with an error | `app/(auth)/sign-in.tsx` |
| `user_signed_up` | User completes registration and verification email is sent | `app/(auth)/sign-up.tsx` |
| `user_sign_up_failed` | User sign-up attempt failed with an error | `app/(auth)/sign-up.tsx` |
| `email_verification_completed` | User successfully verifies their email during sign-up | `app/(auth)/sign-up.tsx` |
| `subscription_expanded` | User expands a subscription card to see details | `components/SubscriptionCard.tsx` |
| `subscription_cancel_tapped` | User taps the Cancel Subscription button on an expanded card | `components/SubscriptionCard.tsx` |
| `home_add_subscription_tapped` | User taps the add subscription icon on the home screen | `app/(tabs)/index.tsx` |
| `home_see_all_upcoming_tapped` | User taps See All in the upcoming subscriptions section | `app/(tabs)/index.tsx` |
| `home_subscriptions_filter_tapped` | User taps Filter in the all subscriptions section | `app/(tabs)/index.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/688932)
- [Signup funnel: Registration → Email verified](/insights/lywgiIYi)
- [Sign-in success vs failure](/insights/KJMdYHTY)
- [New user signups over time](/insights/hZqWy2W4)
- [Subscription engagement: Expand vs Cancel](/insights/GvMzTX6Q)
- [Home screen engagement](/insights/J2DQGewT)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
