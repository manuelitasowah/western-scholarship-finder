import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileForm from './components/ProfileForm';
import ScholarshipCard from './components/ScholarshipCard';
import { StudentProfile, MatchResult } from './types';
import { SCHOLARSHIPS } from './data/scholarships';
import { matchAllScholarships } from './utils/matcher';
import { TEST_PROFILES } from './utils/testProfiles';
import { 
  Award, 
  GraduationCap, 
  Search, 
  SlidersHorizontal, 
  ArrowLeft, 
  RotateCcw, 
  Sparkles, 
  CheckCircle, 
  BookOpen, 
  Check, 
  Lightbulb, 
  ExternalLink,
  Info
} from 'lucide-react';

interface ValidationAssertion {
  name: string;
  passed: boolean;
  details: string;
}

interface ValidationResult {
  profileName: string;
  description: string;
  totalMatches: number;
  expectedNotes: string;
  assertions: ValidationAssertion[];
}

const runValidationSuite = (): ValidationResult[] => {
  const results: ValidationResult[] = [];

  for (const testProfile of TEST_PROFILES) {
    const matched = matchAllScholarships(testProfile, SCHOLARSHIPS);
    const assertions: ValidationAssertion[] = [];

    // Profile 1 assertions (Sarah Jenkins, Standard 4th Year)
    if (testProfile.name === 'Sarah Jenkins') {
      const firstYearLeaks = matched.filter(m => m.scholarship.firstYearOnly);
      const passed = firstYearLeaks.length === 0;
      assertions.push({
        name: 'Exclude First-Year-Only Awards',
        passed,
        details: passed 
          ? 'Passed: 0 first-year-only awards matched.' 
          : `Failed: Matched ${firstYearLeaks.length} first-year-only awards: ${firstYearLeaks.map(l => l.scholarship.name).join(', ')}`
      });
    }

    // Profile 2 assertions (David Chen, 1st Year Engineering, Need)
    if (testProfile.name === 'David Chen') {
      const matchingNames = matched.map(m => m.scholarship.name);
      const hasSpadotto = matchingNames.some(n => n.includes('Spadotto'));
      const hasBuchanan = matchingNames.some(n => n.includes('E.V. Buchanan'));
      
      const passed = hasSpadotto && !hasBuchanan;
      assertions.push({
        name: 'Match First-Year Target Awards',
        passed,
        details: passed
          ? 'Passed: Successfully matched Spadotto and excluded E.V. Buchanan (GPA 90%+).'
          : `Failed: Spadotto matched: ${hasSpadotto ? 'YES' : 'NO'}, Buchanan matched: ${hasBuchanan ? 'YES' : 'NO'}`
      });
    }

    // Profile 3 assertions (Amina Al-Mansoor, Grad Int'l)
    if (testProfile.name === 'Amina Al-Mansoor') {
      const undergradLeaks = matched.filter(m => m.scholarship.targetDegree === 'Undergraduate');
      const domesticLeaks = matched.filter(m => {
        const citizenships = m.scholarship.targetCitizenships;
        return !citizenships.includes('All') && !citizenships.includes('International student');
      });
      
      const passed = undergradLeaks.length === 0 && domesticLeaks.length === 0;
      assertions.push({
        name: 'Exclude Undergrad & Domestic-Only Awards',
        passed,
        details: passed
          ? 'Passed: 0 undergraduate-only or domestic-only awards matched.'
          : `Failed: Undergrad leaks: ${undergradLeaks.length}, Domestic-only leaks: ${domesticLeaks.length}`
      });
    }

    // Profile 4 assertions (Kateri Brant, Indigenous 2nd year Arts)
    if (testProfile.name === 'Kateri Brant') {
      const matchingNames = matched.map(m => m.scholarship.name);
      const hasNationalIndigenous = matchingNames.some(n => n === 'National Indigenous Scholarship');
      const hasParentsFund = matchingNames.some(n => n === 'The Parents Fund Award In The Faculty of Arts and Humanities');
      
      const passed = !hasNationalIndigenous && hasParentsFund;
      assertions.push({
        name: 'Indigenous & Multi-Year Check',
        passed,
        details: passed
          ? 'Passed: Excluded National Indigenous Scholarship (1st year only) and matched Parents Fund Arts Award.'
          : `Failed: National Indigenous matched: ${hasNationalIndigenous ? 'YES' : 'NO'}, Parents Fund matched: ${hasParentsFund ? 'YES' : 'NO'}`
      });
    }

    // Profile 5 assertions (Alex Miller, 3rd year, low GPA)
    if (testProfile.name === 'Alex Miller') {
      // Alex has 70–74% GPA — scholarships requiring 75%+ should be hard-excluded.
      // Scholarships with minGpaRange '70–74%' are legitimate matches.
      const highGpaLeaks = matched.filter(m => {
        const minGpa = m.scholarship.minGpaRange;
        return minGpa === '75–79%' || minGpa === '80–84%' || minGpa === '85–89%' || minGpa === '90%+';
      });
      const passed = highGpaLeaks.length === 0;
      
      assertions.push({
        name: 'GPA Hard Exclusion Check',
        passed,
        details: passed
          ? `Passed: 0 scholarships requiring GPA above 70–74% matched. Total matches: ${matched.length}.`
          : `Failed: Found ${highGpaLeaks.length} scholarships requiring higher GPA: ${highGpaLeaks.map(m => m.scholarship.name).join(', ')}`
      });
    }

    results.push({
      profileName: testProfile.name,
      description: testProfile.description,
      totalMatches: matched.length,
      expectedNotes: testProfile.expectedNotes,
      assertions
    });
  }

  // Print results to console
  console.log('=== SCHOLARSHIP FINDER VALIDATION SUITE RESULTS ===');
  results.forEach(r => {
    console.log(`Profile: ${r.profileName} (${r.totalMatches} matches)`);
    r.assertions.forEach(a => {
      console.log(`  [${a.passed ? 'PASS' : 'FAIL'}] ${a.name}: ${a.details}`);
    });
  });
  console.log('====================================================');

  return results;
};

