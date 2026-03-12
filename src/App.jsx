import { useState } from 'react'
import FilesPage from './pages/FilesPage'
import CharactersPage from './pages/CharactersPage'
import DiagramPage from './pages/DiagramPage'
import ChatPage from './pages/ChatPage'
import { 
  FolderOpen, 
  Users, 
  GitBranch, 
  MessageCircle,
  Shield,
  Activity,
  ChevronLeft,
  ChevronRight,
  FolderOpen as CaseIcon
} from 'lucide-react'

// Mock cases for sidebar
const mockCases = [
  {
    id: 'DSI-2024-0315',
    name: 'Operation Black Lotus',
    thaiName: 'ดอกบัวดำ',
    status: 'active',
    priority: 'high',
    date: '2024-03-15',
    lead: 'พ.ต.อ. สมศักดิ์ ไทย'
  },
  {
    id: 'DSI-2024-0287',
    name: 'Operation Red Dragon',
    thaiName: 'มังกรแดง',
    status: 'active',
    priority: 'medium',
    date: '2024-02-20',
    lead: 'พ.ต.ท. วิชัย รัตน์'
  },
  {
    id: 'DSI-2024-0156',
    name: 'Operation Silver Hawk',
    thaiName: 'เหยี่ยวเงิน',
    status: 'closed',
    priority: 'high',
    date: '2024-01-10',
    lead: 'พ.ต.อ. นภา สงวน'
  },
  {
    id: 'DSI-2024-0320',
    name: 'Operation Golden Tiger',
    thaiName: 'เสือทอง',
    status: 'pending',
    priority: 'low',
    date: '2024-03-20',
    lead: 'พ.ต.ท. สุรชัย พล'
  }
]

function App() {
  const [activePage, setActivePage] = useState('files')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedCase, setSelectedCase] = useState(mockCases[0])

  const navItems = [
    { id: 'files', label: 'ไฟล์', icon: FolderOpen },
    { id: 'characters', label: 'ตัวละคร', icon: Users },
    { id: 'diagram', label: 'แผนภาพ', icon: GitBranch },
    { id: 'chat', label: 'แชท', icon: MessageCircle },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'closed': return 'bg-gray-500'
      case 'pending': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const renderPage = () => {
    switch (activePage) {
      case 'files':
        return <FilesPage selectedCase={selectedCase} />
      case 'characters':
        return <CharactersPage selectedCase={selectedCase} />
      case 'diagram':
        return <DiagramPage selectedCase={selectedCase} />
      case 'chat':
        return <ChatPage selectedCase={selectedCase} />
      default:
        return <FilesPage selectedCase={selectedCase} />
    }
  }

  return (
    <div className="min-h-screen bg-fbi-darker flex flex-col">
      {/* Header */}
      <header className="bg-fbi-dark border-b border-fbi-border px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-fbi-accent" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">
                DSI INTELLIGENCE PLATFORM
              </h1>
              <p className="text-xs text-gray-300">กรมสอบสวนคดีพิเศษ - ระบบวิเคราะห์ข้อมูล</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-fbi-success pulse-glow" />
              <span className="text-gray-300">ACTIVE</span>
            </div>
            <div className="text-xs text-gray-300 font-mono">
              {new Date().toLocaleString('th-TH')}
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Left Sidebar - Cases */}
        <div 
          className={`bg-fbi-dark border-r border-fbi-border flex flex-col transition-all duration-300 ${
            sidebarOpen ? 'w-80' : 'w-0'
          }`}
        >
          {sidebarOpen && (
            <>
              {/* Sidebar Header */}
              <div className="p-4 border-b border-fbi-border flex-shrink-0">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <CaseIcon className="w-4 h-4 text-fbi-accent" />
                  คดีทั้งหมด
                </h3>
                <p className="text-xs text-gray-300 mt-1">{mockCases.length} คดีในระบบ</p>
              </div>

              {/* Cases List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {mockCases.map((caseItem) => (
                  <button
                    key={caseItem.id}
                    onClick={() => setSelectedCase(caseItem)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedCase.id === caseItem.id
                        ? 'bg-fbi-navy border-fbi-accent'
                        : 'bg-fbi-dark border-fbi-border hover:border-fbi-accent/50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getStatusColor(caseItem.status)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{caseItem.name}</p>
                        <p className="text-xs text-gray-300">{caseItem.thaiName}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-xs ${getPriorityColor(caseItem.priority)}`}>
                            {caseItem.priority === 'high' ? 'สูง' : caseItem.priority === 'medium' ? 'ปานกลาง' : 'ต่ำ'}
                          </span>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-gray-300 font-mono">{caseItem.id}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Sidebar Footer */}
              <div className="p-3 border-t border-fbi-border flex-shrink-0">
                <button className="w-full flex items-center justify-center gap-2 bg-fbi-accent hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors">
                  <Shield className="w-4 h-4" />
                  สร้างคดีใหม่
                </button>
              </div>
            </>
          )}
        </div>

        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-0 top-20 z-50 bg-fbi-dark border border-fbi-border border-l-0 rounded-r-lg p-2 hover:bg-fbi-navy transition-colors shadow-lg"
          style={{ marginLeft: sidebarOpen ? '20rem' : '0' }}
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-300" />
          )}
        </button>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Navigation Tabs */}
          <nav className="bg-fbi-navy border-b border-fbi-border flex-shrink-0">
            <div className="flex">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
                    activePage === item.id
                      ? 'bg-fbi-blue text-white border-b-2 border-fbi-accent'
                      : 'text-gray-300 hover:text-white hover:bg-fbi-dark'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Page Content */}
          <main className="flex-1 overflow-hidden">
            {renderPage()}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-fbi-dark border-t border-fbi-border px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-300">
          <div className="flex items-center gap-4">
            <span>🔒 CLASSIFIED - DSI INTERNAL USE ONLY</span>
          </div>
          <div className="flex items-center gap-4">
            <span>CASE: {selectedCase.id}</span>
            <span>|</span>
            <span>OPERATION: {selectedCase.name.toUpperCase()}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App