// Authored line icons: 24px grid, 1.75 stroke, round caps. Inherit currentColor.
const svg = (body, cls = '') =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const icon = {
  check: (c) => svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', c),
  cross: (c) => svg('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>', c),
  play: (c) => svg('<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>', c),
  back: (c) => svg('<path d="M15 5l-7 7 7 7"/>', c),
  next: (c) => svg('<path d="M9 5l7 7-7 7"/>', c),
  lock: (c) => svg('<rect x="5.5" y="10.5" width="13" height="9" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>', c),
  replay: (c) => svg('<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4h4"/>', c),
  ear: (c) => svg('<path d="M7 9.5a5 5 0 0 1 10 0c0 3-2.5 3.8-3 6.2-.4 1.9-1.6 3.3-3.5 3.3A2.5 2.5 0 0 1 8 16.5"/><path d="M10 10a2 2 0 0 1 4 0"/>', c),
  settings: (c) => svg('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>', c),
  note: (c) => svg('<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5" fill="currentColor"/><circle cx="16.5" cy="16" r="2.5" fill="currentColor"/>', c),
};

// Filled star for ratings (outline-only when off).
export const star = (on) =>
  `<svg class="star ${on ? 'on' : 'off'}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.6 5.5 6 .8-4.4 4.1 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.5l6-.8z" stroke-linejoin="round"/></svg>`;
