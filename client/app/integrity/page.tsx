'use client';

import { useState } from 'react';

export default function IntegrityPage() {
  const [activeTab, setActiveTab] = useState<'register' | 'verify'>('register');
  
  // Register State
  const [registerFile, setRegisterFile] = useState<File | null>(null);
  const [registerResult, setRegisterResult] = useState<any>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Verify State
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [verifyContractId, setVerifyContractId] = useState('');
  const [verifyVersionId, setVerifyVersionId] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Handlers
  const handleRegisterUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerFile) return;

    setIsRegistering(true);
    setRegisterResult(null);

    const formData = new FormData();
    formData.append('file', registerFile);

    try {
      const res = await fetch('http://localhost:5000/api/contracts/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setRegisterResult(data);
    } catch (error) {
      console.error('Upload failed', error);
      setRegisterResult({ success: false, message: 'Upload failed' });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleVerifyUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyFile || !verifyContractId) return;

    setIsVerifying(true);
    setVerifyResult(null);

    const formData = new FormData();
    formData.append('file', verifyFile);
    formData.append('contractId', verifyContractId);
    if (verifyVersionId) formData.append('versionId', verifyVersionId);

    try {
      const res = await fetch('http://localhost:5000/api/contracts/verify', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setVerifyResult(data);
    } catch (error) {
      console.error('Verification failed', error);
      setVerifyResult({ success: false, message: 'Verification failed' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contract Integrity Verification</h1>
          <p className="text-lg text-gray-600">
            Securely register contracts using Canonicalized Hashing and verify their authenticity on-chain.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={() => setActiveTab('register')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'register'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Register Contract
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'verify'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Verify Integrity
            </button>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {activeTab === 'register' && (
            <div className="p-8">
              <h2 className="text-2xl font-semibold mb-6">Register New Contract</h2>
              <form onSubmit={handleRegisterUpload} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract File (PDF, DOCX, TXT)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      onChange={(e) => setRegisterFile(e.target.files?.[0] || null)}
                      className="w-full"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!registerFile || isRegistering}
                  className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isRegistering ? 'Processing...' : 'Register Contract'}
                </button>
              </form>

              {registerResult && (
                <div className={`mt-8 p-6 rounded-lg ${registerResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h3 className={`text-lg font-medium mb-4 ${registerResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {registerResult.success ? 'Registration Successful' : 'Registration Failed'}
                  </h3>
                  {registerResult.success && registerResult.data && (
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span className="font-semibold">Contract ID:</span>
                        <span className="font-mono bg-white px-2 py-1 rounded border overflow-x-auto max-w-[200px]">
                          {registerResult.data.contractId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                         <span className="font-semibold">Version ID:</span>
                         <span>{registerResult.data.versionId}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold">Document Hash (SHA-256):</span>
                        <span className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
                          {registerResult.data.contractHash}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold">On-Chain Transaction:</span>
                        <span className="font-mono text-xs bg-blue-50 p-2 rounded break-all text-blue-700">
                          {registerResult.data.onChainTxHash || 'Pending'}
                        </span>
                      </div>
                      <div className="mt-4 p-2 bg-yellow-50 text-yellow-800 text-xs rounded">
                        <strong>Note:</strong> Save the Contract ID to verify this document later.
                      </div>
                    </div>
                  )}
                  {!registerResult.success && (
                    <p className="text-red-700">{registerResult.message}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'verify' && (
            <div className="p-8">
              <h2 className="text-2xl font-semibold mb-6">Verify Contract Integrity</h2>
              <form onSubmit={handleVerifyUpload} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Contract ID
                  </label>
                  <input
                    type="text"
                    value={verifyContractId}
                    onChange={(e) => setVerifyContractId(e.target.value)}
                    placeholder="e.g. 64b1f..."
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Version ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={verifyVersionId}
                    onChange={(e) => setVerifyVersionId(e.target.value)}
                    placeholder="e.g. v1"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document to Verify
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      onChange={(e) => setVerifyFile(e.target.files?.[0] || null)}
                      className="w-full"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!verifyFile || !verifyContractId || isVerifying}
                  className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Document'}
                </button>
              </form>

              {verifyResult && verifyResult.success && verifyResult.data && (
                <div className={`mt-8 p-6 rounded-lg border text-center ${
                  verifyResult.data.status === 'VERIFIED' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex justify-center mb-4">
                    {verifyResult.data.status === 'VERIFIED' ? (
                       <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-3xl">
                         ✓
                       </div>
                    ) : (
                       <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-3xl">
                         ⚠
                       </div>
                    )}
                  </div>
                  
                  <h3 className={`text-2xl font-bold mb-2 ${
                     verifyResult.data.status === 'VERIFIED' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {verifyResult.data.status}
                  </h3>
                  
                  <p className="text-gray-600 mb-6">
                    {verifyResult.data.details || (
                        verifyResult.data.status === 'VERIFIED' 
                        ? 'The document matches the on-chain record perfectly.' 
                        : 'Verification failed.'
                    )}
                  </p>

                  <div className="text-left space-y-2 text-xs font-mono bg-white p-4 rounded border">
                     <p><strong className="text-gray-500">Submitted Hash:</strong> {verifyResult.data.submittedHash}</p>
                     <p><strong className="text-gray-500">On-Chain Hash:</strong> {verifyResult.data.onChainHash || 'N/A'}</p>
                  </div>
                </div>
              )}
              {verifyResult && !verifyResult.success && (
                  <div className="mt-8 p-4 bg-red-50 text-red-700 rounded border border-red-200">
                    {verifyResult.message}
                  </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