export default function App() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[] | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStep, setSearchStep] = useState(0); // For animating matchmaking steps
  
  // Filtering and sorting state for results
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Strong Match' | 'Possible Match' | 'Worth Exploring'>('All');
  const [sortBy, setSortBy] = useState<'score' | 'amount-desc' | 'deadline'>('score');
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Trigger search loading steps
  useEffect(() => {
    if (!isSearching) return;
    
    const interval = setInterval(() => {
      setSearchStep(prev => {
        if (prev >= 3) {
          clearInterval(interval);
          setIsSearching(false);
          return 0;
        }
        return prev + 1;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isSearching]);

  const handleProfileSubmit = (studentProfile: StudentProfile) => {
    setProfile(studentProfile);
    setIsSearching(true);
    setSearchStep(0);
    
    // Calculate matching scholarships
    const matched = matchAllScholarships(studentProfile, SCHOLARSHIPS);
    setResults(matched);

    // Reset filters
    setSelectedCategory('All');
    setSortBy('score');
    setSelectedFacultyFilter('All');
    setSearchQuery('');
  };

  const handleReset = () => {
    setProfile(null);
    setResults([]);
  };

  // Filter and sort results
  const getFilteredAndSortedResults = () => {
    let filtered = [...results];

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(r => 
        r.scholarship.name.toLowerCase().includes(query) ||
        r.scholarship.organization.toLowerCase().includes(query) ||
        r.scholarship.eligibilitySummary.toLowerCase().includes(query)
      );
    }

    // Filter by Category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    // Filter by Faculty SPECIFICITY (optional helpful control)
    if (selectedFacultyFilter !== 'All') {
      filtered = filtered.filter(r => 
        r.scholarship.targetFaculties.includes('All') || 
        r.scholarship.targetFaculties.includes(selectedFacultyFilter)
      );
    }

    // Sorting
    if (sortBy === 'score') {
      filtered.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'amount-desc') {
      // Parse amount string to compare values
      const getVal = (amtStr: string) => {
        const cleaned = amtStr.replace(/[^0-9]/g, '');
        return parseInt(cleaned, 10) || 0;
      };
      filtered.sort((a, b) => getVal(b.scholarship.amount) - getVal(a.scholarship.amount));
    } else if (sortBy === 'deadline') {
      // Sort by simple text or logic. Let's keep score first but add custom sort
      filtered.sort((a, b) => a.scholarship.deadline.localeCompare(b.scholarship.deadline));
    }

    return filtered;
  };

  const finalResults = getFilteredAndSortedResults();

  // Statistics
  const countByCategory = (cat: 'Strong Match' | 'Possible Match' | 'Worth Exploring') => {
    return results.filter(r => r.category === cat).length;
  };

  const getStepText = () => {
    switch (searchStep) {
      case 0: return 'Initializing Rules-Based Matchmaking...';
      case 1: return 'Evaluating academic eligibility and GPA ranks...';
      case 2: return 'Analyzing regional residency and identity quotas...';
      case 3: return 'Calculating extracurricular score vectors...';
      default: return 'Matching...';
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFE] text-gray-800 flex flex-col font-sans">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        
        {/* DEV MODE VALIDATION RUNNER */}
        {import.meta.env.DEV && (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 mb-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-ping" />
                  Dev Mode: Matching Validation Suite
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Run automated checks against the 5 test student profiles to verify rule-based filters and matching correctness.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const res = runValidationSuite();
                  setValidationResults(res);
                  setShowValidation(true);
                }}
                className="bg-[#4F2D7F] hover:bg-[#3d2262] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
              >
                Run Validation Suite
              </button>
            </div>

            {showValidation && validationResults && (
              <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-4 max-h-[300px] overflow-y-auto shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-700">Assertion Results:</span>
                  <button 
                    type="button" 
                    onClick={() => setShowValidation(false)}
                    className="text-[10px] font-bold text-red-500 hover:underline"
                  >
                    Close Results View
                  </button>
                </div>
                <div className="space-y-4">
                  {validationResults.map((result, idx) => (
                    <div key={idx} className="space-y-1.5 border-b border-slate-50 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex justify-between text-xs font-extrabold text-[#4F2D7F]">
                        <span>Profile: {result.profileName} ({result.totalMatches} matches found)</span>
                        <span className="text-slate-400 font-normal">{result.description}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 italic">Expected: {result.expectedNotes}</p>
                      <div className="space-y-1 pl-2">
                        {result.assertions.map((assertion, aIdx) => (
                          <div key={aIdx} className="flex items-start gap-1.5 text-xs">
                            <span className={`font-bold shrink-0 ${assertion.passed ? 'text-green-600' : 'text-red-600'}`}>
                              {assertion.passed ? '✓ PASS' : '✗ FAIL'}
                            </span>
                            <div className="text-slate-700">
                              <strong className="text-slate-800">{assertion.name}:</strong> {assertion.details}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* APP BODY STATE 1: Profile form */}
        {!profile && !isSearching && (
          <div className="space-y-8 animate-fadeIn">
            {/* HERO BANNER */}
            <div className="relative bg-gradient-to-r from-[#4F2D7F] to-[#6c3baf] text-white p-6 md:p-10 rounded-3xl overflow-hidden shadow-md">
              <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
                <svg className="w-full h-full text-[#E8C84A]" viewBox="0 0 100 100" fill="currentColor">
                  <polygon points="50,0 100,35 100,100 0,100 0,35" />
                </svg>
              </div>
              <div className="relative z-10 max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-1.5 bg-[#E8C84A] text-[#4F2D7F] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Student Financial Services Guide</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  Western University Scholarship Matching
                </h2>
                <p className="text-purple-100 text-sm md:text-base leading-relaxed">
                  Enter your program, grades, and extracurricular interests to immediately cross-reference Western awards, provincial bursaries, and national fellowships. No login required.
                </p>
                <div className="flex flex-wrap gap-4 pt-2 text-xs text-purple-200">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-[#E8C84A]" />
                    <span>Real-time score rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-[#E8C84A]" />
                    <span>100% Client-side safe</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-[#E8C84A]" />
                    <span>Official applications & guides</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* PROFILE FORM: 8 columns */}
              <div className="lg:col-span-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                      Build Your Student Profile
                    </h3>
                    <span className="text-xs text-gray-400 font-medium">* Required fields</span>
                  </div>
                  <ProfileForm onSubmit={handleProfileSubmit} />
                </div>
              </div>

              {/* SIDEBAR TIPS: 4 columns */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-5">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                    How Scoring Works
                  </h4>
                  
                  <div className="space-y-4 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 text-[#4F2D7F] p-1.5 rounded-lg shrink-0 font-bold">
                        20%
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">Degree Level Match</p>
                        <p className="text-gray-500">Undergrad vs. Graduate eligibility must be perfect to match.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 text-[#4F2D7F] p-1.5 rounded-lg shrink-0 font-bold">
                        20%
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">Location & Origin</p>
                        <p className="text-gray-500">Aligns with Ontario residency and designated citizenship pools.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 text-[#4F2D7F] p-1.5 rounded-lg shrink-0 font-bold">
                        15%
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">Faculty & Program</p>
                        <p className="text-gray-500">Bonus weight for matching specific faculties or departments.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 text-[#4F2D7F] p-1.5 rounded-lg shrink-0 font-bold">
                        15%
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">Academic Standing (GPA)</p>
                        <p className="text-gray-500">Scored based on meeting or exceeding the award requirements.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 text-[#4F2D7F] p-1.5 rounded-lg shrink-0 font-bold">
                        30%
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">Need, Identity & Activities</p>
                        <p className="text-gray-500">Up to 10% each for meeting targeted demographics, extracurriculars, or financial need guidelines.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* HELP CARD */}
                <div className="bg-gradient-to-br from-purple-900 to-[#4F2D7F] text-white p-6 rounded-2xl shadow-inner space-y-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-[#E8C84A]" />
                    <h4 className="font-bold text-base">Application Advice</h4>
                  </div>
                  <ul className="text-xs text-purple-100 space-y-2.5 list-disc pl-4 leading-relaxed">
                    <li>Be accurate with your <span className="text-[#E8C84A] font-bold">GPA range</span> as most Western awards carry strict audit guidelines.</li>
                    <li>Toggle <span className="text-[#E8C84A] font-bold">Financial Need</span> to on if you expect to be eligible for OSAP or UTAPS support.</li>
                    <li>Highlighting specific identity options can unlock high-value equity and accessibility grants.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* APP BODY STATE 2: Animated Searching Transition */}
        {isSearching && (
          <div className="flex flex-col items-center justify-center py-20 px-4 space-y-6 max-w-lg mx-auto text-center min-h-[450px]">
            <div className="relative">
              {/* Outer spinning dash circle */}
              <div className="w-16 h-16 rounded-full border-4 border-purple-200 border-t-[#4F2D7F] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Search className="w-6 h-6 text-[#4F2D7F] animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-800">Calculating Scholarship Affiliations...</h3>
              <p className="text-sm text-gray-500 font-mono h-6 overflow-hidden">
                {getStepText()}
              </p>
            </div>

            {/* Fake progress dots */}
            <div className="flex items-center gap-1.5 pt-2">
              {[0, 1, 2, 3].map(stepIndex => (
                <div 
                  key={stepIndex} 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    stepIndex <= searchStep ? 'w-6 bg-[#4F2D7F]' : 'w-2 bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* APP BODY STATE 3: Results Display */}
        {profile && !isSearching && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* RESULTS HERO HEADER */}
            <div className="bg-white border border-gray-200 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F2D7F] hover:text-[#3d2262] transition-colors focus:outline-none bg-purple-50 hover:bg-purple-100/70 px-3 py-1.5 rounded-lg"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Modify Student Profile</span>
                </button>
                <div className="space-y-1">
                  <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
                    Custom Matches for <span className="text-[#4F2D7F] border-b-2 border-[#E8C84A]/60 pb-0.5">{profile.fullName}</span>
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">
                    Profile: <span className="font-bold text-gray-700">{profile.yearOfStudy} Year</span> • <span className="font-bold text-gray-700">{profile.faculty}</span> • GPA: <span className="font-bold text-gray-700">{profile.gpaRange}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs py-2.5 px-4 rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Search</span>
                </button>
              </div>
            </div>

            {/* QUICK STATS PANEL */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-purple-900 text-white p-4 rounded-2xl shadow-sm text-center">
                <p className="text-2xl font-black text-[#E8C84A]">{results.length}</p>
                <p className="text-[10px] uppercase font-bold text-purple-200 mt-0.5">Total Matches</p>
              </div>
              <div className="bg-[#4F2D7F] text-white p-4 rounded-2xl shadow-sm text-center">
                <p className="text-2xl font-black text-amber-300">{countByCategory('Strong Match')}</p>
                <p className="text-[10px] uppercase font-bold text-purple-100 mt-0.5">Strong Matches</p>
              </div>
              <div className="bg-indigo-900 text-white p-4 rounded-2xl shadow-sm text-center">
                <p className="text-2xl font-black text-indigo-200">{countByCategory('Possible Match')}</p>
                <p className="text-[10px] uppercase font-bold text-indigo-150 mt-0.5">Possible Matches</p>
              </div>
              <div className="bg-slate-800 text-white p-4 rounded-2xl shadow-sm text-center">
                <p className="text-2xl font-black text-slate-300">{countByCategory('Worth Exploring')}</p>
                <p className="text-[10px] uppercase font-bold text-slate-300 mt-0.5">Worth Exploring</p>
              </div>
            </div>

            {/* FILTER PANEL AND RESULTS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* SIDEBAR COLUMNS: Left 4 columns on desktop */}
              <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-4">
                
                {/* 1. YOUR PROFILE SUMMARY CARD */}
                <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className="p-6 bg-[#4F2D7F] text-white">
                    <h2 className="text-lg font-extrabold tracking-tight">Your Profile</h2>
                    <p className="text-xs text-purple-200">Summary of matched factors</p>
                  </div>
                  <div className="p-6 space-y-5 text-sm font-medium text-slate-700">
                    
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Full Name</label>
                      <p className="font-bold text-slate-900 text-base">{profile.fullName}</p>
                    </div>

                    {/* Year & Faculty */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Year & Faculty</label>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-700 text-xs font-semibold">
                          {profile.yearOfStudy} Year
                        </span>
                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-700 text-xs font-semibold">
                          {profile.faculty}
                        </span>
                      </div>
                    </div>

                    {/* Program */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Program / Major</label>
                      <p className="font-semibold text-slate-800">{profile.programMajor}</p>
                    </div>

                    {/* Academic Status */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Academic Status</label>
                      <div className="p-2.5 border border-purple-100 bg-purple-50/50 rounded-xl flex justify-between items-center">
                        <span className="font-bold text-[#4F2D7F] text-xs">GPA: {profile.gpaRange}</span>
                        <span className="text-[10px] bg-[#4F2D7F] text-white px-2.5 py-0.5 rounded-full uppercase font-black">
                          {profile.gpaRange === '90%+' || profile.gpaRange === '85–89%' ? 'High' : 'Eligible'}
                        </span>
                      </div>
                    </div>

                    {/* Identity & Interests */}
                    {(profile.identities.length > 0 || profile.interests.length > 0 || profile.financialNeed) && (
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Background & Attributes</label>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.financialNeed && (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold">
                              Financial Need
                            </span>
                          )}
                          {profile.identities.map(tag => (
                            <span key={tag} className="px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-medium">
                              {tag}
                            </span>
                          ))}
                          {profile.interests.map(tag => (
                            <span key={tag} className="px-2.5 py-1 bg-purple-50 text-[#4F2D7F] border border-purple-100 rounded-lg text-[11px] font-bold">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Button to go back */}
                    <div className="pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="w-full py-3 bg-[#E8C84A] text-[#4F2D7F] font-black rounded-2xl shadow-sm hover:brightness-105 active:scale-95 transition-all text-xs uppercase tracking-wider text-center cursor-pointer"
                      >
                        Edit Profile Info
                      </button>
                    </div>

                  </div>
                </div>

                {/* 2. REFINE MATCHES FILTERING CONTROLS CARD */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <SlidersHorizontal className="w-4 h-4 text-[#4F2D7F]" />
                    <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-widest">
                      Refine Matches
                    </h3>
                  </div>

                  {/* Search Query Input */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider" htmlFor="search-input">
                      Keyword Search
                    </label>
                    <div className="relative">
                      <input
                        id="search-input"
                        type="text"
                        placeholder="Search name, sponsor, etc..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-700 pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-100 focus:border-[#4F2D7F] focus:outline-none"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold font-mono cursor-pointer"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Category Tabs */}
                  <div className="space-y-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Match Category
                    </span>
                    <div className="space-y-1.5">
                      {[
                        { key: 'All', label: `All Matches (${results.length})` },
                        { key: 'Strong Match', label: `Strong Match (${countByCategory('Strong Match')})` },
                        { key: 'Possible Match', label: `Possible Match (${countByCategory('Possible Match')})` },
                        { key: 'Worth Exploring', label: `Worth Exploring (${countByCategory('Worth Exploring')})` }
                      ].map(tab => (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setSelectedCategory(tab.key as any)}
                          className={`w-full text-left text-xs py-2.5 px-3 rounded-xl font-bold transition-all cursor-pointer ${
                            selectedCategory === tab.key
                              ? 'bg-[#4F2D7F] text-white shadow-sm'
                              : 'hover:bg-slate-50 text-slate-600 border border-transparent hover:border-slate-100'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort Option dropdown */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider" htmlFor="sort-select">
                      Sort Results By
                    </label>
                    <select
                      id="sort-select"
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value as any)}
                      className="w-full text-xs font-semibold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-100 focus:border-[#4F2D7F] focus:outline-none"
                    >
                      <option value="score">Highest Match Score</option>
                      <option value="amount-desc">Highest Award Amount</option>
                      <option value="deadline">Deadline Alphabetical</option>
                    </select>
                  </div>

                  {/* Optional Faculty Sub-Filter */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider" htmlFor="faculty-filter">
                      Faculty Exclusivity
                    </label>
                    <select
                      id="faculty-filter"
                      value={selectedFacultyFilter}
                      onChange={e => setSelectedFacultyFilter(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-100 focus:border-[#4F2D7F] focus:outline-none"
                    >
                      <option value="All">All Faculties / Open</option>
                      <option value="Arts & Humanities">Arts & Humanities</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Science">Science</option>
                      <option value="Social Science">Social Science</option>
                      <option value="Health Sciences">Health Sciences</option>
                      <option value="Information & Media Studies">Information & Media Studies</option>
                      <option value="Music">Music</option>
                      <option value="Business/Ivey">Business/Ivey</option>
                      <option value="Law">Law</option>
                      <option value="Education">Education</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Clear Filters Indicator */}
                  {(selectedCategory !== 'All' || selectedFacultyFilter !== 'All' || searchQuery.trim() !== '') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('All');
                        setSelectedFacultyFilter('All');
                        setSearchQuery('');
                      }}
                      className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl text-center transition-colors focus:outline-none border border-slate-200/60 cursor-pointer"
                    >
                      Clear Active Refinements
                    </button>
                  )}
                </div>

              </div>

              {/* SCHOLARSHIP CARDS LIST: Right 8 columns on desktop */}
              <div className="lg:col-span-8 space-y-6">
                
                {finalResults.length === 0 ? (
                  /* EMPTY STATE */
                  <div className="bg-white border border-gray-200 rounded-3xl p-10 md:p-14 text-center space-y-6 shadow-sm">
                    <div className="bg-purple-100 text-[#4F2D7F] w-14 h-14 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <div className="max-w-md mx-auto space-y-2">
                      <h3 className="text-xl font-bold text-gray-800">No matching scholarships found</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        We couldn't find any scholarships matching score 40+ for the active criteria. This could be due to restrictive faculty selection or lacking matching extracurricular tags.
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 bg-[#4F2D7F] hover:bg-[#3d2262] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow transition-all active:scale-95 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Adjust Your Profile</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* LIST OF SCHOLARSHIPS */
                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-xs text-gray-400 font-mono font-semibold px-1">
                      <span>Showing {finalResults.length} of {results.length} total matches</span>
                      <span>Sorted by {sortBy === 'score' ? 'Relevance' : sortBy === 'amount-desc' ? 'Value' : 'Deadline'}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      {finalResults.map(result => (
                        <ScholarshipCard key={result.scholarship.id} result={result} student={profile} />
                      ))}
                    </div>

                    <div className="bg-amber-50/65 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed font-medium mt-8 shadow-sm flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-800 uppercase text-[10px] tracking-wider block mb-0.5">Official Source Disclaimer:</span>
                        This tool suggests scholarships you may be eligible for. It does not guarantee eligibility, acceptance, or funding. Always verify requirements, application procedures, and deadlines on the official scholarship website before applying.
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
