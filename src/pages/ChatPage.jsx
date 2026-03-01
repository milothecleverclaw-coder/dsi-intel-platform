import { useState, useRef, useEffect } from 'react'
import { chatHistory as initialChatHistory, caseInfo } from '../data/mockData'
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Users,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Clock,
  Shield
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

function ChatPage() {
  const [messages, setMessages] = useState(initialChatHistory)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [chatMode, setChatMode] = useState('private')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState(mockCases[0])
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    setTimeout(() => {
      const aiResponses = {
        'ใครเชื่อมโยงกับสมชายบ้าง': `จากการวิเคราะห์ข้อมูล พบบุคคลที่เชื่อมโยงกับ **สมชาย ศรีวิจิตร (พ่อใหญ่)** ดังนี้:

1. **วิไล มั่งมี (นายหญิง)** - ธุรการเงิน
2. **ธนกร เงินทอง (เด็ก)** - คนขับขนเงิน  
3. **อรุณ แสงสว่าง** - ทนายความ
4. **นพ.กิตติ ศักดิ์สิทธิ์ (หมอ)** - ช่องทางฟอกเงิน`,

        'แสดงเส้นทางการโอนเงิน': `📊 **เส้นทางการโอนเงินที่ตรวจพบ**

สมชาย → วิไล → นพ.กิตติ → คลินิกเวชกรรม

**สรุปยอดเงิน:**
- ยอดโอนรวม: 23.5 ล้านบาท
- จำนวนรายการ: 15 รายการ`,

        'default': `ขอบคุณคำถามครับ จากการวิเคราะห์ข้อมูลในระบบ:

📌 **สรุปสิ่งที่พบ:**
- มีความเชื่อมโยงระหว่างบุคคลที่เกี่ยวข้อง
- พบหลักฐานการโอนเงินผิดปกติ
- มีบันทึกการสนทนาที่เกี่ยวข้อง

ต้องการให้วิเคราะห์เพิ่มเติมในด้านไหนครับ?`
      }

      const response = aiResponses[inputValue] || aiResponses['default']

      const aiMessage = {
        id: `msg-${Date.now()}`,
        type: 'ai',
        content: response,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const quickQuestions = [
    'ใครเชื่อมโยงกับสมชายบ้าง',
    'แสดงเส้นทางการโอนเงินทั้งหมด',
    'มีหลักฐานอะไรบ้างที่เกี่ยวกับการฟอกเงิน',
    'วิไลพูดอะไรกับสมชายในวันที่ 15 มีนาคม'
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

  return (
    <div className="h-full flex overflow-hidden">
      {/* Collapsible Left Sidebar - Cases */}
      <div 
        className={`bg-fbi-dark border-r border-fbi-border flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'w-72' : 'w-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-fbi-border flex-shrink-0">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-fbi-accent" />
            คดีทั้งหมด
          </h3>
          <p className="text-xs text-fbi-muted mt-1">{mockCases.length} คดีในระบบ</p>
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
                <div className={`w-2 h-2 rounded-full mt-1.5 ${getStatusColor(caseItem.status)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{caseItem.name}</p>
                  <p className="text-xs text-fbi-muted">{caseItem.thaiName}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-xs ${getPriorityColor(caseItem.priority)}`}>
                      {caseItem.priority === 'high' ? 'สูง' : caseItem.priority === 'medium' ? 'ปานกลาง' : 'ต่ำ'}
                    </span>
                    <span className="text-xs text-fbi-muted">•</span>
                    <span className="text-xs text-fbi-muted">{caseItem.id}</span>
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
      </div>

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-fbi-dark border border-fbi-border border-l-0 rounded-r-lg p-2 hover:bg-fbi-navy transition-colors"
        style={{ marginLeft: sidebarOpen ? '18rem' : '0' }}
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-4 h-4 text-fbi-muted" />
        ) : (
          <ChevronRight className="w-4 h-4 text-fbi-muted" />
        )}
      </button>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header - Fixed */}
        <div className="bg-fbi-dark border-b border-fbi-border p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-fbi-accent/20 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-fbi-accent" />
              </div>
              <div>
                <h3 className="text-white font-medium">AI ผู้ช่วยสืบสวน</h3>
                <p className="text-xs text-fbi-muted flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {selectedCase.name} ({selectedCase.id})
                </p>
              </div>
            </div>

            {/* Chat Mode Toggle */}
            <div className="flex items-center gap-2 bg-fbi-navy rounded-lg p-1">
              <button
                onClick={() => setChatMode('private')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                  chatMode === 'private' 
                    ? 'bg-fbi-accent text-white' 
                    : 'text-fbi-muted hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                ส่วนตัว
              </button>
              <button
                onClick={() => setChatMode('room')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                  chatMode === 'room' 
                    ? 'bg-fbi-accent text-white' 
                    : 'text-fbi-muted hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                ห้องรวม
              </button>
            </div>
          </div>
        </div>

        {/* Messages - Scrollable only this section */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                msg.type === 'user' 
                  ? 'bg-fbi-accent/20' 
                  : 'bg-fbi-navy'
              }`}>
                {msg.type === 'user' 
                  ? <User className="w-4 h-4 text-fbi-accent" />
                  : <Bot className="w-4 h-4 text-purple-400" />
                }
              </div>

              {/* Message Content */}
              <div className={`max-w-2xl ${msg.type === 'user' ? 'text-right' : ''}`}>
                <div className={`rounded-lg p-3 ${
                  msg.type === 'user'
                    ? 'bg-fbi-accent text-white'
                    : 'bg-fbi-navy text-gray-100'
                }`}>
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                </div>
                
                {/* Message Meta */}
                <div className={`flex items-center gap-2 mt-1 text-xs text-fbi-muted ${
                  msg.type === 'user' ? 'justify-end' : ''
                }`}>
                  <span>{formatTime(msg.timestamp)}</span>
                  {msg.type === 'ai' && (
                    <>
                      <button className="hover:text-white">
                        <Copy className="w-3 h-3" />
                      </button>
                      <button className="hover:text-green-400">
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button className="hover:text-red-400">
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-fbi-navy rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-purple-400" />
              </div>
              <div className="bg-fbi-navy rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-fbi-accent" />
                <span className="text-sm text-fbi-muted">กำลังวิเคราะห์...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions - Fixed above input */}
        <div className="px-4 py-2 border-t border-fbi-border bg-fbi-dark flex-shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <Sparkles className="w-4 h-4 text-fbi-accent flex-shrink-0" />
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setInputValue(q)}
                className="px-3 py-1 bg-fbi-navy hover:bg-fbi-blue rounded-full text-xs text-fbi-muted hover:text-white whitespace-nowrap transition-colors flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="p-4 border-t border-fbi-border bg-fbi-dark flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="ถามคำถามเกี่ยวกับคดี..."
              className="flex-1 bg-fbi-navy border border-fbi-border rounded-lg px-4 py-2 text-white placeholder-fbi-muted focus:outline-none focus:border-fbi-accent"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="px-4 py-2 bg-fbi-accent hover:bg-blue-600 disabled:bg-fbi-navy disabled:text-fbi-muted text-white rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Side Panel - Chat Room Info */}
      {chatMode === 'room' && (
        <div className="w-72 bg-fbi-dark border-l border-fbi-border flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-fbi-border flex-shrink-0">
            <h3 className="text-sm font-medium text-white">ห้องรวม: {selectedCase.id}</h3>
            <p className="text-xs text-fbi-muted mt-1">3 คนออนไลน์</p>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <h4 className="text-xs font-medium text-fbi-muted mb-3">เจ้าหน้าที่ในห้อง</h4>
            <div className="space-y-3">
              {[
                { name: 'พ.ต.อ. สมศักดิ์', role: 'หัวหน้าทีม', online: true },
                { name: 'ร.ต.อ. ประยุทธ์', role: 'ผู้ช่วย', online: true },
                { name: 'คุณวิภา', role: 'นักวิเคราะห์', online: true },
              ].map((user, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-fbi-navy rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-fbi-muted" />
                    </div>
                    {user.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-fbi-dark" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white">{user.name}</p>
                    <p className="text-xs text-fbi-muted">{user.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-fbi-border flex-shrink-0">
            <h4 className="text-xs font-medium text-fbi-muted mb-3">กิจกรรมล่าสุด</h4>
            <div className="space-y-2 text-xs">
              <div className="bg-fbi-navy p-2 rounded">
                <span className="text-fbi-accent">พ.ต.อ. สมศักดิ์</span>
                <span className="text-fbi-muted"> อัพโหลดไฟล์ใหม่</span>
              </div>
              <div className="bg-fbi-navy p-2 rounded">
                <span className="text-fbi-accent">ร.ต.อ. ประยุทธ์</span>
                <span className="text-fbi-muted"> เพิ่มตัวละครใหม่</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatPage