import React, { useEffect, useState } from 'react'
import { Title, Group, Tabs, Table, Card, Button, Badge, ActionIcon, Modal, TextInput, Select, NumberInput, Loader, Center, Text, Stack } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { 
  getCategories, createCategory, updateCategory, deleteCategory,
  getPriorities, createPriority, updatePriority, deletePriority,
  getUsers, createUser, updateUser, deleteUser
} from '../../services/masterService'
import { Settings, KanbanSquare, ArrowUp10, Users, Plus, Edit2, Trash2 } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { useThemeColors } from '../../hooks/useThemeColors'

export default function MasterDataPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role?.toLowerCase() === 'admin'
  const tc = useThemeColors()

  const [activeTab, setActiveTab] = useState('categories')
  const [loading, setLoading] = useState(true)

  // Lists
  const [categories, setCategories] = useState([])
  const [priorities, setPriorities] = useState([])
  const [usersList, setUsersList] = useState([])

  // Modal Control
  const [modalOpened, setModalOpened] = useState(false)
  const [modalType, setModalType] = useState('category') // 'category' | 'priority' | 'user'
  const [modalMode, setModalMode] = useState('create') // 'create' | 'edit'
  const [editId, setEditId] = useState(null)

  // Forms
  const catForm = useForm({
    initialValues: { name: '', color: 'blue' },
    validate: { name: (v) => (v ? null : 'Name is required') }
  })

  const prioForm = useForm({
    initialValues: { name: '', color: 'blue', level: 1 },
    validate: { name: (v) => (v ? null : 'Name is required') }
  })

  const userForm = useForm({
    initialValues: { username: '', email: '', password: '', role: 'pic' },
    validate: {
      username: (v) => (v ? null : 'Username is required'),
      email: (v) => (/^\S+@\S+$/.test(v) ? null : 'Invalid email'),
      password: (v, values) => (modalMode === 'create' && !v ? 'Password is required' : null),
    }
  })

  const loadData = () => {
    setLoading(true)
    Promise.all([getCategories(), getPriorities(), getUsers()])
      .then(([c, p, u]) => {
        setCategories(c)
        setPriorities(p)
        setUsersList(u)
      })
      .catch((err) => {
        notifications.show({ title: 'Error', message: 'Failed to load master lists.', color: 'red' })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  // Modals Open
  const openCreate = (type) => {
    setModalType(type)
    setModalMode('create')
    setEditId(null)
    if (type === 'category') catForm.reset()
    if (type === 'priority') prioForm.reset()
    if (type === 'user') userForm.reset()
    setModalOpened(true)
  }

  const openEdit = (type, item) => {
    setModalType(type)
    setModalMode('edit')
    setEditId(item.id)
    if (type === 'category') {
      catForm.setValues({ name: item.name, color: item.color })
    } else if (type === 'priority') {
      prioForm.setValues({ name: item.name, color: item.color, level: item.level })
    } else if (type === 'user') {
      userForm.setValues({ username: item.username, email: item.email, password: '', role: item.role })
    }
    setModalOpened(true)
  }

  // Submissions
  const handleSubmit = async () => {
    try {
      if (modalType === 'category') {
        const val = catForm.values
        if (modalMode === 'create') {
          await createCategory(val)
        } else {
          await updateCategory(editId, val)
        }
      } else if (modalType === 'priority') {
        const val = prioForm.values
        if (modalMode === 'create') {
          await createPriority(val)
        } else {
          await updatePriority(editId, val)
        }
      } else if (modalType === 'user') {
        const val = userForm.values
        if (modalMode === 'create') {
          await createUser(val)
        } else {
          // If editing user and password is empty, don't send it
          const payload = { ...val }
          if (!payload.password) delete payload.password
          await updateUser(editId, payload)
        }
      }

      notifications.show({ title: 'Success', message: 'Saved configurations.', color: 'green' })
      setModalOpened(false)
      loadData()
    } catch (err) {
      notifications.show({ title: 'Error', message: err.message || 'Operation failed.', color: 'red' })
    }
  }

  // Deletions
  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this setting? (This may affect tasks references)')) return
    try {
      if (type === 'category') await deleteCategory(id)
      if (type === 'priority') await deletePriority(id)
      if (type === 'user') await deleteUser(id)
      notifications.show({ title: 'Removed', message: 'Setting deleted successfully.', color: 'green' })
      loadData()
    } catch (err) {
      notifications.show({ title: 'Delete Failed', message: err.message || 'Could not delete.', color: 'red' })
    }
  }

  if (loading && categories.length === 0) {
    return (
      <Center style={{ height: '70vh' }}>
        <Loader size="xl" color="orange" />
      </Center>
    )
  }

  const COLORS = ['blue', 'cyan', 'green', 'yellow', 'orange', 'red', 'pink', 'violet', 'indigo', 'gray']

  return (
    <div style={{ padding: '8px' }}>
      <Title order={2} mb="lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Settings size={26} color="#fd7e14" /> Master Data Settings
      </Title>

      <Tabs value={activeTab} onChange={setActiveTab} color="orange" radius="md">
        <Tabs.List mb="md">
          <Tabs.Tab value="categories" leftSection={<KanbanSquare size={16} />}>
            Task Categories
          </Tabs.Tab>
          <Tabs.Tab value="priorities" leftSection={<ArrowUp10 size={16} />}>
            Priority Levels
          </Tabs.Tab>
          <Tabs.Tab value="users" leftSection={<Users size={16} />}>
            User Accounts
          </Tabs.Tab>
        </Tabs.List>

        {/* --- Task Categories Tab --- */}
        <Tabs.Panel value="categories">
          <Group justify="space-between" mb="md">
            <Text size="sm" color="dimmed">Configure methodology/improvement categories (e.g., 5S, SMED, Kaizen).</Text>
            <Button leftSection={<Plus size={16} />} color="orange" size="sm" onClick={() => openCreate('category')} radius="md">
              Add Category
            </Button>
          </Group>
          <Card withBorder radius="md" p="0">
            <Table highlightOnHover>
              <Table.Thead style={{ backgroundColor: tc.theadBg }}>
                <Table.Tr>
                  <Table.Th style={{ paddingLeft: '16px' }}>Category Name</Table.Th>
                  <Table.Th>Color Badge</Table.Th>
                  <Table.Th style={{ textAlign: 'right', paddingRight: '16px' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {categories.map((cat) => (
                  <Table.Tr key={cat.id}>
                    <Table.Td style={{ paddingLeft: '16px' }} fw={600}>{cat.name}</Table.Td>
                    <Table.Td>
                      <Badge color={cat.color} variant="filled">{cat.color}</Badge>
                    </Table.Td>
                    <Table.Td style={{ paddingRight: '16px' }}>
                      <Group gap="xs" justify="end">
                        <ActionIcon variant="light" color="yellow" size="sm" onClick={() => openEdit('category', cat)}>
                          <Edit2 size={14} />
                        </ActionIcon>
                        <ActionIcon variant="light" color="red" size="sm" onClick={() => handleDelete('category', cat.id)}>
                          <Trash2 size={14} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </Tabs.Panel>

        {/* --- Priorities Tab --- */}
        <Tabs.Panel value="priorities">
          <Group justify="space-between" mb="md">
            <Text size="sm" color="dimmed">Configure Priority level values and highlight colors used across all Lean tasks.</Text>
            <Button leftSection={<Plus size={16} />} color="orange" size="sm" onClick={() => openCreate('priority')} radius="md">
              Add Priority
            </Button>
          </Group>
          <Card withBorder radius="md" p="0">
            <Table highlightOnHover>
              <Table.Thead style={{ backgroundColor: tc.theadBg }}>
                <Table.Tr>
                  <Table.Th style={{ paddingLeft: '16px' }}>Priority Name</Table.Th>
                  <Table.Th>Color Tag</Table.Th>
                  <Table.Th>Level Rating</Table.Th>
                  <Table.Th style={{ textAlign: 'right', paddingRight: '16px' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {priorities.map((prio) => (
                  <Table.Tr key={prio.id}>
                    <Table.Td style={{ paddingLeft: '16px' }} fw={600}>{prio.name}</Table.Td>
                    <Table.Td>
                      <Badge color={prio.color} variant="filled">{prio.color}</Badge>
                    </Table.Td>
                    <Table.Td fw={700}>{prio.level}</Table.Td>
                    <Table.Td style={{ paddingRight: '16px' }}>
                      <Group gap="xs" justify="end">
                        <ActionIcon variant="light" color="yellow" size="sm" onClick={() => openEdit('priority', prio)}>
                          <Edit2 size={14} />
                        </ActionIcon>
                        <ActionIcon variant="light" color="red" size="sm" onClick={() => handleDelete('priority', prio.id)}>
                          <Trash2 size={14} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </Tabs.Panel>

        {/* --- Users Tab --- */}
        <Tabs.Panel value="users">
          <Group justify="space-between" mb="md">
            <Text size="sm" color="dimmed">Manage operator accounts, login credentials, and permission Roles (Admin, Leader, PIC).</Text>
            {isAdmin && (
              <Button leftSection={<Plus size={16} />} color="orange" size="sm" onClick={() => openCreate('user')} radius="md">
                Add User Account
              </Button>
            )}
          </Group>
          <Card withBorder radius="md" p="0">
            <Table highlightOnHover>
              <Table.Thead style={{ backgroundColor: tc.theadBg }}>
                <Table.Tr>
                  <Table.Th style={{ paddingLeft: '16px' }}>Username</Table.Th>
                  <Table.Th>Email Address</Table.Th>
                  <Table.Th>Role Permission</Table.Th>
                  {isAdmin && <Table.Th style={{ textAlign: 'right', paddingRight: '16px' }}>Actions</Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {usersList.map((usr) => (
                  <Table.Tr key={usr.id}>
                    <Table.Td style={{ paddingLeft: '16px' }} fw={600}>{usr.username}</Table.Td>
                    <Table.Td>{usr.email}</Table.Td>
                    <Table.Td>
                      <Badge 
                        color={
                          usr.role === 'admin' ? 'red' : 
                          usr.role === 'leader' ? 'orange' : 
                          usr.role === 'production_admin' ? 'violet' : 
                          'blue'
                        } 
                        variant="light" 
                        style={{ textTransform: 'capitalize' }}
                      >
                        {usr.role === 'production_admin' ? 'production admin' : usr.role}
                      </Badge>
                    </Table.Td>
                    {isAdmin && (
                      <Table.Td style={{ paddingRight: '16px' }}>
                        <Group gap="xs" justify="end">
                          <ActionIcon variant="light" color="yellow" size="sm" onClick={() => openEdit('user', usr)}>
                            <Edit2 size={14} />
                          </ActionIcon>
                          {usr.id !== user.id && (
                            <ActionIcon variant="light" color="red" size="sm" onClick={() => handleDelete('user', usr.id)}>
                              <Trash2 size={14} />
                            </ActionIcon>
                          )}
                        </Group>
                      </Table.Td>
                    )}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </Tabs.Panel>
      </Tabs>

      {/* --- Dynamic settings Modal --- */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={<Text fw={700}>{modalMode === 'create' ? 'Create' : 'Edit'} Config</Text>}
        radius="md"
      >
        <Stack gap="md">
          {modalType === 'category' && (
            <form onSubmit={catForm.onSubmit(handleSubmit)}>
              <Stack gap="sm">
                <TextInput label="Category Name" placeholder="e.g. Kaizen" required {...catForm.getInputProps('name')} />
                <Select label="Accent Color" placeholder="Choose Badge Color" data={COLORS} {...catForm.getInputProps('color')} />
                <Button type="submit" color="orange" fullWidth mt="md" radius="md">Save Category</Button>
              </Stack>
            </form>
          )}

          {modalType === 'priority' && (
            <form onSubmit={prioForm.onSubmit(handleSubmit)}>
              <Stack gap="sm">
                <TextInput label="Priority Name" placeholder="e.g. Extreme" required {...prioForm.getInputProps('name')} />
                <Select label="Accent Color" placeholder="Choose Label Color" data={COLORS} {...prioForm.getInputProps('color')} />
                <NumberInput label="Level Index (e.g. 1 = Critical/top)" min={1} {...prioForm.getInputProps('level')} />
                <Button type="submit" color="orange" fullWidth mt="md" radius="md">Save Priority</Button>
              </Stack>
            </form>
          )}

          {modalType === 'user' && (
            <form onSubmit={userForm.onSubmit(handleSubmit)}>
              <Stack gap="sm">
                <TextInput label="Username" placeholder="e.g. foreman_bob" required {...userForm.getInputProps('username')} />
                <TextInput label="Email Address" placeholder="foreman@lms.local" required {...userForm.getInputProps('email')} />
                <TextInput 
                  label="Password" 
                  type="password" 
                  placeholder={modalMode === 'edit' ? 'Leave empty to keep unchanged' : 'Minimum 6 characters'} 
                  required={modalMode === 'create'}
                  {...userForm.getInputProps('password')} 
                />
                <Select 
                  label="Role Permission" 
                  required
                  data={[
                    { value: 'admin', label: 'Admin' },
                    { value: 'leader', label: 'Leader' },
                    { value: 'production_admin', label: 'Production Admin' },
                    { value: 'pic', label: 'PIC' }
                  ]} 
                  {...userForm.getInputProps('role')} 
                />
                <Button type="submit" color="orange" fullWidth mt="md" radius="md">Save User Account</Button>
              </Stack>
            </form>
          )}
        </Stack>
      </Modal>
    </div>
  )
}
