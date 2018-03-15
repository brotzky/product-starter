import proxy from 'http-proxy-middleware';
import url from 'url';
const isDev = process.env.NODE_ENV === 'development';

/**
 * const env should always equal 'development' when webpack-dev-server
 * is executing. So we are creating our own --env.dev value.
 */
const env = {
  org: process.argv[2] || 'demo',
  env: process.argv[3] || 'dev',
};

if (!process.argv[2] && isDev) {
  throw new Error(
    'You must provide the organization and enviroment: > yarn start <organization> <env>',
  );
}

const target = 'localhost:8080';

function buildEnvOnRequest(req) {
  const host = req.get('host');
  const subdomain = host.split('.')[0].split('-');
  const subdomainOrg = subdomain[0];
  const subdomainEnv = subdomain[1];

  // Workaround for localhost
  if (host.includes('localhost')) {
    return {
      url,
      subdomainOrg: env.org,
      subdomainEnv: env.env,
    };
  }

  return {
    url,
    subdomainOrg,
    subdomainEnv,
  };
}

function buildDynamicTarget(req) {
  const { url, subdomainOrg, subdomainEnv } = buildEnvOnRequest(req);

  if (req.get('host') === 'loans-gac.meridiancu.ca') {
    return 'https://admin-api-dot-grow-meridian-prod.appspot.com';
  }

  return `https://admin-api-dot-grow-${subdomainOrg}-${subdomainEnv}.appspot.com`;
}

function buildDynamicHeaders(proxyReq, req, res) {
  const { url, subdomainOrg, subdomainEnv } = buildEnvOnRequest(req);
  let forwardHost;

  // Production workaround
  if (req.get('host') === 'loans-gac.meridiancu.ca') {
    forwardHost = 'loans-gac.meridiancu.ca';
  }

  forwardHost = `${subdomainOrg}-${subdomainEnv}-gac.poweredbygrow.com`;

  proxyReq.setHeader('X-Forwarded-Host', forwardHost);
}

export default function() {
  return proxy({
    target,
    changeOrigin: true,
    secure: false,
    router: buildDynamicTarget,
    onProxyReq: buildDynamicHeaders,
  });
}
