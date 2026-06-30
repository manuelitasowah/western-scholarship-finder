import React from 'react';
import { HelpCircle, ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 px-4 mt-16 text-center text-sm text-gray-500">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-start md:items-center justify-center gap-3 bg-amber-50 text-amber-900 px-4 py-4 rounded-xl border border-amber-200 text-left md:text-center text-xs md:text-sm shadow-sm max-w-2xl mx-auto">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 md:mt-0" />
          <p className="font-medium leading-relaxed">
            <span className="font-bold">Disclaimer:</span> This tool suggests scholarships you may be eligible for. Always verify requirements on the official website before applying.
          </p>
        </div>
        
        <div className="pt-4 border-t border-gray-200/60 text-xs text-gray-400 space-y-1">
          <p>© {new Date().getFullYear()} Western Scholarship Finder. Created for Western University Students.</p>
          <p className="flex items-center justify-center gap-1">
            <span>Powered by the western-style rules-based score matching framework.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
