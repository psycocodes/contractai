export default function Trust() {
  return (
    <div className="bg-slate-50 py-24 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
            Trusted by Legal & Compliance Teams
          </h2>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            Our platform helps enterprises navigate complex regulatory landscapes with confidence. 
            By prioritizing auditability, transparency, and data integrity, we ensure that your 
            contract lifecycle is not just efficient, but fully compliant and legally sound.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12 pt-8 border-t border-slate-200">
             <div>
                <p className="text-4xl font-bold text-slate-800">100%</p>
                <p className="text-sm text-slate-500 mt-1">Audit Trail Fidelity</p>
             </div>
             <div>
                <p className="text-4xl font-bold text-slate-800">SOC2</p>
                <p className="text-sm text-slate-500 mt-1">Type II Compliant</p>
             </div>
             <div>
                <p className="text-4xl font-bold text-slate-800">0</p>
                <p className="text-sm text-slate-500 mt-1">Data Breaches</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
