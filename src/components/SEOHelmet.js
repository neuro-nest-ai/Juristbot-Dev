import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SEO_META, DEFAULT_SEO } from '../seo';

const SITE_URL = 'https://juristbot.ai';

// Pages Google should NOT index (login-only, OTP, payment, chat, etc.)
const NOINDEX_PREFIXES = [
  '/chat',
  '/C/',
  '/Subscription',
  '/payment-success',
  '/payment-history',
  '/profile',
  '/chathistory',
  '/listingProfile',
  '/caselist',
  '/mycourse',
  '/dashboard',
  '/verifyotp',
  '/forgetpassEmail',
  '/forgetpassmobileOtp',
  '/setpassword',
];

export default function SEOHelmet() {
  const { pathname } = useLocation();

  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

  const meta = SEO_META[path] || DEFAULT_SEO;
  const noindex = NOINDEX_PREFIXES.some((p) => path.startsWith(p));
  const url = `${SITE_URL}${path === '/' ? '/' : path}`;

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={url} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <link rel="canonical" href={url} />
      )}
    </Helmet>
  );
}