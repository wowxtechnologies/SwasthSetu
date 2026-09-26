import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Volume2,
  Users,
  Clock,
  Sparkles,
  Play,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const OPDQueueBoard: React.FC = () => {
  const { state, callNextTicket } = useApp();
  const [audioAnnouncement, setAudioAnnouncement] = useState('🔔 टोकन GM-038 कृपया सामान्य चिकित्सा कक्ष 104 में पधारें');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const playVoiceAnnouncement = (text: string) => {
    setIsPlayingAudio(true);
    setAudioAnnouncement(text);
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.9;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setIsPlayingAudio(false), 3000);
      }
    } catch (e) {
      console.warn('Speech synthesis restricted in this frame context:', e);
      setTimeout(() => setIsPlayingAudio(false), 3000);
    }
  };

  const handleSimulateCallNext = (deptId: string, deptName: string, room: string) => {
    const next = callNextTicket(deptId);
    if (next) {
      const msg = `🔔 ध्यान दें: टोकन नंबर ${next.tokenNumber}, कृपया ${deptName} ${room} में पधारें. Token ${next.tokenNumber} please proceed to ${deptName} ${room}.`;
      playVoiceAnnouncement(msg);
    }
  };

  const currentFacility =
    state.facilities.find((f) => f.facilityId === state.currentFacilityId) ||
    state.facilities[0];

  return (
    <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border-4 border-slate-800 shadow-2xl space-y-6">
      {/* TV Display Board Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              LIVE WAITING CORRIDOR TELEMETRY · DISPLAY SCREEN #02
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            {currentFacility.name} — OPD Triage Queue Board
          </h2>
          <p className="text-xs text-slate-400">
            Real-time multi-department outpatient calling display
          </p>
        </div>

        {/* Digital Clock */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 text-center md:text-right">
          <div className="font-mono text-2xl font-black text-amber-300">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>

      {/* Audio Announcement Ribbon */}
      <div className="bg-gradient-to-r from-blue-900/80 via-slate-900 to-blue-900/80 border border-blue-700/60 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isPlayingAudio ? 'bg-amber-400 text-slate-950 animate-bounce' : 'bg-blue-600 text-white'}`}>
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-teal-300 block tracking-wider">
              LOUDSPEAKER ANNOUNCEMENT FEED
            </span>
            <span className="text-sm font-bold text-white tracking-wide">
              {audioAnnouncement}
            </span>
          </div>
        </div>

        <button
          onClick={() => playVoiceAnnouncement(audioAnnouncement)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0 shadow-xs"
        >
          Replay Chime
        </button>
      </div>

      {/* Department Displays Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {state.departments.slice(0, 3).map((dept) => {
          const queue = state.queues.find((q) => q.departmentId === dept.departmentId) || state.queues[0];
          const waitingInDept = state.tickets
            .filter((t) => t.departmentId === dept.departmentId && t.status === 'WAITING')
            .sort((a, b) => a.sequenceNumber - b.sequenceNumber);
          const nextTickets = waitingInDept.slice(0, 3);

          return (
            <div
              key={dept.departmentId}
              className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <h3 className="text-lg font-black text-white">{dept.name}</h3>
                    <span className="text-xs font-mono font-bold text-teal-400">{dept.roomNumber}</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    Avg {dept.avgConsultationMinutes}m
                  </span>
                </div>

                {/* Big Now Calling Ticker */}
                <div className="bg-slate-950 border-2 border-amber-500/80 rounded-2xl p-5 text-center mb-5 shadow-inner">
                  <span className="text-[10px] uppercase font-black text-amber-400 tracking-widest block mb-1 animate-pulse">
                    ★ NOW CALLING (वर्तमान टोकन)
                  </span>
                  <div className="text-5xl font-black font-mono text-white my-1 tracking-tight">
                    {queue.currentTokenNumber || 'GM-038'}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    Please step into {dept.roomNumber}
                  </span>
                </div>

                {/* Next in Line Ticker */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span>Next in Line (आगामी टोकन)</span>
                    <span className="text-amber-400 font-mono">{waitingInDept.length} waiting</span>
                  </div>
                  <div className="flex gap-2">
                    {nextTickets.length === 0 ? (
                      <span className="text-xs text-slate-500 italic py-2">No patients waiting</span>
                    ) : (
                      nextTickets.map((t) => (
                        <div
                          key={t.ticketId}
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-2 text-center"
                        >
                          <span className="font-mono font-black text-xs text-blue-300 block">
                            {t.tokenNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate block">
                            {t.patientName.split(' ')[0]}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Simulation Quick Trigger */}
              <button
                onClick={() => handleSimulateCallNext(dept.departmentId, dept.name, dept.roomNumber)}
                disabled={waitingInDept.length === 0}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate Call Next in {dept.name}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer Info Banner */}
      <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div>
          Senior Citizens, Pregnant Mothers, and Emergency Triage cases are prioritized by hospital policy.
        </div>
        <div className="font-mono text-[11px] text-teal-400">
          SwasthSetu Central Corridor Engine v2.4
        </div>
      </div>
    </div>
  );
};
