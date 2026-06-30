export interface StudentProfile {
  fullName: string;
  yearOfStudy: '1st' | '2nd' | '3rd' | '4th' | 'Graduate';
  faculty: 'Arts & Humanities' | 'Engineering' | 'Science' | 'Social Science' | 'Health Sciences' | 'Information & Media Studies' | 'Music' | 'Business/Ivey' | 'Law' | 'Education' | 'Other';
  programMajor: string;
  gpaRange: '70–74%' | '75–79%' | '80–84%' | '85–89%' | '90%+';
  citizenship: 'Canadian citizen' | 'Permanent resident' | 'International student' | 'Protected/refugee status';
  province: 'Ontario' | 'Other Canadian province' | 'Outside Canada';
  financialNeed: boolean;
  identities: string[]; // 'Indigenous', 'Black student', 'Woman', 'LGBTQ2S+', 'Student with disability', 'First-generation student', 'Specific cultural/heritage background'
  interests: string[]; // 'Leadership', 'Volunteering/community service', 'Athletics', 'Arts/music', 'STEM research', 'Entrepreneurship'
}

export interface Scholarship {
  id: string;
  name: string;
  organization: string;
  amount: string;
  deadline: string;
  isExpired?: boolean;
  firstYearOnly?: boolean; // Hard exclude if student is not in 1st year
  lastVerified?: string; // e.g. "June 2026" — when this entry was last checked against the source
  eligibilitySummary: string;
  applicationUrl: string;
  
  // Rule checks
  targetDegree: 'Undergraduate' | 'Graduate' | 'All';
  targetFaculties: string[]; // e.g. ["Science", "Engineering"] or ["All"]
  minGpaRange: '70–74%' | '75–79%' | '80–84%' | '85–89%' | '90%+';
  targetCitizenships: string[]; // e.g. ["Canadian citizen", "Permanent resident"] or ["All"]
  targetProvinces: string[]; // e.g. ["Ontario"] or ["All"]
  requiresFinancialNeed: boolean;
  targetIdentities: string[]; // e.g. ["Woman"] or [] (means open to all)
  targetInterests: string[]; // e.g. ["Leadership"] or [] (means open to all)
}

export interface MatchFactor {
  category: string;
  points: number;
  maxPoints: number;
  description: string;
}

export interface MatchResult {
  scholarship: Scholarship;
  score: number;
  matchFactors: MatchFactor[];
  category: 'Strong Match' | 'Possible Match' | 'Worth Exploring';
}
