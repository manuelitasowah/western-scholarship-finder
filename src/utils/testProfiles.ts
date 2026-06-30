import { StudentProfile } from '../types';

export const TEST_PROFILES: (StudentProfile & { name: string; description: string; expectedNotes: string })[] = [
  {
    name: 'Sarah Jenkins',
    description: 'Standard 4th Year Science Student',
    expectedNotes: 'Should NOT see any first-year-only scholarships (e.g., Schecter, TD Engineering, Western Continuing Admission).',
    fullName: 'Sarah Jenkins',
    yearOfStudy: '4th',
    faculty: 'Science',
    programMajor: 'Computer Science',
    gpaRange: '80–84%',
    citizenship: 'Canadian citizen',
    province: 'Ontario',
    financialNeed: false,
    identities: [],
    interests: ['STEM research']
  },
  {
    name: 'David Chen',
    description: 'Incoming 1st Year Engineering, High Need',
    expectedNotes: 'SHOULD see first-year-only awards like Spadotto & Greco Women in Engineering, TD Scholarship in Engineering, and James Emerson Miles.',
    fullName: 'David Chen',
    yearOfStudy: '1st',
    faculty: 'Engineering',
    programMajor: 'Software Engineering',
    gpaRange: '85–89%',
    citizenship: 'Canadian citizen',
    province: 'Ontario',
    financialNeed: true,
    identities: ['Woman'],
    interests: ['Leadership', 'STEM research']
  },
  {
    name: 'Amina Al-Mansoor',
    description: 'International Graduate Engineering Student',
    expectedNotes: 'Should NOT see undergraduate-only or Canadian-citizen-only awards. Should only match Graduate-eligible and open citizenship scholarships.',
    fullName: 'Amina Al-Mansoor',
    yearOfStudy: 'Graduate',
    faculty: 'Engineering',
    programMajor: 'Mechanical Engineering',
    gpaRange: '90%+',
    citizenship: 'International student',
    province: 'Outside Canada',
    financialNeed: false,
    identities: [],
    interests: ['STEM research']
  },
  {
    name: 'Kateri Brant',
    description: 'Indigenous 2nd Year Arts & Humanities, Need',
    expectedNotes: 'Should NOT match Neen Hodgins (which is first-year only) but SHOULD match general Indigenous awards (like Indspire, Cashion Legal).',
    fullName: 'Kateri Brant',
    yearOfStudy: '2nd',
    faculty: 'Arts & Humanities',
    programMajor: 'English Literature',
    gpaRange: '75–79%',
    citizenship: 'Canadian citizen',
    province: 'Ontario',
    financialNeed: true,
    identities: ['Indigenous'],
    interests: ['Volunteering/community service']
  },
  {
    name: 'Alex Miller',
    description: '3rd Year Social Science, Low GPA, General Background',
    expectedNotes: 'Should see few or no Strong Matches (since most awards require 80%+ GPA). Results should be mostly Possible Matches or Worth Exploring.',
    fullName: 'Alex Miller',
    yearOfStudy: '3rd',
    faculty: 'Social Science',
    programMajor: 'Political Science',
    gpaRange: '70–74%',
    citizenship: 'Permanent resident',
    province: 'Other Canadian province',
    financialNeed: false,
    identities: [],
    interests: []
  }
];
