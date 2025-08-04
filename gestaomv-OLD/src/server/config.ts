import 'dotenv/config';

export const getConfig = () => ({
  appUrl: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  env: process.env.NODE_ENV || 'production',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    path: process.env.DATABASE_PATH || './database.sqlite',
    files: process.env.DATAFILES_PATH || './data',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'temp-secret',
    expiresIn: '30d',
  },
  tagone: {
    baseUrl: process.env.TAGONE_BASE_URL || 'https://modaverao.tagone.com.br/odata',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || null,
    emailFrom: process.env.RESEND_EMAIL_FROM || null,
  },
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || null,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || null,
    bucket: process.env.BUCKET_NAME || 'gestaomv',
    region: process.env.AWS_REGION || 'auto',
    url: process.env.AWS_ENDPOINT_URL_S3 || 'https://fly.storage.tigris.dev',
  },
});

export default getConfig;

export const config = getConfig();
