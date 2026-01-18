'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api-client';

export default function ContractDetailPage() {
  return (
    <ProtectedRoute>
      <ContractDetailContent />
    </ProtectedRoute>
  );
}

function ContractDetailContent() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.contractId as string;

  const [contract, setContract] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [canonicalText, setCanonicalText] = useState<string>('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'versions' | 'canonical' | 'analysis'>('versions');

  useEffect(() => {
    loadContract();
  }, [contractId]);

  const loadContract = async () => {
    try {
      setLoading(true);
      const [contractRes, versionsRes] = await Promise.all([
        apiClient.getContract(contractId),
        apiClient.getContractVersions(contractId),
      ]);
      setContract(contractRes.data);
      setVersions(versionsRes.data);
      
      // Select latest version by default
      if (versionsRes.data.length > 0) {
        setSelectedVersion(versionsRes.data[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCanonicalText = async (versionId: string) => {
    try {
      const response = await apiClient.getCanonicalText(versionId);
      setCanonicalText(response.data.canonicalContent || '');
      setActiveTab('canonical');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const triggerAnalysis = async (versionId: string) => {
    try {
      setError('');
      await apiClient.analyzeContract(versionId);
      // Wait a moment then fetch results
      setTimeout(() => loadAnalysis(versionId), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadAnalysis = async (versionId: string) => {
    try {
      const response = await apiClient.getAnalysis(versionId);
      setAnalysis(response.data);
      setActiveTab('analysis');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading contract...</div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Contract not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-blue-600 hover:text-blue-800 mb-2"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{contract.name}</h1>
              <p className="text-sm text-gray-600">Contract ID: {contract._id}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Versions List */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Versions</h2>
              <div className="space-y-2">
                {versions.map((version) => (
                  <div
                    key={version._id}
                    className={`p-3 border rounded cursor-pointer ${
                      selectedVersion?._id === version._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedVersion(version)}
                  >
                    <div className="font-medium">Version {version.versionNumber}</div>
                    <div className="text-xs text-gray-600">{version.fileName}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(version.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Version Details */}
          <div className="lg:col-span-2">
            {selectedVersion ? (
              <div className="bg-white shadow rounded-lg">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab('versions')}
                      className={`px-6 py-3 font-medium ${
                        activeTab === 'versions'
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('canonical');
                        if (!canonicalText) loadCanonicalText(selectedVersion._id);
                      }}
                      className={`px-6 py-3 font-medium ${
                        activeTab === 'canonical'
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Canonical Text
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('analysis');
                        if (!analysis) loadAnalysis(selectedVersion._id);
                      }}
                      className={`px-6 py-3 font-medium ${
                        activeTab === 'analysis'
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      AI Analysis
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Details Tab */}
                  {activeTab === 'versions' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">File Name</h3>
                        <p className="mt-1">{selectedVersion.fileName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">File Type</h3>
                        <p className="mt-1">{selectedVersion.fileType}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Version Number</h3>
                        <p className="mt-1">{selectedVersion.versionNumber}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Contract Hash</h3>
                        <p className="mt-1 font-mono text-sm break-all">
                          {selectedVersion.contractHash}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Blockchain Tx Hash</h3>
                        <p className="mt-1 font-mono text-sm break-all">
                          {selectedVersion.onChainTxHash || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Uploaded At</h3>
                        <p className="mt-1">
                          {new Date(selectedVersion.uploadedAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="pt-4 space-y-2">
                        <button
                          onClick={() => loadCanonicalText(selectedVersion._id)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          View Canonical Text
                        </button>
                        <button
                          onClick={() => triggerAnalysis(selectedVersion._id)}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Trigger AI Analysis
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Canonical Text Tab */}
                  {activeTab === 'canonical' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Canonical Text</h3>
                      {canonicalText ? (
                        <pre className="bg-gray-50 p-4 rounded border border-gray-200 overflow-auto max-h-96 text-sm whitespace-pre-wrap">
                          {canonicalText}
                        </pre>
                      ) : (
                        <div className="text-center py-8 text-gray-600">
                          Loading canonical text...
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Analysis Tab */}
                  {activeTab === 'analysis' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">AI Analysis</h3>
                      {analysis ? (
                        <AIAnalysisDisplay analysis={analysis} />
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-600 mb-4">
                            No analysis available yet.
                          </p>
                          <button
                            onClick={() => triggerAnalysis(selectedVersion._id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Trigger AI Analysis
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6">
                <p className="text-gray-600">Select a version to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// AI Analysis Display Component
function AIAnalysisDisplay({ analysis }: { analysis: any }) {
  if (!analysis) {
    return <div className="text-gray-600">No analysis data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      {analysis.summary && (
        <div>
          <h4 className="font-semibold mb-2">Summary</h4>
          <p className="text-gray-700 bg-gray-50 p-4 rounded">{analysis.summary}</p>
        </div>
      )}

      {/* Clauses */}
      {analysis.clauses && analysis.clauses.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Extracted Clauses</h4>
          <div className="space-y-3">
            {analysis.clauses.map((clause: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="font-medium text-blue-600">{clause.type || 'Clause'}</div>
                <p className="text-sm text-gray-700 mt-2">{clause.text}</p>
                {clause.analysis && (
                  <p className="text-sm text-gray-600 mt-2 italic">{clause.analysis}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risks */}
      {analysis.risks && analysis.risks.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Risk Flags</h4>
          <div className="space-y-3">
            {analysis.risks.map((risk: any, index: number) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  risk.severity === 'high'
                    ? 'bg-red-50 border-red-200'
                    : risk.severity === 'medium'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="font-medium">{risk.type || 'Risk'}</div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      risk.severity === 'high'
                        ? 'bg-red-200 text-red-800'
                        : risk.severity === 'medium'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-blue-200 text-blue-800'
                    }`}
                  >
                    {risk.severity || 'medium'}
                  </span>
                </div>
                <p className="text-sm mt-2">{risk.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw JSON Fallback */}
      <details className="border border-gray-200 rounded-lg p-4">
        <summary className="cursor-pointer font-medium">View Raw JSON</summary>
        <pre className="mt-2 bg-gray-50 p-4 rounded text-xs overflow-auto">
          {JSON.stringify(analysis, null, 2)}
        </pre>
      </details>
    </div>
  );
}
