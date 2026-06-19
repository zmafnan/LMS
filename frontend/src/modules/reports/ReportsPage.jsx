import React, { useEffect, useState } from 'react'
import { Title, Group, Table, Card, Button, Select, Text, Stack, SimpleGrid, Loader, Center, ScrollArea, Badge } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { notifications } from '@mantine/notifications'
import { getReports } from '../../services/reportsService'
import { getCategories, getUsers } from '../../services/masterService'
import { BarChart3, FileDown, Calendar, Filter } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { useThemeColors } from '../../hooks/useThemeColors'

export default function ReportsPage() {
  const tc = useThemeColors()
  const [reportsData, setReportsData] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [filterCategory, setFilterCategory] = useState('')
  const [filterPIC, setFilterPIC] = useState('')
  const [startDate, setStartDate] = useState(null)
  const [dueDate, setDueDate] = useState(null)

  // Master lists
  const [categories, setCategories] = useState([])
  const [usersList, setUsersList] = useState([])

  // Load Lists
  useEffect(() => {
    Promise.all([getCategories(), getUsers()])
      .then(([c, u]) => {
        setCategories(c)
        setUsersList(u)
      })
      .catch(console.error)
  }, [])

  const fetchReports = () => {
    setLoading(true)
    const filters = {
      kanban_category_id: filterCategory,
      assigned_to: filterPIC,
      start_date: startDate ? startDate.toISOString().split('T')[0] : null,
      due_date: dueDate ? dueDate.toISOString().split('T')[0] : null
    }

    getReports(filters)
      .then(setReportsData)
      .catch((err) => {
        notifications.show({
          title: 'Error',
          message: 'Failed to fetch reports.',
          color: 'red',
        })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchReports()
  }, [filterCategory, filterPIC, startDate, dueDate])

  // Aggregate stats
  const totalSavingCost = reportsData.reduce((sum, item) => sum + parseFloat(item.saving_cost || 0), 0)
  const avgProgress = reportsData.length > 0 
    ? Math.round(reportsData.reduce((sum, item) => sum + parseFloat(item.progress || 0), 0) / reportsData.length)
    : 0
  const completedTasks = reportsData.filter(t => t.status?.toLowerCase() === 'done').length

  // Export to Excel
  const handleExportExcel = () => {
    if (reportsData.length === 0) {
      notifications.show({ title: 'Export Failed', message: 'No records to export.', color: 'yellow' })
      return
    }

    const ws = XLSX.utils.json_to_sheet(reportsData.map(r => ({
      'Task ID': r.id,
      'Initiative Name': r.task_name,
      'Category': r.category_name || 'N/A',
      'Priority': r.priority_name,
      'Status': r.status || 'Backlog',
      'Start Date': r.start_date || '',
      'Due Date': r.due_date || '',
      'Progress (%)': r.progress,
      'Saving Cost ($)': parseFloat(r.saving_cost || 0),
      'Assigned PIC': r.assigned_username || 'Unassigned',
      'Root Cause': r.root_cause || '',
      'Benefit': r.benefit || '',
      'Notes': r.notes || ''
    })))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Lean Initiative Report')
    XLSX.writeFile(wb, `LMS_Operations_Report_${new Date().toISOString().split('T')[0]}.xlsx`)
    
    notifications.show({ title: 'Export Successful', message: 'Excel file downloaded.', color: 'green' })
  }

  // Export to PDF
  const handleExportPDF = () => {
    if (reportsData.length === 0) {
      notifications.show({ title: 'Export Failed', message: 'No records to export.', color: 'yellow' })
      return
    }

    const doc = new jsPDF('l', 'mm', 'a4')
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(253, 126, 20) // Orange accent
    doc.text('Lean Management System - Operations Report', 14, 15)

    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(144, 146, 150)
    doc.text(`Generated: ${new Date().toLocaleString()} | Total Saving Cost: $${totalSavingCost.toFixed(2)} | Avg Progress: ${avgProgress}%`, 14, 21)

    const headers = [['ID', 'Initiative Name', 'Category', 'Priority', 'Status', 'Assigned PIC', 'Progress', 'Saving Cost']]
    const data = reportsData.map(r => [
      r.id,
      r.task_name,
      r.category_name || 'N/A',
      r.priority_name,
      r.status || 'Backlog',
      r.assigned_username || 'Unassigned',
      `${r.progress}%`,
      `$${parseFloat(r.saving_cost).toFixed(2)}`
    ])

    doc.autoTable({
      head: headers,
      body: data,
      startY: 26,
      theme: 'grid',
      headStyles: { fillColor: [253, 126, 20] }, // orange header background
      styles: { fontSize: 8, font: 'Helvetica' }
    })

    doc.save(`LMS_Operations_Report_${new Date().toISOString().split('T')[0]}.pdf`)
    notifications.show({ title: 'Export Successful', message: 'PDF report downloaded.', color: 'green' })
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

  return (
    <div style={{ padding: '8px' }}>
      <Group justify="space-between" mb="lg">
        <Title order={2} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={26} color="#fd7e14" /> Operational Reports
        </Title>
        <Group>
          <Button leftSection={<FileDown size={16} />} color="green" onClick={handleExportExcel} radius="md">
            Export Excel
          </Button>
          <Button leftSection={<FileDown size={16} />} color="red" onClick={handleExportPDF} radius="md">
            Export PDF
          </Button>
        </Group>
      </Group>

      {/* Analytical Filters */}
      <Card withBorder mb="lg" p="md" radius="md">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="sm">
          <Select
            placeholder="Select Category"
            clearable
            value={filterCategory}
            onChange={setFilterCategory}
            data={categories.map(c => ({ value: String(c.id), label: c.name }))}
            radius="md"
          />

          <Select
            placeholder="Assigned PIC"
            clearable
            value={filterPIC}
            onChange={setFilterPIC}
            data={usersList.map(u => ({ value: String(u.id), label: u.username }))}
            radius="md"
          />

          <DateInput
            placeholder="Start Date (From)"
            value={startDate}
            onChange={setStartDate}
            clearable
            radius="md"
            leftSection={<Calendar size={16} />}
          />

          <DateInput
            placeholder="Due Date (To)"
            value={dueDate}
            onChange={setDueDate}
            clearable
            radius="md"
            leftSection={<Calendar size={16} />}
          />
        </SimpleGrid>
      </Card>

      {/* Aggregate Stats Cards */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="lg">
        <Card withBorder radius="md" p="md">
          <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>Total Savings Cost</Text>
          <Text style={{ fontSize: '28px' }} fw={800} color="green">${totalSavingCost.toFixed(2)}</Text>
        </Card>
        <Card withBorder radius="md" p="md">
          <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>Average Initiatives Progress</Text>
          <Text style={{ fontSize: '28px' }} fw={800} color="blue">{avgProgress}%</Text>
        </Card>
        <Card withBorder radius="md" p="md">
          <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase' }}>Completed Initiatives</Text>
          <Text style={{ fontSize: '28px' }} fw={800} color="green">{completedTasks} / {reportsData.length}</Text>
        </Card>
      </SimpleGrid>

      {/* Reports Data View */}
      <Card withBorder radius="md" p="0" style={{ overflow: 'hidden' }}>
        <ScrollArea h={400}>
          <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead style={{ backgroundColor: tc.theadBg }}>
              <Table.Tr>
                <Table.Th style={{ paddingLeft: '16px' }}>ID</Table.Th>
                <Table.Th>Initiative Name</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Priority</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>PIC</Table.Th>
                <Table.Th>Progress</Table.Th>
                <Table.Th style={{ paddingRight: '16px', textAlign: 'right' }}>Saving Cost</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                <Table.Tr>
                  <Table.Td colSpan={8} align="center" style={{ height: '200px' }}>
                    <Loader color="orange" size="md" />
                  </Table.Td>
                </Table.Tr>
              ) : reportsData.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={8} align="center" style={{ height: '200px' }}>
                    <Text color="dimmed">No operational data found matching criteria.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                reportsData.map((task) => (
                  <Table.Tr key={task.id}>
                    <Table.Td style={{ paddingLeft: '16px' }}>#{task.id}</Table.Td>
                    <Table.Td fw={600}>{task.task_name}</Table.Td>
                    <Table.Td>
                      <Badge color={task.category_color || 'gray'} variant="outline">
                        {task.category_name || 'N/A'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={PRIORITY_COLORS[(task.priority_name || 'low').toLowerCase()]} variant="filled">
                        {task.priority_name}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={STATUS_COLORS[task.status] || 'gray'} variant="filled">
                        {task.status || 'Backlog'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{task.assigned_username || '-'}</Table.Td>
                    <Table.Td>{task.progress}%</Table.Td>
                    <Table.Td style={{ paddingRight: '16px' }} align="right" fw={600} color="green">
                      ${parseFloat(task.saving_cost).toFixed(2)}
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  )
}
