import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  Building2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Truck,
  Layers,
  Sparkles,
  ShieldCheck,
  RotateCw,
  AlertTriangle,
  Info,
  Navigation
} from 'lucide-react';

export const ResourceNetworkMap: React.FC = () => {
  const {
    state,
    approveRecommendation,
    rejectRecommendation,
    stepFederatedRound,
  } = useApp();

  const [activeNetworkTab, setActiveNetworkTab] = useState<'REDISTRIBUTION' | 'MAP' | 'FEDERATED'>('REDISTRIBUTION');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Local emergency surge buffer required');
  const [actionNotice, setActionNotice] = useState('');

  const pendingRecs = state.recommendations.filter((r) => r.status === 'PENDING_REVIEW');
  const reviewedRecs = state.recommendations.filter((r) => r.status !== 'PENDING_REVIEW');

  const handleApprove = (id: string, name: string) => {
    approveRecommendation(id);
    setActionNotice(`Transfer Recommendation ${id} APPROVED. 600 units dispatched from warehouse to destination facility.`);
    setTimeout(() => setActionNotice(''), 6000);
  };

  const handleReject = (id: string) => {
    rejectRecommendation(id, rejectReason);
    setRejectingId(null);
    setActionNotice(`Transfer Recommendation ${id} REJECTED with documented rationale.`);
    setTimeout(() => setActionNotice(''), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center font-bold">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">District & State Healthcare Resource Intelligence</h2>
              <span className="text-[10px] bg-cyan-100 text-cyan-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
                Multi-Facility Grid
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Geographic facility telemetry, AI inter-facility supply rebalancing, and decentralized federated learning
            </p>
          </div>
        </div>

        <div className="flex border border-slate-200 p-1 bg-slate-50 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveNetworkTab('REDISTRIBUTION')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeNetworkTab === 'REDISTRIBUTION' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>AI Redistribution ({pendingRecs.length})</span>
          </button>
          <button
            onClick={() => setActiveNetworkTab('MAP')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeNetworkTab === 'MAP' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Facility GIS Map</span>
          </button>
          <button
            onClick={() => setActiveNetworkTab('FEDERATED')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeNetworkTab === 'FEDERATED' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Federated AI Simulation</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold">{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice('')} className="text-xs font-bold underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: AI RESOURCE REDISTRIBUTION RECOMMENDATIONS */}
      {activeNetworkTab === 'REDISTRIBUTION' && (
        <div className="space-y-6">
          {/* Header Explanation */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              Autonomous Surplus-Deficit Matching Engine
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
              Cross-Facility Medicine Redistribution Recommendations
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              When satellite Primary Health Centers face acute stock-out risk, SwasthSetu's intelligence engine analyzes district warehouse surpluses, transit distances, and epidemic surge models to recommend balancing transfers. <strong>Human administrator approval is mandatory</strong> before transfer execution.
            </p>
          </div>

          {/* Pending Recommendations List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Pending Human Approval ({pendingRecs.length} Action Items)
              </span>
              <span className="text-[11px] text-slate-400">Strict Human-in-the-Loop Protocol</span>
            </div>

            {pendingRecs.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <span className="font-bold text-slate-800 block text-sm">All Stock Rebalancing Demands Resolved</span>
                No pending transfer recommendations requiring authorization at this time.
              </div>
            ) : (
              pendingRecs.map((rec) => (
                <div
                  key={rec.recommendationId}
                  className="bg-white border-2 border-blue-200 rounded-3xl p-6 shadow-md hover:shadow-lg transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {rec.recommendationId}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{rec.medicineName}</span>
                    </div>
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                      Awaiting District Admin Sign-Off
                    </span>
                  </div>

                  {/* Transfer Visual Route */}
                  <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    {/* Source Facility */}
                    <div className="md:col-span-5 bg-white p-3.5 rounded-xl border border-blue-200 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-blue-700 block mb-1">
                        Surplus Source (अधिशेष केंद्र)
                      </span>
                      <div className="font-bold text-xs text-slate-900">{rec.sourceFacilityName}</div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Stock Before: <span className="font-mono font-bold text-slate-800">{rec.sourceStockBefore} units</span> (Surplus Status)
                      </div>
                    </div>

                    {/* Transfer Direction Indicator */}
                    <div className="md:col-span-1 text-center py-2">
                      <div className="inline-flex flex-col items-center justify-center">
                        <Truck className="w-5 h-5 text-blue-600 mb-1" />
                        <span className="text-[10px] font-mono font-bold text-slate-700 bg-blue-100 px-2 py-0.5 rounded">
                          {rec.suggestedQuantity} units
                        </span>
                        <span className="text-[9px] text-slate-400 mt-0.5">{rec.distanceKm} km</span>
                      </div>
                    </div>

                    {/* Destination Facility */}
                    <div className="md:col-span-5 bg-white p-3.5 rounded-xl border border-red-200 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-red-700 block mb-1">
                        Deficit Destination (कमी वाला केंद्र)
                      </span>
                      <div className="font-bold text-xs text-slate-900">{rec.destFacilityName}</div>
                      <div className="text-[11px] text-red-700 font-semibold mt-1">
                        Current Days of Stock: <span className="font-mono font-bold">{rec.destDaysOfStockBefore} days</span> (Critical Risk)
                      </div>
                    </div>
                  </div>

                  {/* AI Reasoning Text */}
                  <div className="text-xs text-slate-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100 leading-relaxed">
                    <span className="font-bold text-blue-900 block mb-0.5">Automated Intelligence Rationale:</span>
                    {rec.reasoning}
                  </div>

                  {/* Actions Deck */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <span className="text-[11px] text-slate-500">
                      Authorizing will update warehouse inventory balances and alert logistics transport.
                    </span>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setRejectingId(rec.recommendationId)}
                        className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Reject...
                      </button>
                      <button
                        onClick={() => handleApprove(rec.recommendationId, rec.medicineName)}
                        className="flex-1 sm:flex-none px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-emerald-700/20 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Authorize & Dispatch Transfer</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Past Transfer History */}
          {reviewedRecs.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-3">
                Authorized / Concluded Resource Rebalancing History
              </span>
              <div className="space-y-2">
                {reviewedRecs.map((r) => (
                  <div
                    key={r.recommendationId}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-700">{r.recommendationId}</span>
                        <span className="font-bold text-slate-900">{r.medicineName} ({r.suggestedQuantity} units)</span>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                          r.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {r.sourceFacilityName} ➔ {r.destFacilityName} · Signed off by {r.reviewedBy || 'Admin'}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date().toLocaleDateString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FACILITY GIS MAP */}
      {activeNetworkTab === 'MAP' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Google Maps Platform Facility Resource Telemetry
                </h3>
                <p className="text-xs text-slate-500">
                  Visual geospatial health grid showing District Hospitals, CHCs, and PHCs with bed & inventory health
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                Raipur Health District (CG)
              </span>
            </div>

            {/* Interactive Map Visualizer */}
            <div className="w-full h-96 bg-slate-900 rounded-2xl border border-slate-800 relative overflow-hidden flex items-center justify-center p-6 shadow-inner">
              {/* Grid Lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>

              {/* Highway Connection Vectors */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-blue-500/40 stroke-2 stroke-dasharray-4">
                <line x1="50%" y1="45%" x2="25%" y2="70%" />
                <line x1="50%" y1="45%" x2="80%" y2="55%" />
                <line x1="50%" y1="45%" x2="65%" y2="30%" />
              </svg>

              {/* Node 1: District Hospital Raipur (Center Hub) */}
              <div className="absolute top-[42%] left-[46%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/50 border-2 border-white animate-bounce">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="mt-1 bg-slate-900/90 text-white border border-slate-700 px-3 py-1 rounded-xl text-center shadow-md">
                  <span className="font-bold text-xs block text-teal-300">District Hospital Raipur</span>
                  <span className="text-[10px] text-slate-400">350 Beds · Warehouse Surplus</span>
                </div>
              </div>

              {/* Node 2: PHC Abhanpur (Southwest - Under Stockout Stress) */}
              <div className="absolute top-[68%] left-[23%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/50 border-2 border-white animate-pulse">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="mt-1 bg-slate-900/90 text-white border border-red-500/60 px-3 py-1 rounded-xl text-center shadow-md">
                  <span className="font-bold text-xs block text-red-400">PHC Abhanpur</span>
                  <span className="text-[10px] text-slate-400 font-mono">ORS: 2.8d remaining · 28km</span>
                </div>
              </div>

              {/* Node 3: CHC Arang (East) */}
              <div className="absolute top-[52%] left-[78%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/50 border-2 border-white">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="mt-1 bg-slate-900/90 text-white border border-slate-700 px-3 py-1 rounded-xl text-center shadow-md">
                  <span className="font-bold text-xs block text-amber-300">CHC Arang</span>
                  <span className="text-[10px] text-slate-400">Amoxicillin: 4.1d · 36km</span>
                </div>
              </div>

              {/* Node 4: PHC Mandir Hasaud (Northeast) */}
              <div className="absolute top-[28%] left-[64%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/50 border-2 border-white">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="mt-1 bg-slate-900/90 text-white border border-slate-700 px-2 py-0.5 rounded-xl text-center shadow-md">
                  <span className="font-bold text-xs block text-emerald-300">PHC Mandir Hasaud</span>
                  <span className="text-[10px] text-slate-400">Optimal Stock · 18km</span>
                </div>
              </div>

              <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs border border-slate-800 rounded-xl p-2.5 text-[10px] text-slate-400 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Primary Hub
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> Critical Deficit
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Balanced
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FEDERATED AI SIMULATION */}
      {activeNetworkTab === 'FEDERATED' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-600" />
                  Decentralized Privacy-Preserving Federated AI Simulation
                </span>
                <p className="text-[11px] text-slate-500">
                  Simulating cross-state model training where raw patient PII never leaves local state boundaries
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-purple-50 text-purple-800 px-3 py-1.5 rounded-xl border border-purple-200">
                  Global Round #{state.federatedRound}
                </span>
                <button
                  onClick={stepFederatedRound}
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Step Training Round</span>
                </button>
              </div>
            </div>

            {/* Architecture Explainer */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 mb-6 leading-relaxed">
              <span className="font-bold text-slate-800 block mb-1">
                Prototype Federated Architecture Principle:
              </span>
              State health systems train local demand forecasting models locally on state servers. Only differential privacy encrypted weight tensors (weight deltas) are transmitted to the National Central Coordinator. Aggregation updates the global prediction model without centralized data pooling.
            </div>

            {/* Participating State Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {state.federatedNodes.map((node) => (
                <div
                  key={node.stateId}
                  className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-2xs hover:border-purple-300 transition"
                >
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900 text-sm">{node.stateName}</span>
                    <span className="text-[10px] font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      {node.stateId}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Local Training Size:</span>
                      <span className="font-mono font-bold text-slate-800">{node.localDatasetSize.toLocaleString()} records</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Active Facilities:</span>
                      <span className="font-mono font-bold text-slate-800">{node.participatingFacilities} centers</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Local Accuracy:</span>
                      <span className="font-mono font-extrabold text-emerald-700">{node.localModelAccuracy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Privacy Budget (ε):</span>
                      <span className="font-mono font-semibold text-purple-700">{node.privacyEpsilon}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Central Aggregator Box */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-6 text-center shadow-lg">
              <span className="text-xs font-bold uppercase tracking-widest text-purple-300 block mb-1">
                CENTRAL AGGREGATION COORDINATOR (FEDAVG)
              </span>
              <div className="text-3xl font-black font-mono text-white mb-2">
                Global Model Accuracy: 94.8%
              </div>
              <p className="text-xs text-slate-300 max-w-lg mx-auto">
                Decentralized convergence achieved across 214 healthcare centers and 685,900 synthetic records with Differential Privacy (DP-SGD) guarantees.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Reject Redistribution Recommendation</h3>
            <p className="text-xs text-slate-600 mb-4">
              Enter operational justification for rejecting transfer {rejectingId}:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs mb-4 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRejectingId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectingId)}
                className="px-3.5 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
