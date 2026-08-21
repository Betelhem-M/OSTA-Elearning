import { useState } from 'react'
import { Check, Shield, Clock, Award } from 'lucide-react'
import Button from '@components/ui/Button'

export default function EnrollCard({ coursePrice = 'Free', studentsEnrolled = 1240 }) {
  const [isEnrolled, setIsEnrolled] = useState(false)

  function handleEnrollment() {
    setIsEnrolled(true)
  }

  function handleShare(platform) {
    alert(`Sharing link to ${platform} is processing...`)
  }

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-md font-sans">
      {/* Price Display */}
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-3xl font-black text-slate-800">{coursePrice}</span>
        {coursePrice !== 'Free' && <span className="text-sm font-semibold text-slate-400 line-through">$199.99</span>}
      </div>

      {/* Core Action Button */}
      <Button 
        onClick={handleEnrollment} 
        variant={isEnrolled ? 'outline' : 'primary'} 
        className="w-full py-3 text-center text-sm font-bold shadow-sm"
        disabled={isEnrolled}
      >
        {isEnrolled ? 'Already Enrolled' : 'Enroll Now'}
      </Button>

      {/* Course Highlights List */}
      <div className="mt-6 space-y-3.5 border-b border-slate-100 pb-5 text-sm font-medium text-slate-600">
        <div className="flex items-center gap-3">
          <Clock size={16} className="text-primary" />
          <span>Full lifetime access parameters</span>
        </div>
        <div className="flex items-center gap-3">
          <Shield size={16} className="text-primary" />
          <span>Verified security certification clearance</span>
        </div>
        <div className="flex items-center gap-3">
          <Award size={16} className="text-primary" />
          <span>Professional Certificate of Completion</span>
        </div>
      </div>

      {/* Share Matrix Panel */}
      <div className="mt-5">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
          Share this course
        </span>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Facebook Native SVG Button (Fixed: No Lucide Dependency) */}
          <button
            type="button"
            onClick={() => handleShare('Facebook')}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 transition hover:border-primary hover:bg-slate-50"
          >
            <svg className="h-4 w-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
            </svg>
            Facebook
          </button>

          {/* LinkedIn Native SVG Button */}
          <button
            type="button"
            onClick={() => handleShare('LinkedIn')}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 transition hover:border-primary hover:bg-slate-50"
          >
            <svg className="h-4 w-4 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
            </svg>
            LinkedIn
          </button>
        </div>
      </div>
    </div>
  )
}
