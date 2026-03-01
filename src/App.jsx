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
  Activity
} from 'lucide-react'

function App() {
  const [activePage, setActivePage] = useState('files')

  const navItems = [
    { id: 'files', label: 'ไฟล์', icon: FolderOpen },
    { id: 'characters', label: 'ตัวละคร', icon: Users },
    { id: 'diagram', label: 'แผนภาพ', icon: GitBranch },
    { id: 'chat', label: 'แชท', icon: MessageCircle },
  ]

  const renderPage = () => {
    switch (activePage) {
      case 'files':
        return <FilesPage />
      case 'characters':
        return <CharactersPage />
      case 'diagram':
        return <DiagramPage />
      case 'chat':
        return <ChatPage />
      default:
        return <FilesPage />
    }
  }

  return (
    <div className="min-h-screen bg-fbi-darker flex flex-col">
      {/* Header */}
      <header className="bg-fbi-dark border-b border-fbi-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-fbi-accent" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">
                DSI INTELLIGENCE PLATFORM
              </h1>
              <p className="text-xs text-fbi-muted">กรมสอบสวนคดีพิเศษ - ระบบวิเคราะห์ข้อมูล</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-fbi-success pulse-glow" />
              <span className="text-fbi-muted">ACTIVE</span>
            </div>
            <div className="text-xs text-fbi-muted font-mono">
              {new Date().toLocaleString('th-TH')}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-fbi-navy border-b border-fbi-border">
        <div className="flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
                activePage === item.id
                  ? 'bg-fbi-blue text-white border-b-2 border-fbi-accent'
                  : 'text-fbi-muted hover:text-white hover:bg-fbi-dark'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="bg-fbi-dark border-t border-fbi-border px-4 py-2">
        <div className="flex items-center justify-between text-xs text-fbi-muted">
          <div className="flex items-center gap-4">
            <span>🔒 CLASSIFIED - DSI INTERNAL USE ONLY</span>
          </div>
          <div className="flex items-center gap-4">
            <span>CASE: DSI-2024-0315</span>
            <span>|</span>
            <span>OPERATION: BLACK LOTUS</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
