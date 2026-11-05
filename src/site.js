// Which face of the site to show. lavanyaaa.com gets the "coming soon" home while the portfolio
// is built; the vercel.app address keeps the full site. Add ?soon to preview it anywhere.
export const SOON =
  /(^|\.)lavanyaaa\.com$/.test(location.hostname) || new URLSearchParams(location.search).has('soon')
