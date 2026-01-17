import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="flex items-center mb-2">
              <Image 
                src="/logo-small.png" 
                alt="contract.ai" 
                width={24} 
                height={24} 
                className="h-6 w-auto"
              />
              <span className="ml-2 text-lg font-bold text-slate-800 tracking-tight font-mono">contract.ai</span>
            </Link>
            <p className="text-sm text-slate-500 mt-1">
              &copy; {new Date().getFullYear()} contract.ai Inc. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <Link href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
