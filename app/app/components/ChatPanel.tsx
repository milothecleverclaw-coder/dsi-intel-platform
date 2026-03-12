'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Shield } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  caseId: string;
  caseData: {
    title: string;
    narrative_report?: string;
  };
}

export function ChatPanel({ caseId, caseData }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'สวัสดีครับ ผมเป็นผู้ช่วยวิเคราะห์คดีของ DSI ยินดีให้ความช่วยเหลือในการวิเคราะห์คดีครับ',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [personas, setPersonas] = useState<any[]>([]);
  const [pins, setPins] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/personas?caseId=${caseId}`).then((r) => r.json()).then(setPersonas);
    fetch(`/api/pins?caseId=${caseId}`).then((r) => r.json()).then(setPins);
  }, [caseId]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          caseContext: caseData.narrative_report || caseData.title,
          personas,
          pins,
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: 'assistant', content: data.response }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: 'ขออภัย ไม่สามารถเชื่อมต่อ AI ได้ในขณะนี้' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4 pb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <Avatar className={`h-8 w-8 border ${msg.role === 'user' ? 'bg-slate-700 border-slate-600' : 'bg-red-900/30 border-red-800'}`}>
                <AvatarFallback className={msg.role === 'user' ? 'text-slate-300' : 'text-red-400'}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <Card className={`max-w-[80%] border ${
                msg.role === 'user' 
                  ? 'bg-slate-800 border-slate-700' 
                  : 'bg-red-900/10 border-red-900/30'
              }`}>
                <CardContent className="py-3 px-4">
                  <p className="whitespace-pre-wrap text-slate-50">{msg.content}</p>
                </CardContent>
              </Card>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 bg-red-900/30 border-red-800">
                <AvatarFallback className="text-red-400">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-red-900/10 border-red-900/30">
                <CardContent className="py-3 px-4">
                  <p className="text-slate-400 flex items-center gap-2">
                    <span className="animate-pulse">กำลังพิมพ์</span>
                    <span className="flex gap-0.5">
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                    </span>
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="mt-4 pt-4 border-t border-slate-800">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ถามคำถามเกี่ยวกับคดี..."
            className="flex-1 min-h-[80px] bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-red-600 focus:ring-red-600/20 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button 
            onClick={sendMessage} 
            disabled={loading} 
            className="self-end bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 h-10"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
          <Shield className="h-3 w-3" />
          ข้อมูลการสนทนาถูกเข้ารหัสและจัดเก็บอย่างปลอดภัย
        </p>
      </div>
    </div>
  );
}
