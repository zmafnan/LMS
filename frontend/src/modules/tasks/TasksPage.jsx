import React, { useEffect, useState } from 'react'
import { Title, Group, Table, Card, Button, TextInput, Select, Progress, Badge, ActionIcon, Pagination, Drawer, Modal, Text, Stack, SimpleGrid, FileInput, Timeline, Textarea, NumberInput, Loader, ScrollArea, Box, useMantineColorScheme } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { getTasks, getTaskDetails, createTask, updateTask, deleteTask, uploadAttachment, deleteAttachment } from '../../services/taskService'
import { getPriorities, getCategories, getUsers } from '../../services/masterService'
import { Search, Plus, Filter, Eye, Edit2, Trash2, Calendar, FileDown, Upload, Activity } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { useThemeColors } from '../../hooks/useThemeColors'

export default function TasksPage() {
  const { user, hasRole } = useAuthStore()
  const tc = useThemeColors()
  const { colorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'

  // Data States
  const [tasks, setTasks] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // Master Lists
  const [priorities, setPriorities] = useState([])
  const [categories, setCategories] = useState([])
  const [usersList, setUsersList] = useState([])

  // Pagination & Filtering
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPIC, setFilterPIC] = useState('')

  // UI Control
  const [drawerOpened, setDrawerOpened] = useState(false)
  const [drawerMode, setDrawerMode] = useState('create') // 'create' | 'edit' | 'details'
  const [selectedTask, setSelectedTask] = useState(null)
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  // Form setup
  const form = useForm({
    initialValues: {
      task_name: '',
      description: '',
      priority_id: '',
      kanban_category_id: '',
      status: 'Backlog',
      assigned_to: '',
      start_date: null,
      due_date: null,
      progress: 0,
      notes: '',
      root_cause: '',
      improvement_category: '',
      benefit: '',
      saving_cost: 0.00,
    },
    validate: {
      task_name: (value) => (value ? null : 'Task name is required'),
      priority_id: (value) => (value ? null : 'Priority is required'),
      kanban_category_id: (value) => (value ? null : 'Category is required'),
      status: (value) => (value ? null : 'Status is required'),
    },
  })

  // Load Initial Lists
  useEffect(() => {
    Promise.all([getPriorities(), getCategories(), getUsers()])
      .then(([p, c, u]) => {
        setPriorities(p)
        setCategories(c)
        setUsersList(u)
      })
      .catch(console.error)
  }, [])

  // Load Tasks on Filter/Page change
  const loadTasks = () => {
    setLoading(true)
    const offset = (page - 1) * limit
    const filters = {
      search,
      priority_id: filterPriority,
      kanban_category_id: filterCategory,
      status: filterStatus,
      assigned_to: filterPIC,
      limit,
      offset
    }
    
    getTasks(filters)
      .then((res) => {
        setTasks(res.data)
        setTotal(res.total)
      })
      .catch((err) => {
        notifications.show({
          title: 'Error',
          message: 'Failed to fetch tasks.',
          color: 'red',
        })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadTasks()
  }, [page, filterPriority, filterCategory, filterStatus, filterPIC])

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      setPage(1)
      loadTasks()
    }
  }

  // Edit / Create Actions
  const handleOpenCreate = () => {
    form.reset()
    setDrawerMode('create')
    setDrawerOpened(true)
  }

  const handleOpenEdit = (task) => {
    form.setValues({
      task_name: task.task_name,
      description: task.description || '',
      priority_id: String(task.priority_id),
      kanban_category_id: String(task.kanban_category_id),
      status: task.status || 'Backlog',
      assigned_to: task.assigned_to ? String(task.assigned_to) : '',
      start_date: task.start_date ? new Date(task.start_date) : null,
      due_date: task.due_date ? new Date(task.due_date) : null,
      progress: task.progress || 0,
      notes: task.notes || '',
      root_cause: task.root_cause || '',
      improvement_category: task.improvement_category || '',
      benefit: task.benefit || '',
      saving_cost: parseFloat(task.saving_cost || 0),
    })
    setSelectedTask(task)
    setDrawerMode('edit')
    setDrawerOpened(true)
  }

  const handleOpenDetails = async (task) => {
    setLoading(true)
    try {
      const details = await getTaskDetails(task.id)
      setSelectedTask(details)
      setDrawerMode('details')
      setDrawerOpened(true)
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'Could not fetch details.',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTask = (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    deleteTask(id)
      .then(() => {
        notifications.show({
          title: 'Deleted',
          message: 'Task successfully removed.',
          color: 'green',
        })
        loadTasks()
      })
      .catch((err) => {
        notifications.show({
          title: 'Delete Failed',
          message: err.message || 'Failed to remove task.',
          color: 'red',
        })
      })
  }

  const formatDateForApi = (dateVal) => {
    if (!dateVal) return null
    if (dateVal instanceof Date) {
      return !isNaN(dateVal.getTime()) ? dateVal.toISOString().split('T')[0] : null
    }
    if (typeof dateVal === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
        return dateVal
      }
      const parsed = new Date(dateVal)
      return !isNaN(parsed.getTime()) ? parsed.toISOString().split('T')[0] : null
    }
    return null
  }

  const handleSubmit = async (values) => {
    // Format dates to YYYY-MM-DD
    const formattedValues = {
      ...values,
      start_date: formatDateForApi(values.start_date),
      due_date: formatDateForApi(values.due_date),
      priority_id: parseInt(values.priority_id),
      kanban_category_id: parseInt(values.kanban_category_id),
      assigned_to: values.assigned_to ? parseInt(values.assigned_to) : null,
    }

    try {
      if (drawerMode === 'create') {
        await createTask(formattedValues)
        notifications.show({ title: 'Created', message: 'Task added successfully.', color: 'green' })
      } else {
        await updateTask(selectedTask.id, formattedValues)
        notifications.show({ title: 'Updated', message: 'Task updated successfully.', color: 'green' })
      }
      setDrawerOpened(false)
      loadTasks()
    } catch (err) {
      notifications.show({
        title: 'Operation Failed',
        message: err.message || 'Database error occurred.',
        color: 'red',
      })
    }
  }

  // File Upload Handlers
  const handleUploadFile = async () => {
    if (!selectedFile) return
    setUploading(true)
    const formData = new FormData()
    formData.append('attachment', selectedFile)

    try {
      const response = await uploadAttachment(selectedTask.id, formData)
      notifications.show({
        title: 'Uploaded',
        message: 'File attached successfully.',
        color: 'green',
      })
      setSelectedFile(null)
      // Reload details to show file
      const updatedDetails = await getTaskDetails(selectedTask.id)
      setSelectedTask(updatedDetails)
    } catch (err) {
      notifications.show({
        title: 'Upload Failed',
        message: err.message || 'File upload error.',
        color: 'red',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteAttachment = async (fileId) => {
    if (!window.confirm('Remove this attachment?')) return
    try {
      await deleteAttachment(fileId)
      notifications.show({ title: 'Removed', message: 'File detached.', color: 'green' })
      // Reload
      const updatedDetails = await getTaskDetails(selectedTask.id)
      setSelectedTask(updatedDetails)
    } catch (err) {
      notifications.show({ title: 'Failed', message: 'Removal error.', color: 'red' })
    }
  }

  const PRIORITY_COLORS = {
    critical: 'red',
    high: 'orange',
    medium: 'blue',
    low: 'gray'
  }

  const STATUS_COLORS = {
    'Backlog': 'gray',
    'To Do': 'blue',
    'In Progress': 'yellow',
    'Pending': 'orange',
    'Review': 'violet',
    'Done': 'green',
  }

  const COLORS = {
    gray: '#868e96',
    blue: '#228be6',
    yellow: '#fab005',
    violet: '#7950f2',
    green: '#40c057',
  }

  const getDaysLeftBadge = (dueDateString) => {
    if (!dueDateString) return <Text size="sm">-</Text>
    const due = new Date(dueDateString)
    const today = new Date()
    due.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return (
        <Badge 
          color="red" 
          variant="light"
          styles={isDark ? {
            root: { backgroundColor: 'rgba(250, 82, 82, 0.22)' },
            label: { color: '#ffa8a8' }
          } : undefined}
        >
          {Math.abs(diffDays)}d overdue
        </Badge>
      )
    } else if (diffDays === 0) {
      return (
        <Badge 
          color="orange" 
          variant="light"
          styles={isDark ? {
            root: { backgroundColor: 'rgba(253, 126, 20, 0.22)' },
            label: { color: '#ffa94d' }
          } : undefined}
        >
          Due today
        </Badge>
      )
    } else {
      return (
        <Badge 
          color="green" 
          variant="light"
          styles={isDark ? {
            root: { backgroundColor: 'rgba(64, 192, 87, 0.22)' },
            label: { color: '#8ce99a' }
          } : undefined}
        >
          {diffDays}d left
        </Badge>
      )
    }
  }

  return (
    <div style={{ padding: '8px' }}>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Task Management</Title>
        <Button leftSection={<Plus size={16} />} color="orange" onClick={handleOpenCreate} radius="md">
          New Initiative
        </Button>
      </Group>

      {/* Filter panel */}
      <Card withBorder mb="lg" p="md" radius="md">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 6 }} spacing="sm">
          <TextInput
            placeholder="Search tasks..."
            leftSection={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            radius="md"
          />

          <Select
            placeholder="Filter Priority"
            clearable
            value={filterPriority}
            onChange={setFilterPriority}
            data={priorities.map(p => ({ value: String(p.id), label: p.name }))}
            radius="md"
          />

          <Select
            placeholder="Filter Category"
            clearable
            value={filterCategory}
            onChange={setFilterCategory}
            data={categories.map(c => ({ value: String(c.id), label: c.name }))}
            radius="md"
          />

          <Select
            placeholder="Filter Status"
            clearable
            value={filterStatus}
            onChange={setFilterStatus}
            data={['Backlog', 'To Do', 'In Progress', 'Pending', 'Review', 'Done']}
            radius="md"
          />

          <Select
            placeholder="Filter PIC"
            clearable
            value={filterPIC}
            onChange={setFilterPIC}
            data={usersList.map(u => ({ value: String(u.id), label: u.username }))}
            radius="md"
          />

          <Button variant="filled" color="orange" onClick={loadTasks} radius="md" leftSection={<Filter size={16} />}>
            Apply Filters
          </Button>
        </SimpleGrid>
      </Card>

      {/* Tasks Table */}
      <Card withBorder radius="md" p="0" style={{ overflow: 'hidden' }}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead style={{ backgroundColor: tc.theadBg }}>
            <Table.Tr>
              <Table.Th style={{ paddingLeft: '16px' }}>Task Name</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Priority</Table.Th>
              <Table.Th>Start Date</Table.Th>
              <Table.Th>Due Date</Table.Th>
              <Table.Th>Days Left</Table.Th>
              <Table.Th>PIC</Table.Th>
              <Table.Th>Progress</Table.Th>
              <Table.Th style={{ width: '130px', textAlign: 'right', paddingRight: '16px' }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={10} align="center" style={{ height: '200px' }}>
                  <Loader color="orange" size="md" />
                </Table.Td>
              </Table.Tr>
            ) : tasks.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={10} align="center" style={{ height: '200px' }}>
                  <Text color="dimmed">No tasks found. Try tweaking filters or create a new task.</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              tasks.map((task) => (
                <Table.Tr key={task.id}>
                  <Table.Td style={{ paddingLeft: '16px' }}>
                    <Text size="sm" fw={600}>{task.task_name}</Text>
                    <Text size="xs" color="dimmed" lineClamp={1}>{task.improvement_category}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={task.category_color} variant="outline">
                      {task.category_name}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={STATUS_COLORS[task.status] || 'gray'} variant="filled">
                      {task.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={PRIORITY_COLORS[(task.priority_name || 'low').toLowerCase()]} variant="filled">
                      {task.priority_name}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{task.start_date || '-'}</Table.Td>
                  <Table.Td>{task.due_date || '-'}</Table.Td>
                  <Table.Td>{getDaysLeftBadge(task.due_date)}</Table.Td>
                  <Table.Td>{task.assigned_username || '-'}</Table.Td>
                  <Table.Td style={{ width: '150px' }}>
                    <Group justify="space-between" mb="xs">
                      <Text size="xs" fw={700}>{task.progress}%</Text>
                    </Group>
                    <Progress value={task.progress} color="green" size="sm" radius="xl" />
                  </Table.Td>
                  <Table.Td style={{ paddingRight: '16px' }}>
                    <Group gap="xs" justify="end">
                      <ActionIcon variant="filled" color="blue" size="md" radius="md" onClick={() => handleOpenDetails(task)}>
                        <Eye size={16} />
                      </ActionIcon>
                      <ActionIcon variant="filled" color="yellow" size="md" radius="md" onClick={() => handleOpenEdit(task)}>
                        <Edit2 size={16} />
                      </ActionIcon>
                      {hasRole(['admin', 'leader']) && (
                        <ActionIcon variant="filled" color="red" size="md" radius="md" onClick={() => handleDeleteTask(task.id)}>
                          <Trash2 size={16} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>

        {/* Pagination footer */}
        <Group justify="space-between" p="md" style={{ borderTop: `1px solid ${tc.border}` }}>
          <Text size="sm" color="dimmed">
            Showing {tasks.length} of {total} tasks
          </Text>
          <Pagination total={Math.ceil(total / limit)} value={page} onChange={setPage} color="orange" radius="md" />
        </Group>
      </Card>

      {/* Creation and Edit Drawer */}
      <Drawer
        opened={drawerOpened && drawerMode !== 'details'}
        onClose={() => setDrawerOpened(false)}
        title={<Text fw={700} size="lg">{drawerMode === 'create' ? 'Create Lean Initiative' : 'Edit Lean Initiative'}</Text>}
        position="right"
        size="md"
        radius="md"
        styles={{
          content: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          },
          body: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden',
          }
        }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)} style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
          <ScrollArea style={{ flex: 1, minHeight: 0 }} mx="-md" px="md">
            <Stack gap="md" pb="xl">
              <TextInput label="Task Name" placeholder="e.g. Implement 5S workspace shadowboard" required {...form.getInputProps('task_name')} />
              <Textarea label="Description" placeholder="Detailed goal outline..." rows={3} {...form.getInputProps('description')} />
              
              <SimpleGrid cols={3}>
                <Select label="Priority" required placeholder="Choose Level" data={priorities.map(p => ({ value: String(p.id), label: p.name }))} {...form.getInputProps('priority_id')} />
                <Select label="Category" required placeholder="Choose Category" data={categories.map(c => ({ value: String(c.id), label: c.name }))} {...form.getInputProps('kanban_category_id')} />
                <Select label="Status" required placeholder="Choose Status" data={['Backlog', 'To Do', 'In Progress', 'Pending', 'Review', 'Done']} {...form.getInputProps('status')} />
              </SimpleGrid>

              <SimpleGrid cols={2}>
                <Select label="Assigned PIC" placeholder="Choose User" data={usersList.map(u => ({ value: String(u.id), label: u.username }))} {...form.getInputProps('assigned_to')} />
                <TextInput label="Improvement Category" placeholder="e.g. 5S, SMED, Kaizen" {...form.getInputProps('improvement_category')} />
              </SimpleGrid>

              <SimpleGrid cols={2}>
                <DateInput label="Start Date" placeholder="YYYY-MM-DD" valueFormat="YYYY-MM-DD" clearable {...form.getInputProps('start_date')} />
                <DateInput label="Due Date" placeholder="YYYY-MM-DD" valueFormat="YYYY-MM-DD" clearable {...form.getInputProps('due_date')} />
              </SimpleGrid>

              <SimpleGrid cols={2}>
                <NumberInput label="Progress (%)" min={0} max={100} {...form.getInputProps('progress')} />
                <NumberInput label="Saving Cost ($)" min={0} decimalScale={2} {...form.getInputProps('saving_cost')} />
              </SimpleGrid>

              <Textarea label="Root Cause" placeholder="What is the waste/issue trigger?" rows={2} {...form.getInputProps('root_cause')} />
              <Textarea label="Benefit" placeholder="Tangible advantages, lead time savings..." rows={2} {...form.getInputProps('benefit')} />
              <Textarea label="Notes" placeholder="Additional details..." rows={2} {...form.getInputProps('notes')} />
            </Stack>
          </ScrollArea>
          
          <Box pt="md" style={{ borderTop: `1px solid ${tc.border}` }}>
            <Button type="submit" color="orange" fullWidth size="md" radius="md">
              {drawerMode === 'create' ? 'Save Initiative' : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Drawer>

      {/* Details & Logs Drawer */}
      <Drawer
        opened={drawerOpened && drawerMode === 'details'}
        onClose={() => setDrawerOpened(false)}
        title={<Text fw={700}>Task Details - #{selectedTask?.id}</Text>}
        position="right"
        size="lg"
        radius="md"
        styles={{
          content: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          },
          body: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden',
          }
        }}
      >
        {selectedTask && (
          <ScrollArea style={{ flex: 1, minHeight: 0 }} mx="-md" px="md">
            <Stack gap="md" pb="xl">
            <div>
              <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>Task Name</Text>
              <Text fw={600} size="md">{selectedTask.task_name}</Text>
            </div>

            <div>
              <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>Description</Text>
              <Text size="sm">{selectedTask.description || '-'}</Text>
            </div>

            <SimpleGrid cols={4}>
              <div>
                <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>Priority</Text>
                <Badge color={PRIORITY_COLORS[(selectedTask.priority_name || 'low').toLowerCase()]} variant="filled">
                  {selectedTask.priority_name}
                </Badge>
              </div>
              <div>
                <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>Category</Text>
                <Badge color={selectedTask.category_color} variant="outline">
                  {selectedTask.category_name}
                </Badge>
              </div>
              <div>
                <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>Status</Text>
                <Badge color={STATUS_COLORS[selectedTask.status] || 'gray'} variant="filled">
                  {selectedTask.status}
                </Badge>
              </div>
              <div>
                <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>Cost Saving</Text>
                <Text size="sm" fw={600} color="green">${parseFloat(selectedTask.saving_cost).toFixed(2)}</Text>
              </div>
            </SimpleGrid>

            <SimpleGrid cols={2}>
              <div>
                <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>Assigned PIC</Text>
                <Text size="sm">{selectedTask.assigned_username || '-'}</Text>
              </div>
              <div>
                <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>Improvement Category</Text>
                <Text size="sm">{selectedTask.improvement_category || '-'}</Text>
              </div>
            </SimpleGrid>

            <SimpleGrid cols={2}>
              <div>
                <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>Start Date</Text>
                <Text size="sm">{selectedTask.start_date || '-'}</Text>
              </div>
              <div>
                <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>Due Date</Text>
                <Text size="sm">{selectedTask.due_date || '-'}</Text>
              </div>
            </SimpleGrid>

            <div>
              <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>Progress</Text>
              <Group gap="xs" mt={4}>
                <Progress value={selectedTask.progress} size="sm" style={{ flex: 1 }} color="green" />
                <Text size="xs" fw={700}>{selectedTask.progress}%</Text>
              </Group>
            </div>

            <div>
              <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>Root Cause</Text>
              <Text size="sm">{selectedTask.root_cause || '-'}</Text>
            </div>

            <div>
              <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>Benefit</Text>
              <Text size="sm">{selectedTask.benefit || '-'}</Text>
            </div>

            <div>
              <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>Notes</Text>
              <Text size="sm">{selectedTask.notes || '-'}</Text>
            </div>

            {/* Attachments Section */}
            <div style={{ borderTop: `1px solid ${tc.border}`, paddingTop: '15px' }}>
              <Text fw={700} size="sm" mb="sm">Attachments</Text>
              <Stack gap="xs" mb="md">
                {selectedTask.attachments?.length === 0 ? (
                  <Text size="xs" color="dimmed">No files attached.</Text>
                ) : (
                  selectedTask.attachments?.map((file) => (
                    <Group key={file.id} justify="space-between" p="xs" style={{ background: tc.surfaceDim, borderRadius: '4px', border: `1px solid ${tc.surfaceBorder}` }}>
                      <Box>
                        <Text size="xs" fw={600} lineClamp={1}>{file.file_name}</Text>
                        <Text size="10px" color="dimmed">Size: {(file.file_size / 1024).toFixed(1)} KB • By: {file.uploader_username}</Text>
                      </Box>
                      <Group gap="xs">
                        <ActionIcon variant="light" color="blue" size="sm" component="a" href={`/${file.file_path}`} download target="_blank">
                          <FileDown size={14} />
                        </ActionIcon>
                        {hasRole(['admin', 'leader']) && (
                          <ActionIcon variant="light" color="red" size="sm" onClick={() => handleDeleteAttachment(file.id)}>
                            <Trash2 size={14} />
                          </ActionIcon>
                        )}
                      </Group>
                    </Group>
                  ))
                )}
              </Stack>

              {/* Uploader Form */}
              <Group gap="xs" align="flex-end">
                <FileInput
                  placeholder="Choose File"
                  value={selectedFile}
                  onChange={setSelectedFile}
                  style={{ flex: 1 }}
                  radius="md"
                  leftSection={<Upload size={14} />}
                />
                <Button color="orange" radius="md" disabled={!selectedFile} loading={uploading} onClick={handleUploadFile}>
                  Upload
                </Button>
              </Group>
            </div>

            {/* Task Log timeline */}
            <div style={{ borderTop: `1px solid ${tc.border}`, paddingTop: '15px' }}>
              <Text fw={700} size="sm" mb="md">Initiative History Log</Text>
              <Timeline active={0} bulletSize={20} lineWidth={1}>
                {selectedTask.logs?.map((log) => (
                  <Timeline.Item key={log.id} bullet={<Activity size={10} />} title={
                    <Text size="xs" fw={600}>
                      {log.user_username || 'System'} <span style={{ fontWeight: 400, color: tc.textSecondary }}>{log.activity}</span>
                    </Text>
                  }>
                    <Text size="10px" color="dimmed">{new Date(log.created_at).toLocaleString()}</Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
            </Stack>
          </ScrollArea>
        )}
      </Drawer>
    </div>
  )
}
