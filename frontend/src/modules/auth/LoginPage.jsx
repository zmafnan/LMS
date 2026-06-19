import React, { useState } from 'react'
import { Container, Paper, TextInput, PasswordInput, Button, Title, Text, Box, LoadingOverlay, Stack } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useNavigate } from 'react-router-dom'
import { LockKeyhole, UserRound, ArrowRight } from 'lucide-react'
import { login as apiLogin } from '../../services/authService'
import useAuthStore from '../../store/authStore'
import logoLean from '../../assets/logo-lean.png'

const isProductionAdmin = (role) => String(role || '').toLowerCase().replace(/[\s-]+/g, '_') === 'production_admin'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const loginStore = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) {
      notifications.show({
        title: 'Error',
        message: 'Please enter both username and password.',
        color: 'red',
      })
      return
    }

    setLoading(true)
    try {
      const response = await apiLogin(username, password)
      loginStore(response)
      notifications.show({
        title: 'Welcome Back',
        message: `Logged in successfully as ${response.user.username}.`,
        color: 'green',
      })
      navigate(isProductionAdmin(response.user?.role) ? '/multiskill' : '/dashboard')
    } catch (err) {
      notifications.show({
        title: 'Login Failed',
        message: err.message || 'Invalid credentials. Please try again.',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
      
      <Container size="xs" style={{ width: '100%', maxWidth: '420px', zIndex: 1 }}>
        <Paper 
          withBorder 
          shadow="2xl" 
          p={{ base: 32, sm: 40 }} 
          radius="lg" 
          style={{
            background: 'var(--lms-glass-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--lms-glass-border)',
            boxShadow: 'var(--lms-card-shadow)',
          }}
        >
          <Stack gap="xl" align="center" mb="lg">
            <img 
              src={logoLean} 
              alt="LEAN MS Logo" 
              style={{ 
                height: '70px', 
                objectFit: 'contain'
              }} 
              className="login-logo"
            />
            <Stack gap="xs" align="center" style={{ textAlign: 'center' }}>
              <Title order={2} style={{ 
                fontSize: '1.65rem', 
                fontWeight: 800, 
                letterSpacing: '-0.5px',
                lineHeight: 1.2,
                color: 'var(--lms-text-primary)'
              }}>
                LEAN MANAGEMENT SYSTEM
              </Title>
              <Text size="xs" fw={700} style={{ color: 'var(--lms-accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                PT Ultimate Noble Indonesia
              </Text>
            </Stack>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput 
                label="Username" 
                placeholder="Username" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                radius="md"
                size="md"
                leftSection={<UserRound size={16} />}
              />
              <PasswordInput 
                label="Password" 
                placeholder="Your password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                radius="md"
                size="md"
                leftSection={<LockKeyhole size={16} />}
              />
              <Button 
                type="submit" 
                fullWidth 
                mt="md" 
                color="orange" 
                radius="md" 
                size="md" 
                rightSection={<ArrowRight size={16} />}
              >
                Sign In
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  )
}
