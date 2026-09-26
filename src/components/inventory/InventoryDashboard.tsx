import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Plus,
  Minus,
  RefreshCw,
  Search,
  Filter,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { StockRiskLevel } from '../../types';

export const InventoryDashboard: React.FC = () => {
  const { state, updateInventoryStock, acknowledgeAlert } = useApp();

  const [search, setSearch] = useState('');
  const [selectedFacilityFilter, setSelectedFacilityFilter] = useState('ALL');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'ALL' | StockRiskLevel>('ALL');

  const filteredInventory = state.inventory.filter((item) => {
    const matchSearch =
      item.medicineName.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(search.toLowerCase());
    const matchFacility =
      selectedFacilityFilter === 'ALL' || item.facilityId === selectedFacilityFilter;
    const matchRisk =
      selectedRiskFilter === 'ALL' || item.riskLevel === selectedRiskFilter;
    return matchSearch && matchFacility && matchRisk;
  });

  const criticalItems = state.inventory.filter((i) => i.riskLevel === 'CRITICAL');
  const surplusItems = state.inventory.filter((i) => i.riskLevel === 'SURPLUS');

  const getRiskBadge = (risk: StockRiskLevel, days: number) => {
    switch (risk) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
            CRITICAL ({days}d)
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            WARNING ({days}d)
          </span>
        );
      case 'SURPLUS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            SURPLUS ({days}d)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            OPTIMAL ({days}d)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Telemetry */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Hospital Drug Inventory & Stock-Out Engine</h2>
            <p className="text-xs text-slate-500 font-medium">
              Real-time multi-facility supply monitoring, days-of-stock depletion rates, and risk forecasting
            </p>
          </div>
        </div>

        {/* Telemetry Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[10px] font-bold text-red-800 block uppercase">Critical Risk (&lt;7d)</span>
            <span className="text-base font-extrabold text-red-900 font-mono">{criticalItems.length} Drugs</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[10px] font-bold text-blue-800 block uppercase">Surplus Stock (&gt;30d)</span>
            <span className="text-base font-extrabold text-blue-900 font-mono">{surplusItems.length} Drugs</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[10px] font-bold text-slate-600 block uppercase">Total Monitored</span>
            <span className="text-base font-extrabold text-slate-900 font-mono">{state.inventory.length} SKUs</span>
          </div>
        </div>
      </div>

      {/* Real-Time Stock-Out Alerts Bar */}
      {state.alerts.filter((a) => !a.isAcknowledged).length > 0 && (
        <div className="space-y-2">
          {state.alerts
            .filter((a) => !a.isAcknowledged)
            .map((alert) => (
              <div
                key={alert.alertId}
                className="bg-red-50/90 border border-red-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-red-100 text-red-700 shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-red-900">{alert.title}</span>
                      <span className="text-[10px] font-bold bg-red-200 text-red-900 px-1.5 py-0.2 rounded font-mono">
                        {alert.facilityName}
                      </span>
                    </div>
                    <p className="text-xs text-red-800 mt-0.5 leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => acknowledgeAlert(alert.alertId)}
                  className="px-3.5 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition cursor-pointer self-start sm:self-center shrink-0 shadow-xs"
                >
                  Acknowledge Alert
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicine name, category, or batch..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Facility Filter */}
          <select
            value={selectedFacilityFilter}
            onChange={(e) => setSelectedFacilityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden"
          >
            <option value="ALL">All Facilities (सभी केंद्र)</option>
            {state.facilities.map((fac) => (
              <option key={fac.facilityId} value={fac.facilityId}>
                {fac.name}
              </option>
            ))}
          </select>

          {/* Risk Level Filter */}
          <select
            value={selectedRiskFilter}
            onChange={(e) => setSelectedRiskFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical Risk (&lt;7 Days)</option>
            <option value="MEDIUM">Warning (7-14 Days)</option>
            <option value="LOW">Optimal (14-30 Days)</option>
            <option value="SURPLUS">Surplus (&gt;30 Days)</option>
          </select>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Medicine & Category</th>
                <th className="py-3 px-4">Facility</th>
                <th className="py-3 px-4 text-right">Current Stock</th>
                <th className="py-3 px-4 text-right">Daily Consumption</th>
                <th className="py-3 px-4 text-center">Days of Stock</th>
                <th className="py-3 px-4 text-center">Risk Level</th>
                <th className="py-3 px-4 text-center">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => (
                <tr key={item.inventoryId} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-xs">{item.medicineName}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{item.category}</span>
                      <span>·</span>
                      <span className="font-mono">{item.dosageForm}</span>
                      <span>·</span>
                      <span className="font-mono text-slate-400">Batch {item.batchNumber}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800 block">{item.facilityName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Expires {item.expiryDate}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-mono font-bold text-sm text-slate-900">{item.currentStock}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Min: {item.minimumStock} | Max: {item.maximumStock}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-mono font-semibold text-slate-700">{item.dailyConsumptionRate}/day</span>
                    <span className="text-[10px] text-slate-400 block">7-day rolling</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-mono font-extrabold text-sm text-slate-900 block">
                      {item.daysOfStock} days
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Depletion: in {item.daysOfStock}d
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getRiskBadge(item.riskLevel, item.daysOfStock)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {/* Interactive stock mutation buttons for demo evaluation */}
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => updateInventoryStock(item.facilityId, item.medicineId, -50)}
                        title="Simulate consumption (-50 units)"
                        className="p-1 rounded bg-slate-100 hover:bg-red-100 text-slate-700 hover:text-red-700 transition cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => updateInventoryStock(item.facilityId, item.medicineId, 200)}
                        title="Simulate restock (+200 units)"
                        className="p-1 rounded bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
