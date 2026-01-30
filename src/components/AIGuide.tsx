import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { MessageCircle, X, Send, Loader2, Sparkles, Bot, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-guide`;

const AIGuide = () => {
  const { t, language } = useLanguage();
  const { userType } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: t('aiGuide.welcome') }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleNavigate = (page: string) => {
    const routes: Record<string, string> = {
      home: '/',
      auth: '/auth',
      dashboard: userType === 'customer' ? '/customer' : '/dashboard',
      terms: '/terms',
      cart: '/cart',
      customer: '/customer',
    };
    
    const routeNames: Record<string, string> = {
      home: t('aiGuide.home'),
      auth: t('aiGuide.login'),
      dashboard: userType === 'customer' ? t('aiGuide.myAccount') : t('aiGuide.dashboard'),
      terms: t('aiGuide.terms'),
      cart: t('aiGuide.cart'),
      customer: t('aiGuide.myAccount'),
    };
    
    const route = routes[page];
    if (route) {
      navigate(route);
      toast({
        title: t('aiGuide.navigated'),
        description: `${t('aiGuide.navigatedTo')} ${routeNames[page]}`,
      });
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMessage].slice(-5) }), // Reduced for faster response
      });

      if (!resp.ok || !resp.body) {
        throw new Error('فشل في الاتصال');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let toolCallData = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta;
            
            if (delta?.content) {
              assistantContent += delta.content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant' && prev.length > 1) {
                  return prev.map((m, i) => 
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: 'assistant', content: assistantContent }];
              });
            }

            if (delta?.tool_calls) {
              for (const toolCall of delta.tool_calls) {
                if (toolCall.function?.arguments) {
                  toolCallData += toolCall.function.arguments;
                }
              }
            }

            const finishReason = parsed.choices?.[0]?.finish_reason;
            if (finishReason === 'tool_calls' && toolCallData) {
              try {
                const args = JSON.parse(toolCallData);
                if (args.page) {
                  handleNavigate(args.page);
                }
              } catch {
                // Ignore parse errors
              }
            }
          } catch {
            // Incomplete JSON, continue
          }
        }
      }
    } catch (error) {
      console.error('AI Guide error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: t('aiGuide.error') }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    t('aiGuide.q1'),
    t('aiGuide.q2'),
    t('aiGuide.q3'),
  ];

  return (
    <>
      {/* Floating AI Guide Button with Label - Smaller */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex flex-col items-center gap-1 transition-all duration-300 ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-10 w-10 rounded-full shadow-xl shadow-primary/30"
          size="icon"
        >
          <Bot className="h-4 w-4" />
        </Button>
        <span className="text-[10px] font-medium text-muted-foreground bg-background/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-border">
          {t('aiGuide.smartGuide')}
        </span>
      </div>

      <div
        className={`fixed bottom-6 right-6 z-50 w-[90vw] max-w-[380px] transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary to-red-700 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">{t('aiGuide.title')}</CardTitle>
                  <p className="text-xs text-white/80">{t('aiGuide.online')}</p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-[350px] p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? `bg-primary text-white ${language === 'ar' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`
                          : `bg-muted ${language === 'ar' ? 'rounded-tl-sm' : 'rounded-tr-sm'}`
                      }`}
                    >
                      {msg.content.split('\n').map((line, i) => (
                        <p key={i} className={i > 0 ? 'mt-1' : ''}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
                
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className={`bg-muted rounded-2xl ${language === 'ar' ? 'rounded-tl-sm' : 'rounded-tr-sm'} px-4 py-3`}>
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>

              {messages.length === 1 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-muted-foreground">{t('aiGuide.quickQuestions')}</p>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInput(q);
                        }}
                        className="text-xs bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-full transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>

            <div className="border-t p-3">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('aiGuide.placeholder')}
                  className="flex-1 h-10"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-10 w-10"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AIGuide;