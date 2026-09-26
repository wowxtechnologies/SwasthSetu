import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Pill,
  CheckCircle,
  AlertTriangle,
  Clock,
  Boxes,
  FileText,
  User,
  ShieldAlert,
  ArrowRight,
  Search,
  Check,
  PackageCheck
} from 'lucide-react';

export const PharmacyDispensary: React.FC = () => {
  const { state, dispensePrescription } = useApp();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [dispenseResult, setDispenseResult] = useState<{ success: boolean; message: string } | null>(null);

  const pendingOrders = state.pharmacyOrders.filter((o) => o.dispenseStatus === 'PENDING');
  const dispensedOrders = state.pharmacyOrders.filter((o) => o.dispenseStatus === 'DISPENSED');

  const activeOrder =
    state.pharmacyOrders.find((o) => o.orderId === selectedOrderId) ||
    pendingOrders[0] ||
    state.pharmacyOrders[0];

  const activePatient = activeOrder
    ? state.patients.find((p) => p.patientId === activeOrder.patientId)
    : null;

  const currentFacilityStock = state.inventory.filter(
    (i) => i.facilityId === (activeOrder?.facilityId || state.currentFacilityId)
  );

  const handleDispense = (orderId: string) => {
    const res = dispensePrescription(orderId);
    setDispenseResult(res);
    setTimeout(() => setDispenseResult(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Hospital Pharmacy Dispensary Counter #02</h2>
            <p className="text-xs text-slate-500 font-medium">
              Verified Drug Dispensation · Real-Time Inventory Stock Mutation & Allergy Guard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[10px] font-bold text-amber-800 block uppercase">Pending Rx</span>
            <span className="text-base font-extrabold text-amber-900 font-mono">{pendingOrders.length}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[10px] font-bold text-emerald-800 block uppercase">Dispensed Today</span>
            <span className="text-base font-extrabold text-emerald-900 font-mono">{dispensedOrders.length + 128}</span>
          </div>
        </div>
      </div>

      {/* Result Alert */}
      {dispenseResult && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-xs ${
          dispenseResult.success
            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
            : 'bg-red-50 text-red-900 border-red-300'
        }`}>
          <div className="flex items-center gap-2">
            {dispenseResult.success ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{dispenseResult.message}</span>
          </div>
          <button
            onClick={() => setDispenseResult(null)}
            className="text-xs font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Pending Queue (5 cols) & Order Inspection (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pending Prescriptions Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                Active Prescription Queue ({pendingOrders.length})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Real-time Stream</span>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No pending prescriptions in dispensary queue.
              </div>
            ) : (
              <div className="space-y-2">
                {pendingOrders.map((order) => {
                  const isSelected = order.orderId === activeOrder?.orderId;
                  return (
                    <button
                      key={order.orderId}
                      onClick={() => setSelectedOrderId(order.orderId)}
                      className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-300 shadow-2xs'
                          : 'bg-white border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-blue-700">{order.orderId}</span>
                          <span className="font-bold text-slate-900 text-xs">{order.patientName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {order.doctorName} · {order.items.length} prescribed medicines
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recently Dispensed List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
              Recently Dispensed Log
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {dispensedOrders.length === 0 ? (
                <div className="text-xs text-slate-400 py-3 text-center">No orders dispensed yet in this session</div>
              ) : (
                dispensedOrders.map((d) => (
                  <div key={d.orderId} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{d.patientName}</span>
                      <span className="text-[10px] text-slate-500 font-mono block">{d.orderId}</span>
                    </div>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                      Dispensed ✓
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Detail, Stock Availability & Dispense Action */}
        <div className="lg:col-span-7">
          {activeOrder ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-blue-800">{activeOrder.orderId}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      activeOrder.dispenseStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {activeOrder.dispenseStatus}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {activeOrder.patientName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Prescribed by {activeOrder.doctorName} · Encounter {activeOrder.registrationId}
                  </p>
                </div>

                {activePatient?.knownAllergies && activePatient.knownAllergies.length > 0 && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span>Allergy: {activePatient.knownAllergies.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Medicine Item Verification Table */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                  Prescribed Formulary Medications & Stock Availability
                </span>

                <div className="space-y-3">
                  {activeOrder.items.map((item, idx) => {
                    const stock = currentFacilityStock.find((s) => s.medicineId === item.medicineId);
                    const isAvailable = stock && stock.currentStock >= item.quantity;
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition ${
                          isAvailable
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-red-50/70 border-red-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-bold text-sm text-slate-900">{item.medicineName}</div>
                            <div className="text-xs text-slate-600 mt-0.5 flex flex-wrap gap-2">
                              <span className="font-semibold text-blue-700">{item.dosage}</span>
                              <span>·</span>
                              <span>{item.durationDays} Days</span>
                              <span>·</span>
                              <span className="italic text-slate-500">{item.instructions}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-base font-extrabold text-slate-900 block">
                              Qty: {item.quantity}
                            </span>
                            <span className={`text-[10px] font-bold ${
                              isAvailable ? 'text-emerald-700' : 'text-red-700'
                            }`}>
                              {stock ? `${stock.currentStock} in stock` : 'Out of Stock'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dispensation Action */}
              <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Deducts inventory stock atomically & prints dispensation barcode.
                </span>

                <button
                  onClick={() => handleDispense(activeOrder.orderId)}
                  disabled={activeOrder.dispenseStatus === 'DISPENSED'}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-amber-600/20"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>{activeOrder.dispenseStatus === 'DISPENSED' ? 'Already Dispensed' : 'Verify & Dispense All Medicines'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
              Select a prescription from the queue to review and dispense.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
