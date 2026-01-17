import { 
  ShieldCheckIcon, 
  DocumentMagnifyingGlassIcon, 
  CpuChipIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline'; // Note: You might need to install @heroicons/react if not present, but I will simulate icon components for now to avoid dependency issues if unavailable.

// Placeholder icons if heroicons is not installed.
const BrainIcon = (props: any) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const CheckListIcon = (props: any) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FingerPrintIcon = (props: any) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565m4.382-2.345a9.387 9.387 0 01-1.326 3.033" />
  </svg>
);

const CompareIcon = (props: any) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
);


const features = [
  {
    name: "AI Risk Detection",
    description: "Automatically analyze contracts for compliance risks and non-standard clauses using advanced natural language processing.",
    icon: BrainIcon,
  },
  {
    name: "Structured Workflows",
    description: "Streamline the review process with customizable approval chains and automated task assignments.",
    icon: CheckListIcon,
  },
  {
    name: "Immutable Audit Trails",
    description: "Every change and approval is cryptographically verified and recorded on a private blockchain for absolute integrity.",
    icon: FingerPrintIcon,
  },
  {
    name: "Version Integrity",
    description: "Instantly compare versions and verify that the signed document matches the approved final draft byte-for-byte.",
    icon: CompareIcon,
  },
];

export default function Features() {
  return (
    <div className="py-24 bg-white/50" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Capabilities</h2>
          <p className="mt-2 text-3xl font-bold leading-8 tracking-tight text-slate-900 sm:text-4xl">
            Enterprise-grade Contract Management
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {features.map((feature) => (
            <div key={feature.name} className="flex flex-col items-start p-6 rounded-lg bg-white shadow-sm border border-slate-200 hover:shadow-md transition-shadow hover:border-blue-200">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-50 text-blue-600 mb-5">
                <feature.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">{feature.name}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
