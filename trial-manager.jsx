import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Users, Calendar, Activity, Settings, ChevronDown, X, Edit2, Trash2, Eye, CheckCircle, Clock, Pause, XCircle, Archive, User, Mail, Shield, LogOut, Menu } from 'lucide-react';

// Simulated authentication - replace with real auth (Firebase, Auth0, etc.)
const DEMO_USERS = [
  { id: '1', name: 'Alex Morgan', email: 'alex@company.com', role: 'admin', avatar: '👤' },
  { id: '2', name: 'Sam Chen', email: 'sam@company.com', role: 'manager', avatar: '👤' },
  { id: '3', name: 'Jordan Lee', email: 'jordan@company.com', role: 'contributor', avatar: '👤' },
  { id: '4', name: 'Casey Taylor', email: 'casey@company.com', role: 'viewer', avatar: '👤' }
];

const TrialManagerApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [trials, setTrials] = useState([]);
  const [users, setUsers] = useState(DEMO_USERS);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewTrialModal, setShowNewTrialModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load current user
        const userResult = await window.storage.get('current-user');
        if (userResult) {
          setCurrentUser(JSON.parse(userResult.value));
        } else {
          // Default to admin for demo
          setCurrentUser(DEMO_USERS[0]);
          await window.storage.set('current-user', JSON.stringify(DEMO_USERS[0]));
        }

        // Load trials
        const trialsResult = await window.storage.get('trials');
        if (trialsResult) {
          setTrials(JSON.parse(trialsResult.value));
        } else {
          // Initialize with demo data
          const demoTrials = [
            {
              id: '1',
              title: 'New Payment Gateway Integration',
              description: 'Testing Stripe integration for international payments',
              status: 'running',
              priority: 'high',
              owner: 'Alex Morgan',
              team: ['Sam Chen', 'Jordan Lee'],
              startDate: '2026-01-15',
              expectedEnd: '2026-02-15',
              progress: 45,
              tags: ['payment', 'integration'],
              updates: [
                { date: '2026-01-28', user: 'Alex Morgan', text: 'Initial testing completed successfully' }
              ]
            },
            {
              id: '2',
              title: 'Mobile App Performance Testing',
              description: 'Load testing for 10k concurrent users',
              status: 'planning',
              priority: 'medium',
              owner: 'Sam Chen',
              team: ['Jordan Lee'],
              startDate: '2026-02-01',
              expectedEnd: '2026-02-28',
              progress: 10,
              tags: ['mobile', 'performance'],
              updates: []
            }
          ];
          setTrials(demoTrials);
          await window.storage.set('trials', JSON.stringify(demoTrials));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save trials to storage whenever they change
  useEffect(() => {
    if (!isLoading && trials.length >= 0) {
      window.storage.set('trials', JSON.stringify(trials)).catch(console.error);
    }
  }, [trials, isLoading]);

  // Role-based permissions
  const permissions = {
    admin: { canCreate: true, canEdit: true, canDelete: true, canManageUsers: true },
    manager: { canCreate: true, canEdit: true, canDelete: true, canManageUsers: false },
    contributor: { canCreate: false, canEdit: 'assigned', canDelete: false, canManageUsers: false },
    viewer: { canCreate: false, canEdit: false, canDelete: false, canManageUsers: false }
  };

  const canEdit = (trial) => {
    const perm = permissions[currentUser?.role];
    if (perm.canEdit === true) return true;
    if (perm.canEdit === 'assigned') {
      return trial.owner === currentUser.name || trial.team.includes(currentUser.name);
    }
    return false;
  };

  const statusConfig = {
    planning: { label: 'Planning', icon: Clock, color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
    running: { label: 'Running', icon: Activity, color: 'bg-emerald-500', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' },
    paused: { label: 'Paused', icon: Pause, color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
    completed: { label: 'Completed', icon: CheckCircle, color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-gray-500', bgColor: 'bg-gray-50', textColor: 'text-gray-700' }
  };

  const filteredTrials = trials.filter(trial => {
    const matchesSearch = trial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trial.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trial.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const addTrial = (newTrial) => {
    const trial = {
      ...newTrial,
      id: Date.now().toString(),
      updates: [],
      progress: 0
    };
    setTrials([trial, ...trials]);
  };

  const updateTrial = (id, updates) => {
    setTrials(trials.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTrial = (id) => {
    if (window.confirm('Are you sure you want to delete this trial?')) {
      setTrials(trials.filter(t => t.id !== id));
    }
  };

  const switchUser = async (user) => {
    setCurrentUser(user);
    await window.storage.set('current-user', JSON.stringify(user));
    setShowUserMenu(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-light tracking-wide">Loading trials...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <div>Please log in</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="lg:hidden p-2 text-slate-400 hover:text-cyan-400 transition-colors">
                <Menu size={24} />
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tight">
                TrialFlow
              </h1>
              <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                Software Trials
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 transition-all"
                >
                  <span className="text-2xl">{currentUser.avatar}</span>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-slate-200">{currentUser.name}</div>
                    <div className="text-xs text-slate-400 capitalize">{currentUser.role}</div>
                  </div>
                  <ChevronDown size={16} className="text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-3 border-b border-slate-700 bg-slate-800/50">
                      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Switch User (Demo)</div>
                    </div>
                    {users.map(user => (
                      <button
                        key={user.id}
                        onClick={() => switchUser(user)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 transition-colors ${
                          currentUser.id === user.id ? 'bg-cyan-500/10 border-l-2 border-cyan-500' : ''
                        }`}
                      >
                        <span className="text-2xl">{user.avatar}</span>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-slate-200">{user.name}</div>
                          <div className="text-xs text-slate-400 capitalize">{user.role}</div>
                        </div>
                        {currentUser.id === user.id && <CheckCircle size={16} className="text-cyan-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search trials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            >
              <option value="all">All Status</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>

            {permissions[currentUser.role].canCreate && (
              <button
                onClick={() => setShowNewTrialModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-xl font-medium transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">New Trial</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = trials.filter(t => t.status === status).length;
            return (
              <div key={status} className="bg-slate-800/30 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${config.bgColor}`}>
                    <config.icon size={20} className={config.textColor} />
                  </div>
                  <div className="text-2xl font-bold text-slate-200">{count}</div>
                </div>
                <div className="text-sm text-slate-400">{config.label}</div>
              </div>
            );
          })}
        </div>

        {/* Trials Grid */}
        {filteredTrials.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/20 border border-slate-700 rounded-xl">
            <Activity size={48} className="mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-medium text-slate-300 mb-2">No trials found</h3>
            <p className="text-slate-500">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : permissions[currentUser.role].canCreate 
                  ? 'Create your first trial to get started' 
                  : 'No trials available yet'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredTrials.map(trial => {
              const status = statusConfig[trial.status];
              const StatusIcon = status.icon;
              
              return (
                <div
                  key={trial.id}
                  className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 hover:border-slate-600 hover:shadow-xl hover:shadow-cyan-500/5 transition-all cursor-pointer group"
                  onClick={() => setSelectedTrial(trial)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${status.bgColor} mt-1`}>
                          <StatusIcon size={20} className={status.textColor} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-slate-100 mb-1 group-hover:text-cyan-400 transition-colors">
                            {trial.title}
                          </h3>
                          <p className="text-slate-400 text-sm leading-relaxed">{trial.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {trial.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600">
                            {tag}
                          </span>
                        ))}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          trial.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          trial.priority === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {trial.priority} priority
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          <span>{trial.owner}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          <span>{trial.team.length} members</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>{trial.startDate} → {trial.expectedEnd}</span>
                        </div>
                      </div>
                    </div>

                    <div className="lg:w-48">
                      <div className="text-sm text-slate-400 mb-2">Progress</div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                            style={{ width: `${trial.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-slate-300">{trial.progress}%</span>
                      </div>

                      {canEdit(trial) && (
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTrial(trial);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
                          >
                            <Edit2 size={16} />
                            <span className="text-sm">Edit</span>
                          </button>
                          {permissions[currentUser.role].canDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTrial(trial.id);
                              }}
                              className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* New Trial Modal */}
      {showNewTrialModal && (
        <NewTrialModal
          onClose={() => setShowNewTrialModal(false)}
          onSave={addTrial}
          currentUser={currentUser}
          users={users}
        />
      )}

      {/* Trial Detail Modal */}
      {selectedTrial && (
        <TrialDetailModal
          trial={selectedTrial}
          onClose={() => setSelectedTrial(null)}
          onUpdate={updateTrial}
          canEdit={canEdit(selectedTrial)}
          currentUser={currentUser}
          users={users}
          statusConfig={statusConfig}
        />
      )}
    </div>
  );
};

const NewTrialModal = ({ onClose, onSave, currentUser, users }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    owner: currentUser.name,
    team: [],
    startDate: new Date().toISOString().split('T')[0],
    expectedEnd: '',
    tags: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-100">Create New Trial</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Trial Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              placeholder="e.g., API Performance Testing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              rows="3"
              placeholder="What is this trial about?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="planning">Planning</option>
                <option value="running">Running</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Expected End</label>
              <input
                type="date"
                value={formData.expectedEnd}
                onChange={(e) => setFormData({ ...formData, expectedEnd: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
              placeholder="e.g., performance, api, testing"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/25"
            >
              Create Trial
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TrialDetailModal = ({ trial, onClose, onUpdate, canEdit, currentUser, users, statusConfig }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(trial);
  const [newUpdate, setNewUpdate] = useState('');

  const handleSave = () => {
    onUpdate(trial.id, formData);
    setIsEditing(false);
  };

  const addUpdate = () => {
    if (newUpdate.trim()) {
      const update = {
        date: new Date().toISOString().split('T')[0],
        user: currentUser.name,
        text: newUpdate
      };
      onUpdate(trial.id, {
        updates: [...trial.updates, update]
      });
      setNewUpdate('');
    }
  };

  const status = statusConfig[formData.status];
  const StatusIcon = status.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${status.bgColor}`}>
              <StatusIcon size={24} className={status.textColor} />
            </div>
            <h2 className="text-2xl font-bold text-slate-100">Trial Details</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!isEditing ? (
            <>
              <div>
                <h3 className="text-3xl font-bold text-slate-100 mb-3">{trial.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{trial.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <div className="text-xs text-slate-400 mb-1">Status</div>
                  <div className={`text-sm font-medium ${status.textColor}`}>{status.label}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <div className="text-xs text-slate-400 mb-1">Priority</div>
                  <div className="text-sm font-medium text-slate-200 capitalize">{trial.priority}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <div className="text-xs text-slate-400 mb-1">Owner</div>
                  <div className="text-sm font-medium text-slate-200">{trial.owner}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <div className="text-xs text-slate-400 mb-1">Progress</div>
                  <div className="text-sm font-medium text-slate-200">{trial.progress}%</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-400 mb-2">Timeline</div>
                <div className="flex items-center gap-4 text-slate-300">
                  <span>{trial.startDate}</span>
                  <span className="text-slate-600">→</span>
                  <span>{trial.expectedEnd}</span>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-400 mb-2">Tags</div>
                <div className="flex flex-wrap gap-2">
                  {trial.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full text-sm bg-slate-700/50 text-slate-300 border border-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-400 mb-3">Updates</div>
                <div className="space-y-3">
                  {trial.updates.length === 0 ? (
                    <p className="text-slate-500 text-sm">No updates yet</p>
                  ) : (
                    trial.updates.map((update, idx) => (
                      <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-medium text-cyan-400">{update.user}</span>
                          <span className="text-xs text-slate-500">{update.date}</span>
                        </div>
                        <p className="text-slate-300">{update.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {canEdit && (
                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      value={newUpdate}
                      onChange={(e) => setNewUpdate(e.target.value)}
                      placeholder="Add an update..."
                      className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      onClick={addUpdate}
                      className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-lg font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-lg font-medium transition-all"
                >
                  Edit Trial
                </button>
              )}
            </>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Progress</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-lg font-medium transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrialManagerApp;
