import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/logo-small.png" 
                alt="contract.ai" 
                width={32} 
                height={32} 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-slate-800 tracking-tight font-mono">
                contract.ai
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#product" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Product
            </Link>
            <Link href="#ai-analysis" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              AI Analysis
            </Link>
            <Link href="#blockchain" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Blockchain Verification
            </Link>
            <Link href="#security" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Security
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Pricing
            </Link>
          </div>

          <div className="flex items-center">
            <Link 
              href="#demo" 
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Request Demo
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
