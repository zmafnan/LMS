import { useCallback, useEffect, useState, useRef } from 'react'
import { 
  Title, Group, Card, Button, TextInput, Badge, Avatar, Text, Stack, Box, Loader, ScrollArea, Paper, ActionIcon, useMantineColorScheme 
} from '@mantine/core'
import { Send, RefreshCw, MessagesSquare } from 'lucide-react'
import { getMessages, postMessage } from '../../services/discussionService'
import useAuthStore from '../../store/authStore'
import { notifications } from '@mantine/notifications'

export default function DiscussionPage() {
  const { user } = useAuthStore()
  const { colorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [posting, setPosting] = useState(false)

  const messagesEndRef = useRef(null)
  const scrollAreaRef = useRef(null)

  // Fetch messages from backend
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [])

  const loadMessages = useCallback((silent = false) => {
    if (!silent) setLoading(true)
    getMessages()
      .then((res) => {
        setMessages(res)
        scrollToBottom()
      })
      .catch(() => {
        if (!silent) {
          notifications.show({
            title: 'Connection Error',
            message: 'Failed to retrieve discussion board messages.',
            color: 'red',
          })
        }
      })
      .finally(() => {
        if (!silent) setLoading(false)
      })
  }, [scrollToBottom])

  // Load messages on mount and start polling
  useEffect(() => {
    const initialLoad = setTimeout(() => {
      loadMessages()
    }, 0)
    
    // Auto-refresh chat thread every 5 seconds
    const interval = setInterval(() => {
      loadMessages(true)
    }, 5000)

    return () => {
      clearTimeout(initialLoad)
      clearInterval(interval)
    }
  }, [loadMessages])

  // Send message
  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setPosting(true)
    try {
      await postMessage(newMessage)
      setNewMessage('')
      loadMessages(true)
      scrollToBottom()
    } catch (err) {
      notifications.show({
        title: 'Failed to Send',
        message: err.message || 'Error occurred while sending your message.',
        color: 'red',
      })
    } finally {
      setPosting(false)
    }
  }

  // Helper to format role names and assign colors
  const getRoleBadge = (role) => {
    const r = (role || '').toLowerCase()
    let color = 'gray'
    let label = 'Staff'

    if (r === 'admin') {
      color = 'red'
      label = 'Admin'
    } else if (r === 'leader') {
      color = 'blue'
      label = 'Leader'
    } else if (r === 'pic') {
      color = 'green'
      label = 'PIC'
    } else if (r === 'production_admin') {
      color = 'grape'
      label = 'Prod Admin'
    }

    return <Badge size="xs" variant="light" color={color}>{label}</Badge>
  }

  return (
    <Stack gap="md" style={{ height: 'calc(100vh - 100px)' }}>
      {/* Page Header */}
      <Group justify="space-between">
        <Group gap="xs">
          <Box className="lms-page-icon">
            <MessagesSquare size={22} />
          </Box>
          <div>
            <Title order={2} style={{ letterSpacing: '0' }}>Discussion Forum</Title>
            <Text size="xs" c="dimmed">Collaborative workspace to chat, coordinate, and share insights</Text>
          </div>
        </Group>
        <Button 
          variant="filled" 
          color="orange" 
          leftSection={<RefreshCw size={14} />} 
          onClick={() => loadMessages()}
          loading={loading}
          radius="md"
        >
          Refresh Feed
        </Button>
      </Group>

      {/* Main Chat Box */}
      <Card 
        withBorder 
        p="0" 
        radius="md" 
          style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            backgroundColor: 'var(--lms-surface-dim)',
            overflow: 'hidden',
            borderColor: 'var(--lms-border)'
          }}
      >
        {loading && messages.length === 0 ? (
          <Group justify="center" align="center" style={{ flex: 1 }}>
            <Stack align="center" gap="xs">
              <Loader color="orange" size="md" />
              <Text size="sm" color="dimmed">Loading conversation feed...</Text>
            </Stack>
          </Group>
        ) : (
          <ScrollArea 
            viewportRef={scrollAreaRef} 
            style={{ flex: 1, padding: '20px' }} 
            scrollbarSize={6}
          >
            <Stack gap="md">
              {messages.length === 0 ? (
                <Group justify="center" align="center" style={{ minHeight: '200px' }}>
                  <Text c="dimmed" size="sm">No discussion messages yet. Start the conversation!</Text>
                </Group>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.user_id === user?.id
                  return (
                    <Box 
                      key={msg.id} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: isOwn ? 'flex-end' : 'flex-start',
                        width: '100%'
                      }}
                    >
                      <Group align="flex-start" gap="xs" style={{ maxWidth: 'min(760px, 82%)', flexWrap: 'nowrap' }}>
                        {!isOwn && (
                          <Avatar color="blue" radius="xl" size="md" style={{ flexShrink: 0 }}>
                            {msg.username?.substring(0, 2).toUpperCase()}
                          </Avatar>
                        )}
                        <Stack gap="2px">
                          {!isOwn && (
                            <Group gap="xs" align="center">
                              <Text size="xs" fw={800} style={{ color: 'var(--lms-accent-strong)' }}>
                                {msg.username}
                              </Text>
                              {getRoleBadge(msg.role)}
                            </Group>
                          )}
                          <Paper
                            p="md"
                            radius="md"
                            styles={{
                              root: {
                                background: isOwn 
                                  ? 'linear-gradient(135deg, var(--lms-accent), var(--lms-accent-strong))' 
                                  : 'var(--lms-surface)',
                                color: isOwn ? '#ffffff' : 'var(--lms-text-primary)',
                                borderRadius: isOwn ? '8px 8px 2px 8px' : '8px 8px 8px 2px',
                                boxShadow: isDark ? '0 12px 28px rgba(0, 0, 0, 0.22)' : '0 10px 24px rgba(23, 32, 51, 0.08)',
                                border: isOwn ? 'none' : '1px solid var(--lms-border)'
                              }
                            }}
                          >
                            <Text size="sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {msg.message}
                            </Text>
                          </Paper>
                          <Text 
                            size="10px" 
                            c="dimmed" 
                            ta={isOwn ? 'right' : 'left'} 
                            style={{ padding: '0 4px' }}
                          >
                            {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : ''}
                          </Text>
                        </Stack>
                      </Group>
                    </Box>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </Stack>
          </ScrollArea>
        )}

        {/* Input Form Footer */}
        <Box 
          p="md" 
          style={{ 
            borderTop: '1px solid var(--lms-border)',
            backgroundColor: 'var(--lms-surface)' 
          }}
        >
          <form onSubmit={handleSend}>
            <Group gap="sm" style={{ flexWrap: 'nowrap' }}>
              <TextInput
                placeholder="Ketik pesan diskusi..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{ flex: 1 }}
                radius="md"
                required
                disabled={posting}
                autoComplete="off"
              />
              <ActionIcon 
                type="submit" 
                color="orange" 
                size="lg" 
                radius="md"
                loading={posting}
                disabled={!newMessage.trim()}
              >
                <Send size={18} />
              </ActionIcon>
            </Group>
          </form>
        </Box>
      </Card>
    </Stack>
  )
}
