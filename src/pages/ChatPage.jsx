import { useState, useRef, useEffect } from 'react'
import { chatHistory as initialChatHistory } from '../data/mockData'
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Users
} from 'lucide-react'

function ChatPage({ selectedCase }) {
  const [messages, setMessages] = useState(initialChatHistory)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [chatMode, setChatMode] = useState('private')
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

  return (
    <div className="h-full flex">
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
                <p className="text-xs text-fbi-muted">
                  {selectedCase?.name} ({selectedCase?.id})
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
            <h3 className="text-sm font-medium text-white">ห้องรวม: {selectedCase?.id}</h3>
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