import { StudentProfile, Scholarship, MatchResult, MatchFactor } from '../types';

const GPA_RANKS: Record<string, number> = {
  '70–74%': 1,
  '75–79%': 2,
  '80–84%': 3,
  '85–89%': 4,
  '90%+': 5,
};

export function scoreScholarship(student: StudentProfile, scholarship: Scholarship): MatchResult | null {
  // --- HARD EXCLUSIONS ---
  
  // 1. Expired deadlines
  if (scholarship.isExpired) {
    return null;
  }

  // 2. Degree level mismatch
  const isStudentUndergrad = ['1st', '2nd', '3rd', '4th'].includes(student.yearOfStudy);
  const isStudentGrad = student.yearOfStudy === 'Graduate';
  
  if (scholarship.targetDegree === 'Undergraduate' && !isStudentUndergrad) {
    return null;
  }
  if (scholarship.targetDegree === 'Graduate' && !isStudentGrad) {
    return null;
  }

  // 3. First-year-only awards — hard exclude if student is not in 1st year
  if (scholarship.firstYearOnly && student.yearOfStudy !== '1st') {
    return null;
  }

  // 4. Citizenship mismatch - hard exclude if scholarship specifies citizenship targets and student doesn't match
  const isCitizenshipMatch = scholarship.targetCitizenships.includes('All') || scholarship.targetCitizenships.includes(student.citizenship);
  if (!isCitizenshipMatch) {
    return null;
  }

  // 5. Province mismatch - hard exclude if scholarship specifies province targets and student doesn't match
  const isProvinceMatch = scholarship.targetProvinces.includes('All') || scholarship.targetProvinces.includes(student.province);
  if (!isProvinceMatch) {
    return null;
  }

  // 6. GPA mismatch - hard exclude if student's GPA is below the scholarship minimum requirement
  const studentGpaRank = GPA_RANKS[student.gpaRange] || 0;
  const scholarshipMinGpaRank = GPA_RANKS[scholarship.minGpaRange] || 0;
  if (studentGpaRank < scholarshipMinGpaRank) {
    return null;
  }

  // 7. Identity mismatch — hard exclude if scholarship requires specific identities
  // and the student has NONE of them. If targetIdentities is empty, it's open to all.
  if (scholarship.targetIdentities.length > 0) {
    const studentHasRequiredIdentity = scholarship.targetIdentities.some(
      identity => student.identities.includes(identity)
    );
    if (!studentHasRequiredIdentity) {
      return null;
    }
  }

  const matchFactors: MatchFactor[] = [];
  let totalScore = 0;

  // --- SCORING RULES ---

  // 1. Degree level matches: +20
  // Since we already passed the exclusion, the student definitely matches or fits the target.
  const degreePoints = 20;
  totalScore += degreePoints;
  matchFactors.push({
    category: 'Degree Level',
    points: degreePoints,
    maxPoints: 20,
    description: `Matches ${scholarship.targetDegree === 'All' ? 'any degree level' : `${scholarship.targetDegree} level studies`}.`
  });

  // 2. Location matches: +20
  // Hard exclusions above already guarantee citizenship and province match,
  // so if we reach here, the student fully matches.
  const locationPoints = 20;
  totalScore += locationPoints;
  matchFactors.push({
    category: 'Location & Citizenship',
    points: locationPoints,
    maxPoints: 20,
    description: 'Fully matches regional residency and citizenship requirements.'
  });

  // 3. Field of study matches student's faculty: +15
  const isFacultyMatch = scholarship.targetFaculties.includes('All') || scholarship.targetFaculties.includes(student.faculty);
  const facultyPoints = isFacultyMatch ? 15 : 0;
  totalScore += facultyPoints;
  matchFactors.push({
    category: 'Faculty / Field of Study',
    points: facultyPoints,
    maxPoints: 15,
    description: isFacultyMatch 
      ? `Matches your faculty (${student.faculty}).` 
      : `Designed for other faculties (Target: ${scholarship.targetFaculties.join(', ')}).`
  });

  // 4. GPA requirement met: +15
  // Hard exclusion above already guarantees student GPA >= scholarship minimum,
  // so if we reach here, GPA is met.
  const gpaPoints = 15;
  totalScore += gpaPoints;
  matchFactors.push({
    category: 'Academic Standing (GPA)',
    points: gpaPoints,
    maxPoints: 15,
    description: `Your GPA (${student.gpaRange}) meets or exceeds the minimum requirement of ${scholarship.minGpaRange}.`
  });

  // 5. Financial need matches: +10
  // "Financial need matches: +10"
  // If the scholarship requires financial need, student must have selected 'yes'.
  // If the scholarship does not require financial need, all students match it (and get the +10).
  let financialPoints = 0;
  let financialDesc = '';
  
  if (!scholarship.requiresFinancialNeed) {
    financialPoints = 10;
    financialDesc = 'Open to all students regardless of financial need status.';
  } else if (scholarship.requiresFinancialNeed && student.financialNeed) {
    financialPoints = 10;
    financialDesc = 'Matches your demonstrated financial need.';
  } else {
    financialPoints = 0;
    financialDesc = 'Requires demonstrated financial need (you selected No).';
  }
  
  totalScore += financialPoints;
  matchFactors.push({
    category: 'Financial Need',
    points: financialPoints,
    maxPoints: 10,
    description: financialDesc
  });

  // 6. Identity tags match: +10
  // If targetIdentities is empty, it's open to all (+10).
  // Otherwise, if student has at least one matching identity, they get +10.
  let identityPoints = 0;
  let identityDesc = '';
  
  if (scholarship.targetIdentities.length === 0) {
    identityPoints = 10;
    identityDesc = 'Open to all students regardless of demographic backgrounds.';
  } else {
    const matchingIdentities = scholarship.targetIdentities.filter(idTag => student.identities.includes(idTag));
    if (matchingIdentities.length > 0) {
      identityPoints = 10;
      identityDesc = `Matches background tags: ${matchingIdentities.join(', ')}.`;
    } else {
      identityPoints = 0;
      identityDesc = `Aims to support specific student backgrounds: ${scholarship.targetIdentities.join(', ')}.`;
    }
  }
  
  totalScore += identityPoints;
  matchFactors.push({
    category: 'Identity & Background',
    points: identityPoints,
    maxPoints: 10,
    description: identityDesc
  });

  // 7. Activities/interests match: +10
  // If targetInterests is empty, it's open to all (+10).
  // Otherwise, if student has at least one matching interest, they get +10.
  let interestPoints = 0;
  let interestDesc = '';
  
  if (scholarship.targetInterests.length === 0) {
    interestPoints = 10;
    interestDesc = 'Open to all interests and extracurricular profiles.';
  } else {
    const matchingInterests = scholarship.targetInterests.filter(intTag => student.interests.includes(intTag));
    if (matchingInterests.length > 0) {
      interestPoints = 10;
      interestDesc = `Matches your interests: ${matchingInterests.join(', ')}.`;
    } else {
      interestPoints = 0;
      interestDesc = `Looking for experience in: ${scholarship.targetInterests.join(', ')}.`;
    }
  }
  
  totalScore += interestPoints;
  matchFactors.push({
    category: 'Interests & Activities',
    points: interestPoints,
    maxPoints: 10,
    description: interestDesc
  });

  // Filter out any matches scoring less than 40
  if (totalScore < 40) {
    return null;
  }

  // Determine Category Group
  let category: 'Strong Match' | 'Possible Match' | 'Worth Exploring';
  if (totalScore >= 80) {
    category = 'Strong Match';
  } else if (totalScore >= 60) {
    category = 'Possible Match';
  } else {
    category = 'Worth Exploring';
  }

  return {
    scholarship,
    score: totalScore,
    matchFactors,
    category
  };
}

export function matchAllScholarships(student: StudentProfile, scholarships: Scholarship[]): MatchResult[] {
  const results: MatchResult[] = [];
  
  for (const s of scholarships) {
    const res = scoreScholarship(student, s);
    if (res !== null) {
      results.push(res);
    }
  }
  
  // Sort from highest to lowest score
  return results.sort((a, b) => b.score - a.score);
}
