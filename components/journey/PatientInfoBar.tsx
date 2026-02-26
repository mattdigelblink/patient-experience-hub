'use client';

import { ExternalLink } from 'lucide-react';
import type { Journey } from '@/types/journey';

interface PatientInfoBarProps {
  journey: Journey;
}

export function PatientInfoBar({ journey }: PatientInfoBarProps) {
  const { patientInfo, metadata } = journey;

  // Calculate age from DOB
  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDOB = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatPhoneNumber = (phone: string) => {
    // Format as (XXX) XXX-XXXX
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  const age = calculateAge(patientInfo.dob);
  const formattedDOB = formatDOB(patientInfo.dob);

  // Get gender and phone from patient info, with fallbacks for missing data
  const gender = patientInfo.gender || 'M';
  const phoneNumber = patientInfo.phoneNumber ? formatPhoneNumber(patientInfo.phoneNumber) : '(978) 555-1234';
  const insuranceType = metadata.insuranceType
    ? metadata.insuranceType.charAt(0).toUpperCase() + metadata.insuranceType.slice(1)
    : metadata.insurance || 'N/A';

  return (
    <div className="bg-[#1a1a1a] text-white border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Patient Name */}
          <span className="font-semibold text-base">
            {patientInfo.initials}
          </span>

          {/* Demographics - Gender, Age, DOB, Phone */}
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <span className="font-medium">{gender}</span>
            <span className="text-gray-500">·</span>
            <span>{age} years</span>
            <span className="text-gray-500">·</span>
            <span>{formattedDOB}</span>
            <span className="text-gray-500">·</span>
            <span>{phoneNumber}</span>
          </div>

          {/* Insurance */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Primary Insurance:</span>
            <span className="font-medium">{insuranceType}</span>
          </div>
        </div>

        {/* Profile Button */}
        {journey.rxosOrderUrl && (
          <a
            href={journey.rxosOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-1.5 border border-gray-600 rounded hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            Profile
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
}
