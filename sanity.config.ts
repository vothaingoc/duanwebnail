import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './src/sanity/schemaTypes';

export default defineConfig({
  name: 'golyn-nail',
  title: 'Golyn Nail CMS',
  projectId: '722zj1tf',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {
    types: schemaTypes
  }
});