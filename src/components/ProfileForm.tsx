import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { User, BookOpen, GraduationCap, Globe, Award, Heart, CheckCircle2 } from 'lucide-react';

interface ProfileFormProps {
  onSubmit: (profile: StudentProfile) => void;
  initialProfile?: StudentProfile;
}

const DEFAULT_PROFILE: StudentProfile = {
  fullName: '',
  yearOfStudy: '1st',
  faculty: 'Arts & Humanities',
  programMajor: '',
  gpaRange: '80–84%',
  citizenship: 'Canadian citizen',
  province: 'Ontario',
  financialNeed: false,
  identities: [],
  interests: [],
};

const FACULTIES = [
  'Arts & Humanities',
  'Engineering',
  'Science',
  'Social Science',
  'Health Sciences',
  'Information & Media Studies',
  'Music',
  'Business/Ivey',
  'Law',
  'Education',
  'Other',
];

const IDENTITIES = [
  'Indigenous',
  'Black student',
  'Woman',
  'LGBTQ2S+',
  'Student with disability',
  'First-generation student',
  'Specific cultural/heritage background',
];

const INTERESTS = [
  'Leadership',
  'Volunteering/community service',
  'Athletics',
  'Arts/music',
  'STEM research',
  'Entrepreneurship',
];

