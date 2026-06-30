import React, { useState } from 'react';
import { StudentProfile, MatchResult } from '../types';
import { Calendar, DollarSign, Building, ExternalLink, ChevronDown, ChevronUp, Check, Info, AlertCircle, Sparkles } from 'lucide-react';
import { generateExplanation } from '../utils/geminiExplain';

interface ScholarshipCardProps {
  key?: string;
  result: MatchResult;
  student: StudentProfile;
}

export default function ScholarshipCard({ result, student }: ScholarshipCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const { scholarship, score, matchFactors, category } = result;

  // Visual styling parameters based on matching classification
  const getCategoryTheme = (cat: typeof category) => {
    switch (cat) {
      case 'Strong Match':
        return {
          leftBorder: 'border-l-8 border-green-500',
          scoreTextColor: 'text-green-600',
          badgeClass: 'bg-green-50 text-green-700',
          badgeText: 'STRONG',
          progressColor: 'bg-green-500',
          rowGlow: 'hover:shadow-green-50/50',
        };
      case 'Possible Match':
        return {
          leftBorder: 'border-l-8 border-blue-400',
          scoreTextColor: 'text-blue-500',
          badgeClass: 'bg-blue-50 text-blue-700',
          badgeText: 'POSSIBLE',
          progressColor: 'bg-blue-500',
          rowGlow: 'hover:shadow-blue-50/50',
        };
      case 'Worth Exploring':
        return {
          leftBorder: 'border-l-8 border-slate-300',
          scoreTextColor: 'text-slate-500',
          badgeClass: 'bg-slate-100 text-slate-700',
          badgeText: 'EXPLORING',
          progressColor: 'bg-slate-400',
          rowGlow: 'hover:shadow-slate-100/50',
        };
    }
  };

  const theme = getCategoryTheme(category);

  // Get active matching factors (positive score contributions)
  const positiveFactors = matchFactors.filter(f => f.points > 0);

  const handleToggleExpand = async () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    
    if (nextExpanded && !explanation && !loadingExplanation) {
      setLoadingExplanation(true);
      try {
        const exp = await generateExplanation(student, result);
        setExplanation(exp);
      } catch (err) {
        console.error('Error loading explanation:', err);
        setExplanation('Failed to load AI explanation. Please check your network connection.');
      } finally {
        setLoadingExplanation(false);
      }
    }
  };

  return (
    <div 
      id={`scholarship-card-${scholarship.id}`}
      className={`bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-all duration-200 ${theme.leftBorder} ${theme.rowGlow}`}
    >
      {/* LEFT BLOCK: Score Column */}
      <div className="w-full md:w-28 flex flex-row md:flex-col items-center justify-between md:justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6 shrink-0 gap-2">
        <div className="flex md:flex-col items-center gap-1.5 md:gap-0">
          <span className={`text-4xl font-black ${theme.scoreTextColor} leading-none tracking-tight`}>
            {score}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mt-0.5">
            Match Score
          </span>
        </div>
        
        <div className={`px-2.5 py-1 ${theme.badgeClass} text-[10px] font-black rounded-md uppercase tracking-wider text-center`}>
          {theme.badgeText}
        </div>
      </div>

      {/* RIGHT BLOCK: Content details */}
      <div className="flex-1 space-y-4">
        
        {/* Title & Organization Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="space-y-1">
            <h3 className="text-lg md:text-xl font-bold text-[#4F2D7F] tracking-tight leading-snug">
              {scholarship.name}
            </h3>
            <p className="text-xs md:text-sm font-semibold text-slate-500">
              {scholarship.organization}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {scholarship.amount === 'See website' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg">
                <AlertCircle className="w-3 h-3" />
                Amount: See website
              </span>
            ) : (
              <span className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                {scholarship.amount}
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Overview Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1 border-t border-slate-50">
          
          {/* Column A: Positive matches */}
          <div className="space-y-2">
            <p className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              Why you matched:
            </p>
            {positiveFactors.length === 0 ? (
              <p className="text-gray-500 italic">Meets fundamental baseline filters.</p>
            ) : (
              <ul className="space-y-1.5">
                {positiveFactors.slice(0, 3).map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 font-medium">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0" />
                    <span>{factor.category} (+{factor.points})</span>
                  </li>
                ))}
                {positiveFactors.length > 3 && (
                  <li className="text-[#4F2D7F] font-bold text-[10px]">
                    + {positiveFactors.length - 3} more matching attributes
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Column B: Metadata Info */}
          <div className="space-y-2">
            <p className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              Deadline:
            </p>
            {scholarship.deadline === 'See website' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg">
                <AlertCircle className="w-3 h-3" />
                Verify on official site
              </span>
            ) : (
              <p className="font-bold text-slate-800 text-sm">{scholarship.deadline}</p>
            )}
            
            <p className="text-slate-400 uppercase font-bold text-[10px] tracking-wider pt-1 block">
              Academic Threshold:
            </p>
            <p className="text-xs text-slate-600 font-medium">
              Requires min GPA of <span className="font-bold text-[#4F2D7F]">{scholarship.minGpaRange}</span>
            </p>

            {scholarship.lastVerified && (
              <p className="text-[10px] text-slate-400 pt-1">
                Data verified: <span className="font-semibold">{scholarship.lastVerified}</span>
              </p>
            )}
          </div>

        </div>

        {/* Eligibility Brief block */}
        <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed font-medium">
          <span className="font-bold text-[#4F2D7F] block mb-0.5 uppercase text-[9px] tracking-wider">Core Eligibility Scope:</span>
          {scholarship.eligibilitySummary}
        </div>

        {/* Buttons / Collapsible trigger */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleToggleExpand}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#4F2D7F] transition-colors focus:outline-none"
          >
            <span>{expanded ? 'Hide full scoring matrix' : 'Show score breakdown'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <a
            href={scholarship.applicationUrl}
            target="_blank"
            referrerPolicy="no-referrer"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[#4F2D7F] hover:text-[#3d2262] font-bold text-sm underline underline-offset-4 decoration-2 decoration-[#E8C84A] hover:decoration-[#4F2D7F] transition-all"
          >
            <span>Apply Online</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Expanded score breakdown */}
        {expanded && (
          <div className="border-t border-slate-100 pt-4 mt-2 space-y-4 animate-fadeIn">
            {/* AI MATCH ADVISOR */}
            <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100/80">
              <span className="font-bold text-[#4F2D7F] block mb-1.5 uppercase text-[10px] tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#E8C84A] fill-[#E8C84A]" />
                AI Match Advisor Explanation
              </span>
              {loadingExplanation ? (
                <div className="space-y-2 py-1 animate-pulse">
                  <div className="h-3 bg-purple-100/70 rounded w-11/12"></div>
                  <div className="h-3 bg-purple-100/70 rounded w-5/6"></div>
                  <div className="h-3 bg-purple-100/70 rounded w-2/3"></div>
                </div>
              ) : (
                <p className="text-xs leading-relaxed text-slate-700 font-medium">
                  {explanation}
                </p>
              )}
            </div>

            <div className="space-y-2">
              {matchFactors.map((factor, index) => {
                const isMatched = factor.points > 0;
                return (
                  <div 
                    key={index} 
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${
                      isMatched 
                        ? 'bg-emerald-50/40 border-emerald-100 text-emerald-950' 
                        : 'bg-slate-50 border-slate-100 text-slate-500 opacity-70'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isMatched ? (
                        <div className="bg-emerald-500 text-white rounded-full p-0.5 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="bg-slate-200 text-slate-400 rounded-full p-0.5 flex items-center justify-center shrink-0">
                          <AlertCircle className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-extrabold tracking-tight uppercase">
                          {factor.category}
                        </span>
                        <span className={`text-xs font-mono font-bold ${isMatched ? 'text-emerald-700' : 'text-slate-400'}`}>
                          +{factor.points} / {factor.maxPoints} pts
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed mt-0.5 font-medium text-slate-600">
                        {factor.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PROGRESS VISUALIZER */}
            <div className="bg-white p-3 rounded-xl border border-slate-150 shadow-inner">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                <span>Calculated Scoring Progress</span>
                <span>{score} / 100 Points</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${theme.progressColor}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
