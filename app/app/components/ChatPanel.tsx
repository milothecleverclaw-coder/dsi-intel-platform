'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <Avatar className="h-8 w-8">
                <AvatarFallback>{msg.role === 'user' ? 'คุณ' : 'AI'}</AvatarFallback>
              </Avatar>
              <Card className={`max-w-[80%] ${msg.role === 'user' ? 'bg-blue-50' : ''}`}>
                <CardContent className="py-3 px-4">
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </CardContent>
              </Card>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <Card className="bg-gray-50">
                <CardContent className="py-3 px-4">
                  <p className="text-gray-500">กำลังพิมพ์...</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="mt-4 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ถามคำถามเกี่ยวกับคดี..."
          className="flex-1 min-h-[80px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <Button onClick={sendMessage} disabled={loading} className="self-end">
          {loading ? '...' : 'ส่ง'}
        </Button>
      </div>
    </div>
  );
}
