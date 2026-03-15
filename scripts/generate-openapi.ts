import fs from 'fs';
import path from 'path';
import { swaggerSpec } from '../src/configs/swagger';

const outputPath = path.resolve(__dirname, '../openapi.json');

fs.writeFileSync(
  outputPath,
  JSON.stringify(swaggerSpec, null, 2),
  'utf-8'
);

console.log('Successfully generated openapi.json at:', outputPath);
