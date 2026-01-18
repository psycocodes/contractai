'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, logout, switchOrganization, activeOrganizationId, refreshUser } = useAuth();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [showInviteUser, setShowInviteUser] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showPendingInvites, setShowPendingInvites] = useState(false);

  const activeOrg = organizations.find(org => org.id === activeOrganizationId);

  useEffect(() => {
    loadData();
  }, [activeOrganizationId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load organizations
      const orgsResponse = await apiClient.getOrganizations();
      setOrganizations(orgsResponse.data);

      // Load contracts if there's an active organization
      if (activeOrganizationId) {
        try {
          const contractsResponse = await apiClient.getContracts();
          setContracts(contractsResponse.data);
        } catch (err) {
          // If error loading contracts, just show empty list
          setContracts([]);
        }
      } else {
        setContracts([]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchOrg = async (orgId: string) => {
    try {
      await switchOrganization(orgId);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">contract.ai</h1>
            {activeOrg && (
              <span className="text-sm text-gray-600">
                / {activeOrg.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Organization Selector */}
        <div className="mb-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Organization</h2>
          <div className="flex gap-4 items-center flex-wrap">
            <select
              value={activeOrganizationId || ''}
              onChange={(e) => handleSwitchOrg(e.target.value)}
              className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.role})
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowCreateOrg(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Create Organization
            </button>
            <button
              onClick={() => setShowPendingInvites(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              View Invites
            </button>
          </div>
        </div>

        {/* Actions */}
        {activeOrganizationId && (
          <div className="mb-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => setShowUpload(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Upload Contract
              </button>
              <button
                onClick={() => setShowInviteUser(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Invite User
              </button>
            </div>
          </div>
        )}

        {/* Contracts List */}
        {activeOrganizationId ? (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Contracts</h2>
            {contracts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contracts.map((contract) => (
                  <div
                    key={contract._id}
                    onClick={() => router.push(`/contract/${contract._id}`)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md cursor-pointer transition"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{contract.name}</h3>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(contract.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-mono truncate">
                      ID: {contract._id}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                <p className="mb-2">No contracts yet.</p>
                <p className="text-sm">Upload your first contract to get started.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
            {organizations.length === 0 ? (
              <div>
                <p className="font-semibold mb-2">Welcome! Get started by:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Creating a new organization, or</li>
                  <li>Checking pending invites to join an existing organization</li>
                </ul>
              </div>
            ) : (
              'Please select an organization from the dropdown above.'
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateOrg && (
        <CreateOrganizationModal
          onClose={() => setShowCreateOrg(false)}
          onSuccess={() => {
            setShowCreateOrg(false);
            loadData();
          }}
        />
      )}

      {showInviteUser && (
        <InviteUserModal
          onClose={() => setShowInviteUser(false)}
          onSuccess={() => {
            setShowInviteUser(false);
          }}
        />
      )}

      {showUpload && (
        <UploadContractModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            setShowUpload(false);
            loadData();
          }}
        />
      )}

      {showPendingInvites && (
        <PendingInvitesModal
          onClose={() => setShowPendingInvites(false)}
          onAccepted={async (newOrgId: string) => {
            setShowPendingInvites(false);
            await refreshUser();
            await switchOrganization(newOrgId);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Create Organization Modal
function CreateOrganizationModal({ onClose, onSuccess }: any) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient.createOrganization(name);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold mb-4">Create Organization</h3>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Invite User Modal
function InviteUserModal({ onClose, onSuccess }: any) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('REVIEWER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient.inviteUser(email, role);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold mb-4">Invite User</h3>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="CREATOR">Creator</option>
              <option value="APPROVER">Approver</option>
              <option value="REVIEWER">Reviewer</option>
              <option value="AUDITOR">Auditor</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Inviting...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Upload Contract Modal
function UploadContractModal({ onClose, onSuccess }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [contractId, setContractId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadResult, setUploadResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const result = await apiClient.uploadContract(file, contractId || undefined);
      setUploadResult(result.data);
      // Don't close immediately, show the result
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUploadResult(null);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold mb-4">Upload Contract</h3>
        
        {uploadResult ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
              ✅ Contract uploaded successfully!
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract ID
              </label>
              <div className="bg-gray-50 p-3 rounded border border-gray-200 font-mono text-sm break-all">
                {uploadResult.contractId}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Copy this ID to view the contract at /contract/{uploadResult.contractId}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version ID
              </label>
              <div className="bg-gray-50 p-3 rounded border border-gray-200 font-mono text-sm break-all">
                {uploadResult.versionId}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Hash
              </label>
              <div className="bg-gray-50 p-3 rounded border border-gray-200 font-mono text-xs break-all">
                {uploadResult.contractHash}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File (PDF, DOCX, or TXT)
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract ID (Optional - for new version)
              </label>
              <input
                type="text"
                value={contractId}
                onChange={(e) => setContractId(e.target.value)}
                placeholder="Leave blank for new contract"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !file}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Pending Invites Modal
function PendingInvitesModal({ onClose, onAccepted }: any) {
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInvites();
  }, []);

  const loadInvites = async () => {
    try {
      const response = await apiClient.getPendingInvites();
      setInvites(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (inviteId: string) => {
    try {
      const response = await apiClient.acceptInvite(inviteId);
      // Use the organizationId from the backend response
      const orgId = response.data.organizationId;
      onAccepted(orgId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <h3 className="text-lg font-semibold mb-4">Pending Invites</h3>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : invites.length === 0 ? (
          <div className="text-center py-4 text-gray-600">No pending invites</div>
        ) : (
          <div className="space-y-3">
            {invites.map((invite) => (
              <div key={invite._id} className="border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <div className="font-medium">{invite.organizationId?.name || 'Organization'}</div>
                  <div className="text-sm text-gray-600">Role: {invite.role}</div>
                </div>
                <button
                  onClick={() => handleAccept(invite._id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
