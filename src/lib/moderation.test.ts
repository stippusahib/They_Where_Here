import { describe, it, expect } from 'vitest';
import { bodyAllowed } from './moderation';

describe('Content Moderation Engine', () => {
  it('allows clean, verified travel advice', () => {
    expect(
      bodyAllowed(
        'Skip the main stall. Auntie’s sulaimani counter behind the banyan tree crushes fresh cardamom on order.'
      )
    ).toBe(true);

    expect(
      bodyAllowed(
        'The sunset pier lightkeeper keeps a guestbook dating back to 1984 under the signal desk. Ask him politely.'
      )
    ).toBe(true);
  });

  it('rejects URLs and website links', () => {
    expect(bodyAllowed('Check out our guide at https://travelguide.com for more info')).toBe(false);
    expect(bodyAllowed('Visit www.secretspots.in for discounted tickets')).toBe(false);
    expect(bodyAllowed('Go to coolcafe.io right now')).toBe(false);
  });

  it('rejects email addresses and social handles', () => {
    expect(bodyAllowed('Contact me at traveller@gmail.com for the secret key')).toBe(false);
    expect(bodyAllowed('Follow my instagram @calicut_explorer for updates')).toBe(false);
  });

  it('rejects phone numbers and numeric contact details', () => {
    expect(bodyAllowed('Call the rickshaw driver at 9876543210 for a direct ride')).toBe(false);
    expect(bodyAllowed('WhatsApp booking line: 919847012345')).toBe(false);
  });
});
