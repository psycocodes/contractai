import Image from 'next/image';

export default function Hero() {
  return (
    <div className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 ">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="w-full lg:w-8/12 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-8 leading-tight">
              Intelligent Contracts.<br className="hidden sm:block" /> Uncompromised Trust.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Enterprise CLM combining predictive AI analysis with immutable blockchain verification.
            </p>
            <div className="flex justify-center lg:justify-start gap-4">
              <button className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm text-base">
                Get Started
              </button>
              <button className="px-6 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-md font-medium hover:bg-slate-50 transition-colors shadow-sm text-base">
                View Demo
              </button>
            </div>
          </div>
          <div className="` lg:w-3/12 flex justify-center lg:justify-end relative ">
            <Image
              src="/logo-big.png"
              alt="Contract AI Logo"
              width={800}
              height={800}
              className="w-full h-auto max-w-[500px] sm:max-w-xl lg:max-w-3xl drop-shadow-2xl transition-transform duration-500"
              priority
              quality={100}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
