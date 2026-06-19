import { useState, useEffect } from 'react'
import { AppShell, Burger, Group, NavLink, Title, Button, Text, ActionIcon, useMantineColorScheme, Menu, Avatar, Box, Stack, Badge, Tooltip, Divider, Modal, TextInput, FileButton } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, BarChart3, Settings, LogOut, Sun, Moon, User, Award, ShieldCheck, Lightbulb, Factory, Sparkles, MessagesSquare, Camera, Save } from 'lucide-react'
import useAuthStore from '../store/authStore'
import { updateProfile } from '../services/authService'
import { notifications } from '@mantine/notifications'

import logoLean from '../assets/logo-lean.png'

const isProductionAdmin = (role) => String(role || '').toLowerCase().replace(/[\s-]+/g, '_') === 'production_admin'

const getAvatarSrc = (avatarUrl) => {
  if (!avatarUrl) return null
  if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl
  const cleanPath = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`
  
  if (import.meta.env.DEV) {
    return `http://localhost:8080${cleanPath}`
  }

  const path = window.location.pathname
  const publicIndex = path.indexOf('/public/')
  if (publicIndex !== -1) {
    return path.substring(0, publicIndex) + '/public' + cleanPath
  }
  return cleanPath
}

export default function MainLayout() {
  const { token, user, logout, hasRole, updateUser } = useAuthStore()
  const [opened, { toggle }] = useDisclosure()
  const [profileOpened, { open: openProfile, close: closeProfile }] = useDisclosure(false)
  const [profileForm, setProfileForm] = useState({ username: '', email: '' })
  const [avatarFile, setAvatarFile] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
  
  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  const navigate = useNavigate()
  const location = useLocation()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  const isProdAdmin = isProductionAdmin(user?.role)

  if (isProdAdmin && location.pathname !== '/multiskill') {
    return <Navigate to="/multiskill" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const avatarSrc = getAvatarSrc(user?.avatar_url)
  const avatarPreview = avatarFile ? URL.createObjectURL(avatarFile) : avatarSrc

  const handleOpenProfile = () => {
    setProfileForm({
      username: user?.username || '',
      email: user?.email || '',
    })
    setAvatarFile(null)
    openProfile()
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const response = await updateProfile({
        username: profileForm.username,
        email: profileForm.email,
        avatar: avatarFile,
      })
      updateUser(response.user)
      notifications.show({
        title: 'Profile updated',
        message: 'Foto dan data profil berhasil disimpan.',
        color: 'green',
      })
      closeProfile()
    } catch (error) {
      notifications.show({
        title: 'Profile update failed',
        message: error?.message || 'Gagal menyimpan profil.',
        color: 'red',
      })
    } finally {
      setSavingProfile(false)
    }
  }

  const menuSections = []

  if (!isProdAdmin) {
    const coreItems = [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { label: 'Task Management', icon: ClipboardList, path: '/tasks' },
      { label: 'Forum Discussion', icon: MessagesSquare, path: '/discussions' },
      { label: 'Reports', icon: BarChart3, path: '/reports' }
    ]
    
    // Expose Master Data menu for Admin and Leaders
    if (hasRole(['admin', 'leader'])) {
      coreItems.push({ label: 'Master Data', icon: Settings, path: '/master' })
    }

    menuSections.push({ title: 'Workspace', items: coreItems })

    // 6S Audit nested items
    menuSections.push({
      title: 'Operational Excellence',
      items: [
        {
          label: '6S Audit',
          icon: ShieldCheck,
          path: '/6S',
          children: [
            { label: 'Dashboard', path: '/6S/dashboard' },
            { label: 'Advanced Dashboard', path: '/6S/advanced-dashboard' },
            { label: 'Trend', path: '/6S/trend' },
            { label: 'Department', path: '/6S/departement' },
            { label: 'Schedule', path: '/6S/schedule' },
            { label: 'Production Audit', path: '/6S/production-audit' },
            { label: 'Non Production Audit', path: '/6S/non-production-audit' }
          ]
        },
        {
          label: 'Kaizen Tracking',
          icon: Lightbulb,
          path: '/kaizen',
          children: [
            { label: 'Dashboard', path: '/kaizen/dashboard' },
            { label: 'Admin Panel', path: '/kaizen/admin' },
            { label: 'Rankings', path: '/kaizen/rankingsweb' },
            { label: 'Pass Data', path: '/kaizen/master-data-web' }
          ]
        }
      ]
    })
  }

  const capabilityItems = [
    { label: isProdAdmin ? 'Multi Skill C2B' : 'Multi Skill Management', icon: Award, path: '/multiskill' }
  ]
  if (!isProdAdmin) {
    capabilityItems.push({ label: 'Lean Multi Skill', icon: Award, path: '/lean-multiskill' })
  }
  menuSections.push({ title: isProdAdmin ? 'Production Access' : 'Capability Matrix', items: capabilityItems })

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 286,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding={{ base: 'sm', md: 'lg' }}
      className="lms-shell"
      styles={{
        main: {
          background: 'var(--mantine-color-body)',
          minHeight: '100vh',
          transition: 'background-color 0.2s ease, padding 0.2s ease',
        },
        navbar: {
          background: 'var(--lms-sidebar-bg)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderRight: '1px solid var(--lms-glass-border)',
        },
        header: {
          background: 'var(--lms-header-bg)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid var(--lms-glass-border)',
        }
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group gap="xs" className="lms-brand" onClick={() => navigate(isProdAdmin ? '/multiskill' : '/dashboard')} style={{ cursor: 'pointer' }}>
              <img 
                src={logoLean} 
                alt="LEAN MS Logo" 
                style={{ 
                  height: '40px', 
                  objectFit: 'contain',
                  filter: colorScheme === 'dark' ? 'brightness(0) invert(1)' : 'none',
                  transition: 'filter 0.2s ease'
                }} 
              />
              <Title order={3} className="lms-brand-title" style={{ 
                letterSpacing: '0',
                fontWeight: 900,
              }}>
                LEAN MS
              </Title>
              {isProdAdmin && (
                <Badge color="orange" variant="light" size="sm" leftSection={<Sparkles size={12} />}>
                  C2B
                </Badge>
              )}
            </Group>
          </Group>

          <Group gap="md">
            <Box style={{ textAlign: 'right', lineHeight: 1.15 }} visibleFrom="sm" mr="xs">
              <Text size="sm" fw={800} style={{ color: 'var(--lms-accent)', fontFamily: 'monospace' }}>
                {formattedTime}
              </Text>
              <Text size="10px" color="dimmed" fw={500}>
                {formattedDate}
              </Text>
            </Box>

            <Tooltip label={colorScheme === 'dark' ? 'Light mode' : 'Dark mode'}>
              <ActionIcon 
                onClick={() => toggleColorScheme()} 
                variant="default" 
                size="lg" 
                radius="md"
                aria-label="Toggle color scheme"
              >
                {colorScheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </ActionIcon>
            </Tooltip>

            <Menu shadow="md" width={200} trigger="hover" openDelay={100} closeDelay={400}>
              <Menu.Target>
                <Group style={{ cursor: 'pointer' }} gap="xs">
                  <Avatar src={avatarSrc} color="blue" radius="xl">
                    {user?.username?.substring(0, 2).toUpperCase()}
                  </Avatar>
                  <Box style={{ display: 'flex', flexDirection: 'column' }} visibleFrom="sm">
                    <Text size="sm" fw={600}>{user?.username}</Text>
                    <Text size="xs" color="dimmed" style={{ textTransform: 'capitalize' }}>
                      {user?.role}
                    </Text>
                  </Box>
                </Group>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Application</Menu.Label>
                <Menu.Item leftSection={<User size={14} />} onClick={handleOpenProfile}>
                  Profile Settings
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item 
                  color="red" 
                  leftSection={<LogOut size={14} />}
                  onClick={handleLogout}
                >
                  Log out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs" style={{ height: '100%' }}>
          <Box style={{ flex: 1 }}>
            {menuSections.map((section, sectionIndex) => (
              <Box key={section.title} mb="md">
                {sectionIndex > 0 && <Divider my="sm" />}
                <Text className="lms-nav-section" size="xs" fw={800} pl="xs" mb={8}>
                  {section.title}
                </Text>
                {section.items.map((item) => {
                  const Icon = item.icon
                  const hasChildren = !!item.children
                  const active = !hasChildren && (location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)))
                  const childActive = hasChildren && location.pathname.startsWith(item.path)
                  
                  if (hasChildren) {
                    return (
                      <NavLink
                        key={item.label}
                        label={item.label}
                        leftSection={<Icon size={18} />}
                        radius="md"
                        mb={6}
                        active={childActive}
                        childrenOffset={30}
                        className="lms-nav-link"
                      >
                        {item.children.map((child) => (
                          <NavLink
                            key={child.label}
                            active={location.pathname === child.path}
                            label={child.label}
                            onClick={() => {
                              navigate(child.path)
                              if (opened) toggle()
                            }}
                            radius="md"
                            mb={3}
                            className="lms-nav-link lms-nav-child"
                          />
                        ))}
                      </NavLink>
                    )
                  }

                  return (
                    <NavLink
                      key={item.label}
                      active={active}
                      label={item.label}
                      leftSection={<Icon size={18} />}
                      onClick={() => {
                        navigate(item.path)
                        if (opened) toggle()
                      }}
                      radius="md"
                      mb={6}
                      className="lms-nav-link"
                    />
                  )
                })}
              </Box>
            ))}
          </Box>
          <Box style={{ borderTop: '1px solid var(--lms-border)', paddingTop: '15px' }}>
            <Button 
              fullWidth 
              variant="light" 
              color="red" 
              leftSection={<LogOut size={16} />}
              onClick={handleLogout}
              radius="md"
            >
              Sign Out
            </Button>
          </Box>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <div className="fade-in">
          <Outlet />
        </div>
      </AppShell.Main>

      <Modal opened={profileOpened} onClose={closeProfile} title="Profile Settings" centered>
        <Stack gap="md">
          <Group justify="center">
            <Box className="lms-profile-avatar-wrap">
              <Avatar src={avatarPreview} color="blue" radius="xl" size={104}>
                {user?.username?.substring(0, 2).toUpperCase()}
              </Avatar>
            </Box>
          </Group>

          <FileButton onChange={setAvatarFile} accept="image/png,image/jpeg,image/webp">
            {(props) => (
              <Button {...props} variant="filled" color="orange" leftSection={<Camera size={16} />}>
                Pilih Foto Profil
              </Button>
            )}
          </FileButton>

          {avatarFile && (
            <Text size="xs" c="dimmed" ta="center">
              {avatarFile.name}
            </Text>
          )}

          <TextInput
            label="Username"
            value={profileForm.username}
            onChange={(event) => setProfileForm((current) => ({ ...current, username: event.currentTarget.value }))}
            radius="md"
          />
          <TextInput
            label="Email"
            value={profileForm.email}
            onChange={(event) => setProfileForm((current) => ({ ...current, email: event.currentTarget.value }))}
            radius="md"
          />

          <Group justify="flex-end">
            <Button variant="subtle" color="gray" onClick={closeProfile}>
              Cancel
            </Button>
            <Button color="orange" leftSection={<Save size={16} />} onClick={handleSaveProfile} loading={savingProfile}>
              Save Profile
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AppShell>
  )
}
