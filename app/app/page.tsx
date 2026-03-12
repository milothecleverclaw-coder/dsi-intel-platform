'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CasesList } from './components/CasesList';
import { NarrativePanel } from './components/NarrativePanel';
import { EvidencePanel } from './components/EvidencePanel';
import { PersonaPanel } from './components/PersonaPanel';
import { SearchPanel } from './components/SearchPanel';
import { PinsPanel } from './components/PinsPanel';
import { ChatPanel } from './components/ChatPanel';
import { cn } from '@/lib/utils';
import { 
  PanelLeft, 
  FolderOpen, 
  FileText, 
  Users, 
  Search, 
  Pin, 
  Bot,
  Shield,
  BookOpen
} from 'lucide-react';

interface Case {
  case_id: string;
  case_number: string;
  title: string;
  status: string;
  narrative_report?: string;
  case_narrative?: string;
}

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [activeTab, setActiveTab] = useState<'narrative' | 'evidence' | 'personas' | 'search' | 'pins' | 'chat'>('narrative');

  const fetchCases = () => {
    fetch('/api/cases')
      .then((r) => r.json())
      .then(setCases);
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const tabs = [
    { id: 'narrative' as const, label: 'สำนวนคดี', icon: BookOpen },
    { id: 'evidence' as const, label: 'หลักฐาน', icon: FileText },
    { id: 'personas' as const, label: 'บุคคล', icon: Users },
    { id: 'search' as const, label: 'ค้นหา', icon: Search },
    { id: 'pins' as const, label: 'หมุด', icon: Pin },
    { id: 'chat' as const, label: 'AI วิเคราะห์', icon: Bot },
  ];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-[280px]' : 'w-0 overflow-hidden'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-yellow-300" />
            <div>
              <h1 className="font-bold text-lg text-slate-50">DSI Intel Platform</h1>
              <p className="text-xs text-slate-400">ระบบวิเคราะห์คดีสอบสวน</p>
              <p className="text-[10px] text-slate-600 font-mono">5ba448c</p>
            </div>
          </div>
        </div>

        {/* Cases Section */}
        <div className="p-4 flex-1 overflow-auto">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">คดีสอบสวน</h2>
          <Button
            variant={selectedCase === null ? 'default' : 'ghost'}
            className={cn(
              "w-full justify-start text-left mb-1",
              selectedCase === null 
                ? "bg-yellow-500 hover:bg-yellow-600 text-slate-900" 
                : "text-slate-300 hover:bg-slate-800 hover:text-slate-50"
            )}
            onClick={() => setSelectedCase(null)}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            ทั้งหมด
          </Button>
          <div className="space-y-1 mt-2">
            {cases.map((c) => (
              <Button
                key={c.case_id}
                variant={selectedCase?.case_id === c.case_id ? 'default' : 'ghost'}
                className={cn(
                  "w-full justify-start text-left text-sm h-auto py-2",
                  selectedCase?.case_id === c.case_id 
                    ? "bg-yellow-500 hover:bg-yellow-600 text-slate-900" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-slate-50"
                )}
                onClick={() => {
                  setSelectedCase(c);
                  setActiveTab('narrative');
                }}
              >
                <div className="truncate">
                  <div className="truncate font-medium">{c.case_number}</div>
                  <div className="text-xs text-slate-400 truncate">{c.title}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Case Tabs (only when case selected) */}
        {selectedCase && (
          <div className="p-4 border-t border-slate-800">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">รายละเอียดคดี</h2>
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'ghost'}
                    className={cn(
                      "w-full justify-start text-left text-sm",
                      activeTab === tab.id 
                        ? "bg-yellow-500 hover:bg-yellow-600 text-slate-900" 
                        : "text-slate-300 hover:bg-slate-800 hover:text-slate-50"
                    )}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-slate-50 hover:bg-slate-800"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            {selectedCase ? (
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-slate-50">
                  {selectedCase.case_number}
                </h2>
                <span className="text-slate-500">|</span>
                <span className="text-slate-300">{selectedCase.title}</span>
                <span className={cn(
                  "px-2 py-0.5 text-xs rounded-full",
                  selectedCase.status === 'active' 
                    ? "bg-green-900/30 text-green-400 border border-green-800" 
                    : "bg-slate-700 text-slate-400 border border-slate-600"
                )}>
                  {selectedCase.status === 'active' ? 'กำลังดำเนินการ' : selectedCase.status}
                </span>
              </div>
            ) : (
              <h2 className="font-semibold text-slate-50">คดีสอบสวน</h2>
            )}
            {selectedCase?.narrative_report && (
              <p className="text-sm text-slate-500 truncate max-w-4xl">{selectedCase.narrative_report}</p>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {!selectedCase ? (
            <CasesList cases={cases} onSelect={(c) => { setSelectedCase(c); setActiveTab('narrative'); }} onRefresh={fetchCases} />
          ) : (
            <div className="max-w-6xl mx-auto">
              {activeTab === 'narrative' && <NarrativePanel caseId={selectedCase.case_id} />}
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
