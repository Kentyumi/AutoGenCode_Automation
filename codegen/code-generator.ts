import fs from 'fs';
import path from 'path';
import { RecordedStep } from './execution-recorder';

export function generateTestCode(
  scenarioName: string,
  steps: RecordedStep[]
) {
  const lines: string[] = [];

  lines.push(`import { BasePage } from '../pages/base-page';`);
  lines.push(``);
  lines.push(`export async function ${toFnName(scenarioName)}(page: BasePage) {`);

  for (const step of steps) {
    if (step.action === 'click') {
      lines.push(`  await page.click('${step.logicalName}');`);
    }

    if (step.action === 'type') {
      lines.push(`  await page.type('${step.logicalName}', '${step.value}');`);
    }

    if (step.action === 'assert') {
      lines.push(`  // TODO: assert ${step.logicalName}`);
    }
  }

  lines.push(`}`);

  const outputDir = path.resolve('generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const filePath = path.join(outputDir, `${toFileName(scenarioName)}.ts`);
  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');

  console.log(`[CodeGen] Generated: ${filePath}`);
}

function toFnName(name: string) {
  return name.replace(/\s+/g, '_').toLowerCase();
}

function toFileName(name: string) {
  return toFnName(name) + '.spec';
}
