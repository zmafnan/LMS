import React, { useEffect, useState } from 'react'
import { Grid, Card, Text, Group, Title, SimpleGrid, ScrollArea, Timeline, Table, Badge, Loader, Center } from '@mantine/core'
import { getDashboardData } from '../../services/dashboardService'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend, LabelList } from 'recharts'
import { ClipboardList, CheckCircle2, AlertOctagon, Activity, Calendar } from 'lucide-react'
import { useThemeColors } from '../../hooks/useThemeColors'

export default function DashboardPage() {
  const tc = useThemeColors()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Center style={{ height: '70vh' }}>
        <Loader size="xl" color="orange" />
      </Center>
    )
  }

  if (!data) return <Text>Failed to load dashboard data.</Text>

  const { metrics, tasksByPriority, tasksByCategory, tasksByStatus, tasksByPic, activities, upcoming } = data

  const cardData = [
    { title: 'Total Tasks', value: metrics.totalTasks, icon: ClipboardList, color: 'blue' },
    { title: 'Active Tasks', value: metrics.activeTasks, icon: Activity, color: 'yellow' },
    { title: 'Completed Tasks', value: metrics.completedTasks, icon: CheckCircle2, color: 'green' },
    { title: 'Overdue Tasks', value: metrics.overdueTasks, icon: AlertOctagon, color: 'red' },
  ]

  const COLORS = {
    critical: '#fa5252',
    high: '#fd7e14',
    medium: '#228be6',
    low: '#868e96',
    gray: '#868e96',
    blue: '#228be6',
    yellow: '#fab005',
    violet: '#7950f2',
    green: '#40c057',
  }

  return (
    <div style={{ padding: '8px' }}>
      <Title order={2} mb="lg" style={{ fontWeight: 700 }}>
        Lean Performance Dashboard
      </Title>

      {/* KPI Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="lg">
        {cardData.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} withBorder padding="lg" radius="md">
              <Group justify="space-between">
                <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>
                  {card.title}
                </Text>
                <Icon size={22} color={COLORS[card.color] || card.color} />
              </Group>
              <Group align="flex-end" gap="xs" mt="xs">
                <Text style={{ fontSize: '32px' }} fw={800}>{card.value}</Text>
              </Group>
            </Card>
          )
        })}
      </SimpleGrid>

      {/* Charts section */}
      <Grid mb="lg">
        {/* Status Pie Chart */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="md" p="lg" h="100%">
            <Text fw={700} mb="md">Tasks by Status</Text>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={tasksByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ value }) => value > 0 ? value : ''}
                  >
                    {tasksByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#228be6'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: tc.tooltipBg, borderColor: tc.tooltipBorder, color: tc.tooltipColor }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Grid.Col>

        {/* Category Pie Chart */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="md" p="lg" h="100%">
            <Text fw={700} mb="md">Tasks by Category</Text>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={tasksByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ value }) => value > 0 ? value : ''}
                  >
                    {tasksByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#228be6'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: tc.tooltipBg, borderColor: tc.tooltipBorder, color: tc.tooltipColor }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Grid.Col>

        {/* Priority Bar Chart */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="md" p="lg" h="100%">
            <Text fw={700} mb="md">Tasks by Priority</Text>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={tasksByPriority}>
                  <CartesianGrid strokeDasharray="3 3" stroke={tc.chartGrid} />
                  <XAxis dataKey="name" stroke={tc.chartAxis} />
                  <YAxis stroke={tc.chartAxis} />
                  <Tooltip contentStyle={{ backgroundColor: tc.tooltipBg, borderColor: tc.tooltipBorder, color: tc.tooltipColor }} />
                  <Bar dataKey="value" name="Tasks count">
                    {tasksByPriority.map((entry, index) => {
                      const colorKey = entry.name.toLowerCase()
                      const barColor = COLORS[colorKey] || '#228be6'
                      return <Cell key={`cell-${index}`} fill={barColor} />
                    })}
                    <LabelList dataKey="value" position="top" style={{ fill: tc.chartLabel, fontSize: 12, fontWeight: 600 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Grid.Col>

        {/* PIC Bar Chart */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="md" p="lg" h="100%">
            <Text fw={700} mb="md">Tasks by PIC</Text>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={tasksByPic || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={tc.chartGrid} />
                  <XAxis dataKey="name" stroke={tc.chartAxis} />
                  <YAxis stroke={tc.chartAxis} />
                  <Tooltip contentStyle={{ backgroundColor: tc.tooltipBg, borderColor: tc.tooltipBorder, color: tc.tooltipColor }} />
                  <Bar dataKey="value" name="Tasks count" fill="#fd7e14">
                    {(tasksByPic || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#fd7e14" />
                    ))}
                    <LabelList dataKey="value" position="top" style={{ fill: tc.chartLabel, fontSize: 12, fontWeight: 600 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Activities and Upcoming sections */}
      <Grid>
        {/* Upcoming Tasks */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card withBorder radius="md" p="lg" h="100%">
            <Text fw={700} mb="md" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} /> Upcoming Due Tasks
            </Text>
            <ScrollArea h={320}>
              {upcoming.length === 0 ? (
                <Center h={200}><Text color="dimmed">No upcoming active tasks.</Text></Center>
              ) : (
                <Table highlightOnHover verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Task Name</Table.Th>
                      <Table.Th>Priority</Table.Th>
                      <Table.Th>Due Date</Table.Th>
                      <Table.Th>Assigned PIC</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {upcoming.map((task) => (
                      <Table.Tr key={task.id}>
                        <Table.Td fw={500}>{task.task_name}</Table.Td>
                        <Table.Td>
                          <Badge color={COLORS[task.priority_color] || 'blue'} variant="light">
                            {task.priority_name}
                          </Badge>
                        </Table.Td>
                        <Table.Td>{task.due_date}</Table.Td>
                        <Table.Td>{task.assigned_username || 'Unassigned'}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </ScrollArea>
          </Card>
        </Grid.Col>

        {/* Recent Activities Logs */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card withBorder radius="md" p="lg" h="100%">
            <Text fw={700} mb="md">Recent Activity Timeline</Text>
            <ScrollArea h={320}>
              {activities.length === 0 ? (
                <Center h={200}><Text color="dimmed">No recent activities.</Text></Center>
              ) : (
                <Timeline active={0} bulletSize={24} lineWidth={2}>
                  {activities.map((log) => {
                    let logDetails = ''
                    try {
                      const parsed = JSON.parse(log.details)
                      if (parsed.from !== undefined && parsed.to !== undefined) {
                        logDetails = `from ${parsed.from} to ${parsed.to}`
                      } else if (parsed.task_name) {
                        logDetails = `"${parsed.task_name}"`
                      } else if (parsed.file_name) {
                        logDetails = `"${parsed.file_name}"`
                      }
                    } catch (e) {
                      logDetails = log.details || ''
                    }

                    return (
                      <Timeline.Item 
                        key={log.id} 
                        bullet={<Activity size={12} />}
                        title={
                          <Text size="sm" fw={600}>
                            {log.username || 'System'} <span style={{ fontWeight: 400, color: tc.textSecondary }}>{log.activity}</span> {logDetails}
                          </Text>
                        }
                      >
                        <Text size="xs" color="dimmed" mt={4}>
                          {log.task_name ? `Task: ${log.task_name}` : ''} • {new Date(log.created_at).toLocaleString()}
                        </Text>
                      </Timeline.Item>
                    )
                  })}
                </Timeline>
              )}
            </ScrollArea>
          </Card>
        </Grid.Col>
      </Grid>
    </div>
  )
}