export default function ProfileForm({ onSubmit, initialProfile }: ProfileFormProps) {
  const [profile, setProfile] = useState<StudentProfile>(initialProfile || DEFAULT_PROFILE);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: keyof StudentProfile, value: any) => {
    setProfile(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const handleIdentityChange = (idTag: string) => {
    let newIdentities = [...profile.identities];
    if (idTag === 'None/prefer not to say') {
      newIdentities = [];
    } else {
      if (newIdentities.includes(idTag)) {
        newIdentities = newIdentities.filter(x => x !== idTag);
      } else {
        newIdentities.push(idTag);
      }
    }
    handleChange('identities', newIdentities);
  };

  const handleInterestChange = (interestTag: string) => {
    let newInterests = [...profile.interests];
    if (newInterests.includes(interestTag)) {
      newInterests = newInterests.filter(x => x !== interestTag);
    } else {
      newInterests.push(interestTag);
    }
    handleChange('interests', newInterests);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!profile.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.';
    }
    if (!profile.programMajor.trim()) {
      newErrors.programMajor = 'Please enter your program or major.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(profile);
    } else {
      // Scroll to error if possible
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        document.getElementById(firstError)?.focus();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 md:p-8 rounded-2xl border border-gray-200/80 shadow-sm" id="scholarship-profile-form">
      {/* SECTION 1: PERSONAL INFORMATION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <User className="w-5 h-5 text-[#4F2D7F]" />
          <h2 className="text-lg font-bold text-gray-800">1. Personal Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5" htmlFor="fullName">
              Full Name *
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="e.g., Jane Mustang"
              value={profile.fullName}
              onChange={e => handleChange('fullName', e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.fullName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-200 focus:border-[#4F2D7F]'
              } focus:ring-4 focus:outline-none transition-all duration-200 text-sm`}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5" htmlFor="yearOfStudy">
              Year of Study
            </label>
            <select
              id="yearOfStudy"
              value={profile.yearOfStudy}
              onChange={e => handleChange('yearOfStudy', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-4 focus:ring-purple-200 focus:border-[#4F2D7F] focus:outline-none transition-all duration-200 text-sm bg-white"
            >
              <option value="1st">1st Year Undergraduate</option>
              <option value="2nd">2nd Year Undergraduate</option>
              <option value="3rd">3rd Year Undergraduate</option>
              <option value="4th">4th Year Undergraduate</option>
              <option value="Graduate">Graduate Studies (Master/PhD)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 2: ACADEMIC PROFILE */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <BookOpen className="w-5 h-5 text-[#4F2D7F]" />
          <h2 className="text-lg font-bold text-gray-800">2. Academic Profile</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5" htmlFor="faculty">
              Faculty
            </label>
            <select
              id="faculty"
              value={profile.faculty}
              onChange={e => handleChange('faculty', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-4 focus:ring-purple-200 focus:border-[#4F2D7F] focus:outline-none transition-all duration-200 text-sm bg-white"
            >
              {FACULTIES.map(fac => (
                <option key={fac} value={fac}>{fac}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5" htmlFor="programMajor">
              Program / Major *
            </label>
            <input
              id="programMajor"
              type="text"
              placeholder="e.g., Computer Science, Economics"
              value={profile.programMajor}
              onChange={e => handleChange('programMajor', e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.programMajor ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-200 focus:border-[#4F2D7F]'
              } focus:ring-4 focus:outline-none transition-all duration-200 text-sm`}
            />
            {errors.programMajor && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.programMajor}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5" htmlFor="gpaRange">
              GPA Range
            </label>
            <select
              id="gpaRange"
              value={profile.gpaRange}
              onChange={e => handleChange('gpaRange', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-4 focus:ring-purple-200 focus:border-[#4F2D7F] focus:outline-none transition-all duration-200 text-sm bg-white"
            >
              <option value="70–74%">70–74% (B- / B)</option>
              <option value="75–79%">75–79% (B+)</option>
              <option value="80–84%">80–84% (A-)</option>
              <option value="85–89%">85–89% (A)</option>
              <option value="90%+">90%+ (A+ / Outstanding)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3: CITIZENSHIP & RESIDENCY */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Globe className="w-5 h-5 text-[#4F2D7F]" />
          <h2 className="text-lg font-bold text-gray-800">3. Citizenship & Residence</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5" htmlFor="citizenship">
              Canadian Citizenship Status
            </label>
            <select
              id="citizenship"
              value={profile.citizenship}
              onChange={e => handleChange('citizenship', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-4 focus:ring-purple-200 focus:border-[#4F2D7F] focus:outline-none transition-all duration-200 text-sm bg-white"
            >
              <option value="Canadian citizen">Canadian Citizen</option>
              <option value="Permanent resident">Permanent Resident</option>
              <option value="International student">International Student</option>
              <option value="Protected/refugee status">Protected / Refugee Status</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5" htmlFor="province">
              Province of Origin
            </label>
            <select
              id="province"
              value={profile.province}
              onChange={e => handleChange('province', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-4 focus:ring-purple-200 focus:border-[#4F2D7F] focus:outline-none transition-all duration-200 text-sm bg-white"
            >
              <option value="Ontario">Ontario</option>
              <option value="Other Canadian province">Other Canadian Province</option>
              <option value="Outside Canada">Outside Canada</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 4: FINANCIAL NEED */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Heart className="w-5 h-5 text-[#4F2D7F]" />
          <h2 className="text-lg font-bold text-gray-800">4. Financial Standing</h2>
        </div>

        <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-purple-950">Demonstrated Financial Need</h3>
            <p className="text-xs text-purple-700/80 mt-0.5 leading-relaxed">
              Do you have a demonstrated shortfall in funding your university studies? (e.g. qualify for OSAP, student loans, or have high household expense ratios)
            </p>
          </div>
          <div className="flex items-center shrink-0">
            <button
              type="button"
              id="financialNeedToggle"
              onClick={() => handleChange('financialNeed', !profile.financialNeed)}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4F2D7F] focus:ring-offset-2 ${
                profile.financialNeed ? 'bg-[#4F2D7F]' : 'bg-gray-250'
              }`}
            >
              <span className="sr-only">Toggle Financial Need</span>
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  profile.financialNeed ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="ml-3 text-sm font-bold text-gray-700">
              {profile.financialNeed ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 5: IDENTITY & BACKGROUND */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Award className="w-5 h-5 text-[#4F2D7F]" />
          <h2 className="text-lg font-bold text-gray-800">5. Identity & Background</h2>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed -mt-1">
          Some scholarships are specifically earmarked to support historically underrepresented or specific groups. Select all that apply:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {IDENTITIES.map(idTag => {
            const isSelected = profile.identities.includes(idTag);
            return (
              <label
                key={idTag}
                id={`identity-${idTag.replace(/\s+/g, '-').toLowerCase()}`}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                  isSelected 
                    ? 'border-[#4F2D7F] bg-purple-50/40 shadow-sm font-semibold text-[#4F2D7F]' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 text-gray-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleIdentityChange(idTag)}
                  className="mt-0.5 rounded text-[#4F2D7F] focus:ring-purple-200 h-4.5 w-4.5 border-gray-300"
                />
                <span className="text-sm select-none">{idTag}</span>
              </label>
            );
          })}
          
          <label
            id="identity-none"
            className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
              profile.identities.length === 0 
                ? 'border-[#4F2D7F] bg-purple-50/40 shadow-sm font-semibold text-[#4F2D7F]' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 text-gray-700'
            }`}
          >
            <input
              type="checkbox"
              checked={profile.identities.length === 0}
              onChange={() => handleIdentityChange('None/prefer not to say')}
              className="mt-0.5 rounded text-[#4F2D7F] focus:ring-purple-200 h-4.5 w-4.5 border-gray-300"
            />
            <span className="text-sm select-none">None/prefer not to say</span>
          </label>
        </div>
      </div>

      {/* SECTION 6: INTERESTS & ACTIVITIES */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <CheckCircle2 className="w-5 h-5 text-[#4F2D7F]" />
          <h2 className="text-lg font-bold text-gray-800">6. Interests & Activities</h2>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed -mt-1">
          Select areas where you have active extracurricular experience, leadership involvement, or strong personal pursuits:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {INTERESTS.map(interestTag => {
            const isSelected = profile.interests.includes(interestTag);
            return (
              <label
                key={interestTag}
                id={`interest-${interestTag.replace(/\s+/g, '-').toLowerCase()}`}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                  isSelected 
                    ? 'border-[#4F2D7F] bg-purple-50/40 shadow-sm font-semibold text-[#4F2D7F]' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 text-gray-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleInterestChange(interestTag)}
                  className="mt-0.5 rounded text-[#4F2D7F] focus:ring-purple-200 h-4.5 w-4.5 border-gray-300"
                />
                <span className="text-sm select-none">{interestTag}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* SUBMIT ACTION BUTTON */}
      <div className="pt-4">
        <button
          type="submit"
          id="find-scholarships-btn"
          className="w-full py-4 px-6 text-white font-bold text-lg rounded-xl bg-[#4F2D7F] hover:bg-[#3d2262] border-b-4 border-purple-900 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-150 cursor-pointer text-center flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 active:translate-y-0 active:border-b-0"
        >
          <span>Find Scholarships</span>
          <span className="text-[#E8C84A]">★</span>
        </button>
      </div>
    </form>
  );
}
