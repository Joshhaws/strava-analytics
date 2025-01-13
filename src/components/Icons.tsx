import React from 'react';

export function StravaIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.008 13.828h4.172" />
    </svg>
  );
}

export const HomeIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);

export const TableIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3h18v18H3zM5 5v2h14V5zm0 4v10h14V9z" />
  </svg>
);

export const AnalyticsIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3h18v18H3zM9 17h2v-6H9zm4-2h2v-6h-2zm4 4h2v-10h-2z" />
  </svg>
);

export const SettingsIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.14 12.94A7 7 0 0116.11 12a7 7 0 01-.64-3.11l2.49-1.91a1 1 0 00.14-1.41l-2-2a1 1 0 00-1.41-.14l-1.91 2.49A7 7 0 0112 7.89a7 7 0 01-3.11-.64L6.89 5.36a1 1 0 00-1.41.14l-2 2a1 1 0 00.14 1.41L6 9.64A7 7 0 016 12a7 7 0 01-.64 3.11L2.86 17a1 1 0 00.14 1.41l2 2a1 1 0 001.41-.14L9.64 18A7 7 0 0112 18a7 7 0 013.11.64l2.49-1.91a1 1 0 001.41.14l2-2a1 1 0 00-.14-1.41zm-7.14 2.06A3 3 0 1112 11a3 3 0 010 6z" />
  </svg>
);
