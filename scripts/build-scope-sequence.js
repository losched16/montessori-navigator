// Parse all Scope & Sequence spreadsheets into a TypeScript data file
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const resourceDir = path.join('C:', 'Users', 'thelo', 'OneDrive', 'Desktop', 'montessori-navigator-v7', 'Resources');

// Map files to curriculum areas (skip duplicates with "(1)" suffix)
const fileMap = {
  'Practical_Life_Curriculum_Tim_Level_Parent_Explanations.xlsx': 'practical_life',
  'Sensorial_Curriculum_Tim_Level_Parent_Explanations.xlsx': 'sensorial',
  'Language_Arts_Curriculum_Tim_Level_Parent_Explanations.xlsx': 'language',
  'Mathematics_Curriculum_Tim_Level_Parent_Explanations.xlsx': 'mathematics',
  'Science_Curriculum_Tim_Level_Parent_Explanations.xlsx': 'science',
  'Geography_Curriculum_Tim_Level_Parent_Explanations.xlsx': 'geography',
  'History_Curriculum_Tim_Level_Parent_Explanations.xlsx': 'history',
  'Cosmic_Studies_Curriculum_Tim_Level_Parent_Explanations.xlsx': 'cosmic_studies',
  'Infants_Curriculum_Tim_Level_Parent_Explanations.xlsx': 'infants',
  'Toddlers_Curriculum_Tim_Level_Parent_Explanations.xlsx': 'toddlers',
};

const allSkills = [];
let totalCount = 0;

for (const [filename, areaKey] of Object.entries(fileMap)) {
  const filePath = path.join(resourceDir, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP: ${filename} not found`);
    continue;
  }

  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // First row is headers
  const headers = rows[0];
  console.log(`\n${filename}: ${rows.length - 1} skills, headers: ${headers.length} cols`);

  // Determine age column mappings based on headers
  const ageColumns = [];
  for (let i = 4; i < headers.length; i++) {
    const h = headers[i];
    if (!h || h === 'Serial #' || h === 'Parent-Friendly Explanation') break;
    ageColumns.push({ index: i, label: String(h).trim() });
  }
  console.log(`  Age columns: ${ageColumns.map(a => a.label).join(', ')}`);

  // Find Serial # and Parent-Friendly Explanation columns
  const serialIdx = headers.indexOf('Serial #');
  const explanationIdx = headers.indexOf('Parent-Friendly Explanation');

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || !row[3]) continue; // Skip empty rows (need at least curriculum element)

    const curriculumArea = String(row[0] || '').trim();
    const strand = String(row[1] || '').trim();
    const materialLesson = String(row[2] || '').trim();
    const curriculumElement = String(row[3] || '').trim();

    if (!curriculumElement) continue;

    // Determine applicable ages
    const applicableAges = [];
    for (const ac of ageColumns) {
      const val = row[ac.index];
      if (val && String(val).trim().includes('•')) {
        applicableAges.push(ac.label);
      }
    }

    const serialNum = serialIdx >= 0 ? (row[serialIdx] || null) : null;
    let explanation = explanationIdx >= 0 ? (row[explanationIdx] || '') : '';
    explanation = String(explanation).trim();

    // Clean up explanation - remove the repeated area name prefix
    if (explanation.startsWith(curriculumArea + '\n\n')) {
      explanation = explanation.substring(curriculumArea.length).trim();
    }
    if (explanation.startsWith('When your child works on this objective in ' + curriculumArea + ',')) {
      // Keep as is - it's the full explanation
    }

    allSkills.push({
      area: areaKey,
      areaLabel: curriculumArea,
      strand,
      materialLesson,
      skill: curriculumElement,
      applicableAges,
      serialNum: serialNum ? Number(serialNum) : null,
      explanation,
    });
    totalCount++;
  }
}

console.log(`\nTotal skills extracted: ${totalCount}`);

// Stats
const areaCounts = {};
for (const s of allSkills) {
  areaCounts[s.area] = (areaCounts[s.area] || 0) + 1;
}
console.log('\nSkills per area:');
for (const [area, count] of Object.entries(areaCounts)) {
  console.log(`  ${area}: ${count}`);
}

// Generate TypeScript file
let ts = `// Auto-generated from Montessori Foundation Scope & Sequence spreadsheets
// Source: Tim Seldin's Scope & Sequence with Parent-Friendly Explanations

export interface ScopeSequenceSkill {
  area: string
  areaLabel: string
  strand: string
  materialLesson: string
  skill: string
  applicableAges: string[]
  serialNum: number | null
  explanation: string
}

export const SCOPE_SEQUENCE: ScopeSequenceSkill[] = [\n`;

for (const s of allSkills) {
  ts += `  ${JSON.stringify(s)},\n`;
}

ts += `]

// Helper functions

export function getSkillsByArea(area: string): ScopeSequenceSkill[] {
  return SCOPE_SEQUENCE.filter(s => s.area === area)
}

export function getSkillsByStrand(area: string, strand: string): ScopeSequenceSkill[] {
  return SCOPE_SEQUENCE.filter(s => s.area === area && s.strand === strand)
}

export function getStrandsByArea(area: string): string[] {
  const strands = new Set<string>()
  SCOPE_SEQUENCE.filter(s => s.area === area).forEach(s => strands.add(s.strand))
  return Array.from(strands)
}

export function getAllAreas(): { key: string; label: string; count: number }[] {
  const areas = new Map<string, { label: string; count: number }>()
  for (const s of SCOPE_SEQUENCE) {
    const existing = areas.get(s.area)
    if (existing) {
      existing.count++
    } else {
      areas.set(s.area, { label: s.areaLabel, count: 1 })
    }
  }
  return Array.from(areas.entries()).map(([key, { label, count }]) => ({ key, label, count }))
}

export function getSkillsForAge(age: string): ScopeSequenceSkill[] {
  return SCOPE_SEQUENCE.filter(s => s.applicableAges.includes(age))
}

export function searchSkills(query: string): ScopeSequenceSkill[] {
  const q = query.toLowerCase()
  return SCOPE_SEQUENCE.filter(s =>
    s.skill.toLowerCase().includes(q) ||
    s.strand.toLowerCase().includes(q) ||
    s.materialLesson.toLowerCase().includes(q) ||
    s.explanation.toLowerCase().includes(q)
  )
}

// Get a condensed summary for AI context
export function getScopeSequenceSummaryForAI(): string {
  const areas = getAllAreas()
  return areas.map(a => {
    const strands = getStrandsByArea(a.key)
    return \`\${a.label} (\${a.count} skills): \${strands.join(', ')}\`
  }).join('\\n')
}
`;

const outPath = path.join(__dirname, '..', 'lib', 'scope-sequence.ts');
fs.writeFileSync(outPath, ts, 'utf-8');
console.log(`\nWritten to ${outPath}`);
console.log(`File size: ${(fs.statSync(outPath).size / 1024).toFixed(1)} KB`);
