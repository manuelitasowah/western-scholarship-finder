import React from 'react';
import { Award, GraduationCap } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-[#4F2D7F] text-white border-b-4 border-[#E8C84A] shadow-md py-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#E8C84A] p-2.5 rounded-xl text-[#4F2D7F] shadow-inner flex items-center justify-center">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Western <span className="text-[#E8C84A]">Scholarship</span> Finder
            </h1>
            <p className="text-purple-200 text-sm font-medium mt-0.5">
              Discover funding opportunities customized to your academic and personal profile
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-purple-900/50 px-4 py-2 rounded-full border border-purple-500/30 text-xs text-purple-100 self-start md:self-auto font-mono">
          <Award className="w-4 h-4 text-[#E8C84A]" />
          <span>Rules-Based Matching Engine v1.2</span>
        </div>
      </div>
    </header>
  );
}
