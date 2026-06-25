import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.PUBLIC_SANITY_PROJECT_ID || '',
    dataset: process.env.PUBLIC_SANITY_DATASET || 'production'
  },
  deployment: {
    appId: 't6dy2wwadrj9q1jeh0enjm3b'
  }
});
