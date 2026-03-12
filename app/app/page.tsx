'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CasesList } from './components/CasesList';
import { EvidencePanel } from './components/EvidencePanel';
import { PersonaPanel } from './components/PersonaPanel';
import { SearchPanel } from './components/SearchPanel';
import { PinsPanel } from './components/PinsPanel';
import { ChatPanel } from './components/ChatPanel';
import { cn } from '@/lib/utils';

interface Case {
  case_id: string;
  case_number: string;
  title: string;
  status: string;
  narrative_report?: string;
}

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [activeTab, setActiveTab] = useState<'evidence' | 'personas' | 'search' | 'pins' | 'chat'>('evidence');

  const fetchCases = () => {
    fetch('/api/cases')
      .then((r) => r.json())
      .then(setCases);
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const tabs = [
    { id: 'evidence' as const, label: '📄 หลักฐาน' },
    { id: 'personas' as const, label: '👤 บุคคล' },
    { id: 'search' as const, label: '🔍 ค้นหา' },
    { id: 'pins' as const, label: '📌 Pins' },
    { id: 'chat' as const, label: '🤖 AI' },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'bg-slate-900 text-white transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        )}
      >
        <div className="p-4 border-b border-slate-700">
          <h1 className="font-bold text-lg">DSI Intel Platform</h1>
          <p className="text-xs text-slate-400">ระบบวิเคราะห์คดีสอบสวน</p>
        </div>

        {/* Cases Section */}
        <div className="p-4 flex-1 overflow-auto">
          <h2 className="text-sm font-semibold text-slate-400 mb-2">คดีสอบสวน</h2>
          <Button
            variant={selectedCase === null ? 'secondary' : 'ghost'}
            className="w-full justify-start text-left mb-1"
            onClick={() => setSelectedCase(null)}
          >
            📁 ทั้งหมด
          </Button>
          <div className="space-y-1">
            {cases.map((c) => (
              <Button
                key={c.case_id}
                variant={selectedCase?.case_id === c.case_id ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-sm h-auto py-2"
                onClick={() => {
                  setSelectedCase(c);
                  setActiveTab('evidence');
                }}
              >
                <div className="truncate">
                  <div className="truncate">{c.case_number}</div>
                  <div className="text-xs text-slate-400 truncate">{c.title}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Case Tabs (only when case selected) */}
        {selectedCase && (
          <div className="p-4 border-t border-slate-700">
            <h2 className="text-sm font-semibold text-slate-400 mb-2">รายละเอียดคดี</h2>
            <div className="space-y-1">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start text-left text-sm"
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b p-4 flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </Button>
          <div>
            <h2 className="font-semibold">
              {selectedCase ? `${selectedCase.case_number}: ${selectedCase.title}` : 'คดีสอบสวน'}
            </h2>
            {selectedCase?.narrative_report && (
              <p className="text-sm text-gray-500 truncate max-w-2xl">{selectedCase.narrative_report}</p>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {!selectedCase ? (
            <CasesList cases={cases} onSelect={(c) => { setSelectedCase(c); setActiveTab('evidence'); }} onRefresh={fetchCases} />
          ) : (
            <div className="max-w-6xl mx-auto">
              {activeTab === 'evidence' && <EvidencePanel caseId={selectedCase.case_id} />}
              {activeTab === 'personas' && <PersonaPanel caseId={selectedCase.case_id} />}
              {activeTab === 'search' && <SearchPanel caseId={selectedCase.case_id} />}
              {activeTab === 'pins' && <PinsPanel caseId={selectedCase.case_id} />}
              {activeTab === 'chat' && <ChatPanel caseId={selectedCase.case_id} caseData={selectedCase} />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
