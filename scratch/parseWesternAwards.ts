import * as fs from 'fs';
import * as path from 'path';

// Target types
interface Scholarship {
  id: string;
  name: string;
  organization: string;
  amount: string;
  deadline: string;
  lastVerified: string;
  eligibilitySummary: string;
  applicationUrl: string;
  targetDegree: 'Undergraduate' | 'Graduate' | 'All';
  targetFaculties: string[];
  minGpaRange: '70–74%' | '75–79%' | '80–84%' | '85–89%' | '90%+';
  targetCitizenships: string[];
  targetProvinces: string[];
  requiresFinancialNeed: boolean;
  targetIdentities: string[];
  targetInterests: string[];
}

const inputFilePath = '/Users/manuelita/.gemini/antigravity/brain/08090c75-0791-4149-acb4-90b1340a1635/.system_generated/steps/388/content.md';
const outputFilePath = '/Users/manuelita/antigravity/Western-Scholarship-Finder/src/data/scholarships.ts';

function cleanText(txt: string): string {
  return txt.replace(/\s+/g, ' ').trim();
}

function runParser() {
  console.log('Reading content.md...');
  const fileContent = fs.readFileSync(inputFilePath, 'utf8');

  // Split content by ##### headers
  const parts = fileContent.split('\n##### ');
  console.log(`Found ${parts.length} split sections.`);

  const scholarships: Scholarship[] = [];
  
  // The first part is page header, skip it.
  for (let i = 1; i < parts.length; i++) {
    const rawSection = parts[i];
    const lines = rawSection.split('\n');
    
    // First line is name
    const name = cleanText(lines[0]);
    if (!name || name.toLowerCase().includes('help.cfm')) continue;

    // Join remaining lines to extract blocks
    const bodyText = lines.slice(1).join('\n');

    // Extract Apply By
    const applyByMatch = bodyText.match(/###### APPLY BY:\s*([^\n]+)/i);
    let deadline = applyByMatch ? cleanText(applyByMatch[1]) : 'See website';
    
    // Normalize deadline month casing
    if (deadline !== 'See website') {
      deadline = deadline.charAt(0).toUpperCase() + deadline.slice(1).toLowerCase();
    }

    // Extract Criteria Header
    const criteriaHeaderMatch = bodyText.match(/###### CRITERIA:\s*([^\n]+)/i);
    const criteriaStr = criteriaHeaderMatch ? criteriaHeaderMatch[1].toUpperCase() : '';

    // Extract the description paragraph (usually the last lines after HOW TO APPLY or the criteria bullet list)
    // Find where the criteria list ends. It usually has bullet lists like "- CRITERIA"
    const bodyLines = bodyText.split('\n');
    let descriptionLines: string[] = [];
    let startCollectingDesc = false;

    for (const line of bodyLines) {
      const cleanLine = line.trim();
      if (cleanLine.startsWith('###### HOW TO APPLY:') || cleanLine.startsWith('HOW TO APPLY:')) {
        startCollectingDesc = true;
        continue;
      }
      if (startCollectingDesc) {
        if (cleanLine && !cleanLine.startsWith('######') && !cleanLine.startsWith('-') && !cleanLine.startsWith('[')) {
          descriptionLines.push(cleanLine);
        }
      }
    }

    // Fallback description collection if HOW TO APPLY wasn't matched explicitly
    if (descriptionLines.length === 0) {
      for (const line of bodyLines) {
        const cleanLine = line.trim();
        // Skip header lines, criterion bullet lines, empty lines
        if (cleanLine && 
            !cleanLine.startsWith('#') && 
            !cleanLine.startsWith('-') && 
            !cleanLine.includes('			  			') &&
            !cleanLine.includes('APPLY BY:') &&
            !cleanLine.includes('CRITERIA:')) {
          descriptionLines.push(cleanLine);
        }
      }
    }

    let eligibilitySummary = cleanText(descriptionLines.join(' '));
    if (!eligibilitySummary) {
      eligibilitySummary = 'Awarded to students meeting academic eligibility at Western University. See website for full criteria details.';
    }

    // Extract amount if present in text (e.g. $2,500)
    const amountMatch = eligibilitySummary.match(/\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?/);
    const amount = amountMatch ? amountMatch[0] : 'Value Varies';

    // Map properties based on criteria string and description content
    
    // 1. targetDegree
    let targetDegree: 'Undergraduate' | 'Graduate' | 'All' = 'Undergraduate';
    if (
      criteriaStr.includes('GRADUATE') || 
      criteriaStr.includes('POSTGRADUATE') ||
      criteriaStr.includes('MEDICAL RESIDENT') ||
      name.toLowerCase().includes('postgraduate') ||
      eligibilitySummary.toLowerCase().includes('graduate student') ||
      eligibilitySummary.toLowerCase().includes('postgraduate') ||
      eligibilitySummary.toLowerCase().includes('medical resident')
    ) {
      targetDegree = 'Graduate';
    } else if (criteriaStr.includes('GRADUATING YEAR')) {
      // Typically final year undergrads
      targetDegree = 'Undergraduate';
    }

    // 2. minGpaRange
    let minGpaRange: '70–74%' | '75–79%' | '80–84%' | '85–89%' | '90%+' = '70–74%';
    if (criteriaStr.includes('MIN 90% AVERAGE') || criteriaStr.includes('MIN A AVERAGE')) {
      minGpaRange = '90%+';
    } else if (criteriaStr.includes('MIN 85% AVERAGE') || criteriaStr.includes('MIN 87% AVERAGE')) {
      minGpaRange = '85–89%';
    } else if (criteriaStr.includes('MIN 80% AVERAGE') || criteriaStr.includes('MIN B+ AVERAGE') || criteriaStr.includes('MIN 78% AVERAGE')) {
      minGpaRange = '80–84%';
    } else if (criteriaStr.includes('MIN 75% AVERAGE') || criteriaStr.includes('MIN B AVERAGE')) {
      minGpaRange = '75–79%';
    } else if (criteriaStr.includes('MIN 70% AVERAGE')) {
      minGpaRange = '70–74%';
    }

    // 3. targetCitizenships
    let targetCitizenships = ['All'];
    if (criteriaStr.includes('INTERNATIONAL STUDENT ONLY') || eligibilitySummary.toLowerCase().includes('international student')) {
      targetCitizenships = ['International student'];
    } else if (criteriaStr.includes('CANADIAN CITIZEN OR PERM RES') || criteriaStr.includes('CANADIAN CITIZEN') || eligibilitySummary.toLowerCase().includes('canadian citizen')) {
      targetCitizenships = ['Canadian citizen', 'Permanent resident'];
    }

    // 4. targetProvinces
    let targetProvinces = ['All'];
    if (eligibilitySummary.toLowerCase().includes('ontario resident') || eligibilitySummary.toLowerCase().includes('ontario residency')) {
      targetProvinces = ['Ontario'];
    }

    // 5. requiresFinancialNeed
    const requiresFinancialNeed = criteriaStr.includes('FINANCIAL NEED') || eligibilitySummary.toLowerCase().includes('financial need');

    // 6. targetIdentities
    const targetIdentities: string[] = [];
    if (criteriaStr.includes('INDIGENOUS STUDENTS') || eligibilitySummary.toLowerCase().includes('indigenous ancestry') || eligibilitySummary.toLowerCase().includes('first nations')) {
      targetIdentities.push('Indigenous');
    }
    if (criteriaStr.includes('BLACK STUDENTS') || eligibilitySummary.toLowerCase().includes('black student') || eligibilitySummary.toLowerCase().includes('african descent')) {
      targetIdentities.push('Black student');
    }
    if (criteriaStr.includes('LGBTQ') || eligibilitySummary.toLowerCase().includes('2slgbtqi+') || eligibilitySummary.toLowerCase().includes('lgbtq')) {
      targetIdentities.push('LGBTQ2S+');
    }
    if (criteriaStr.includes('FEMALE STUDENTS') || eligibilitySummary.toLowerCase().includes('female student') || eligibilitySummary.toLowerCase().includes('women')) {
      targetIdentities.push('Woman');
    }
    if (criteriaStr.includes('DISABILITY') || criteriaStr.includes('DISABLED') || eligibilitySummary.toLowerCase().includes('disabilit')) {
      targetIdentities.push('Student with disability');
    }
    if (eligibilitySummary.toLowerCase().includes('first-generation') || eligibilitySummary.toLowerCase().includes('first generation')) {
      targetIdentities.push('First-generation student');
    }
    if (eligibilitySummary.toLowerCase().includes('heritage') || eligibilitySummary.toLowerCase().includes('descent') || eligibilitySummary.toLowerCase().includes('ancestry')) {
      // Check if it's already got general tags, otherwise add the general heritage tag
      if (!targetIdentities.includes('Indigenous') && !targetIdentities.includes('Black student')) {
        targetIdentities.push('Specific cultural/heritage background');
      }
    }

    // 7. targetInterests
    const targetInterests: string[] = [];
    if (criteriaStr.includes('LEADERSHIP') || eligibilitySummary.toLowerCase().includes('leadership')) {
      targetInterests.push('Leadership');
    }
    if (criteriaStr.includes('VOLUNTEER') || criteriaStr.includes('COMMUNITY ACTIVITIES') || eligibilitySummary.toLowerCase().includes('volunteering') || eligibilitySummary.toLowerCase().includes('community service')) {
      targetInterests.push('Volunteering/community service');
    }
    if (criteriaStr.includes('ATHLETE') || criteriaStr.includes('SPORT') || criteriaStr.includes('FOOTBALL') || criteriaStr.includes('HOCKEY') || criteriaStr.includes('RUGBY') || eligibilitySummary.toLowerCase().includes('varsity athlete')) {
      targetInterests.push('Athletics');
    }
    if (criteriaStr.includes('CREATIVE EXCELLENCE') || criteriaStr.includes('MUSIC') || eligibilitySummary.toLowerCase().includes('performing arts') || eligibilitySummary.toLowerCase().includes('creative writing')) {
      targetInterests.push('Arts/music');
    }
    if (criteriaStr.includes('RESEARCH') || eligibilitySummary.toLowerCase().includes('research paper') || eligibilitySummary.toLowerCase().includes('fieldwork')) {
      targetInterests.push('STEM research');
    }

    // 8. targetFaculties
    const targetFaculties: string[] = [];
    const facultyMap: Record<string, string> = {
      'ARTS & HUMANITIES': 'Arts & Humanities',
      'ENGINEERING': 'Engineering',
      'SCIENCE': 'Science',
      'SOCIAL SCIENCE': 'Social Science',
      'HEALTH SCIENCES': 'Health Sciences',
      'INFORMATION & MEDIA STUDIES': 'Information & Media Studies',
      'MUSIC': 'Music',
      'IVEY': 'Business/Ivey',
      'LAW': 'Law',
      'EDUCATION': 'Education'
    };

    let mappedFaculty = false;
    for (const [key, value] of Object.entries(facultyMap)) {
      if (criteriaStr.includes(key) || eligibilitySummary.toUpperCase().includes(key)) {
        targetFaculties.push(value);
        mappedFaculty = true;
      }
    }
    if (!mappedFaculty) {
      targetFaculties.push('All');
    }

    // firstYearOnly tag
    const firstYearOnly = criteriaStr.includes('ADMISSION') || eligibilitySummary.toLowerCase().includes('entering year 1') || eligibilitySummary.toLowerCase().includes('entering their first year');

    // Create unique ID
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Skip discontinued/inactive/historical awards
    const nameLower = name.toLowerCase();
    if (nameLower.includes('discontinued') || nameLower.includes('inactive') || nameLower.includes('suspended')) {
      continue;
    }

    // Skip if "no application required"
    const summaryLower = eligibilitySummary.toLowerCase();
    if (
      summaryLower.includes('no application required') || 
      summaryLower.includes('no application is required') ||
      summaryLower.includes('no separate application') ||
      summaryLower.includes('awarded automatically') ||
      eligibilitySummary === 'No Application required.'
    ) {
      continue;
    }

    // Skip if description is just a dump of uppercase criteria words (indicating no actual description text exists)
    // We check if more than 85% of characters in the description are uppercase.
    const uppercaseLetters = (eligibilitySummary.match(/[A-Z]/g) || []).length;
    const totalLetters = (eligibilitySummary.match(/[a-zA-Z]/g) || []).length;
    if (totalLetters > 10 && (uppercaseLetters / totalLetters) > 0.85) {
      continue;
    }

    // Skip if there's no mention of any application step, form, submit, apply, or docdrop
    // (This filters out vague archives that don't tell the student how to apply)
    const hasApplicationSteps = 
      summaryLower.includes('apply') || 
      summaryLower.includes('submit') || 
      summaryLower.includes('application') || 
      summaryLower.includes('essay') || 
      summaryLower.includes('statement') || 
      summaryLower.includes('docdrop') || 
      summaryLower.includes('nomination') || 
      summaryLower.includes('finaid') || 
      summaryLower.includes('financial assistance');

    if (!hasApplicationSteps) {
      continue;
    }

    scholarships.push({
      id,
      name,
      organization: 'Western University',
      amount,
      deadline,
      lastVerified: 'June 2026',
      eligibilitySummary,
      applicationUrl: 'https://studentservices.uwo.ca/secure/Awards/awardMain.cfm',
      targetDegree,
      targetFaculties,
      minGpaRange,
      targetCitizenships,
      targetProvinces,
      requiresFinancialNeed,
      targetIdentities,
      targetInterests,
      ...(firstYearOnly ? { firstYearOnly: true } : {})
    } as any);
  }

  console.log(`Parsed ${scholarships.length} scholarships.`);

  // Write to scholarships.ts file
  const codeContent = `import { Scholarship } from '../types';

export const SCHOLARSHIPS: Scholarship[] = ${JSON.stringify(scholarships, null, 2)};
`;

  fs.writeFileSync(outputFilePath, codeContent);
  console.log('Successfully wrote src/data/scholarships.ts');
}

runParser();
