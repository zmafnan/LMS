import React, { useEffect, useState } from 'react'
import { 
  Title, Group, Table, Card, Button, TextInput, Select, Badge, ActionIcon, 
  Pagination, Drawer, Modal, Text, Stack, SimpleGrid, FileButton, Tabs, Grid, Box, Loader, Timeline,
  useMantineColorScheme
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { 
  Search, Plus, Filter, Edit2, Trash2, FileDown, Upload, Award, Users, BarChart3, FileText, Check 
} from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts'
import useAuthStore from '../../store/authStore'
import { 
  getEmployees, createEmployee, updateEmployee, deleteEmployee, bulkImportEmployees, getAnalytics, getReports 
} from '../../services/multiSkillService'
import { useThemeColors } from '../../hooks/useThemeColors'

export default function MultiSkillPage() {
  const { hasRole } = useAuthStore()
  const tc = useThemeColors()
  const { colorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'

  // Active Tab
  const [activeTab, setActiveTab] = useState('directory')

  // Data States
  const [employees, setEmployees] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // Filters & Pagination
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [filterLine, setFilterLine] = useState('')
  const [filterSection, setFilterSection] = useState('')
  const [filterPosition, setFilterPosition] = useState('')

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // Reports State
  const [reportEmployees, setReportEmployees] = useState([])
  const [reportLoading, setReportLoading] = useState(false)
  const [reportLine, setReportLine] = useState('')
  const [reportSection, setReportSection] = useState('')

  // UI Control
  const [drawerOpened, setDrawerOpened] = useState(false)
  const [drawerMode, setDrawerMode] = useState('create') // 'create' | 'edit'
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [importModalOpened, setImportModalOpened] = useState(false)

  // Master lists options
  const lineOptions = Array.from({ length: 29 }, (_, i) => "A" + String(i + 1).padStart(2, '0'))
  const sectionOptions = ['Cutting', 'Sewing', 'Assembly']
  const positionOptions = ['Kepala Bagian', 'Supervisor', 'Pengawas', 'Operator']

  // Recharts color palette
  const CHART_COLORS = ['#228be6', '#fab005', '#fd7e14', '#40c057', '#be4bdb', '#7950f2', '#e64980']

  // Form setup
  const form = useForm({
    initialValues: {
      nik: '',
      employee_name: '',
      position: 'Operator',
      section: '',
      line: '',
      skill_1: '',
      skill_1_grade: '',
      skill_2: '',
      skill_2_grade: '',
      skill_3: '',
      skill_3_grade: '',
      skill_4: '',
      skill_4_grade: '',
      skill_5: '',
      skill_5_grade: '',
      skill_6: '',
      skill_6_grade: '',
      skill_7: '',
      skill_7_grade: '',
      skill_8: '',
      skill_8_grade: '',
      skill_9: '',
      skill_9_grade: '',
      skill_10: '',
      skill_10_grade: '',
      join_date: '',
      status: 'Active',
    },
    validate: {
      nik: (value) => (value ? null : 'NIK is required'),
      employee_name: (value) => (value ? null : 'Employee Name is required'),
    },
  })

  // Load Employees
  const loadEmployees = () => {
    setLoading(true)
    const offset = (page - 1) * limit
    const filters = {
      search,
      line: filterLine,
      section: filterSection,
      position: filterPosition,
      limit,
      offset
    }

    getEmployees(filters)
      .then((res) => {
        setEmployees(res.data)
        setTotal(res.total)
      })
      .catch((err) => {
        notifications.show({
          title: 'Error',
          message: 'Failed to fetch employee list.',
          color: 'red',
        })
      })
      .finally(() => setLoading(false))
  }

  // Load Analytics
  const loadAnalytics = () => {
    setAnalyticsLoading(true)
    getAnalytics()
      .then((res) => {
        setAnalyticsData(res)
      })
      .catch((err) => {
        notifications.show({
          title: 'Error',
          message: 'Failed to fetch analytics statistics.',
          color: 'red',
        })
      })
      .finally(() => setAnalyticsLoading(false))
  }

  // Load Report Data
  const loadReportData = () => {
    setReportLoading(true)
    const filters = {
      line: reportLine,
      section: reportSection,
    }
    getReports(filters)
      .then((res) => {
        setReportEmployees(res.data)
      })
      .catch((err) => {
        notifications.show({
          title: 'Error',
          message: 'Failed to fetch reports database.',
          color: 'red',
        })
      })
      .finally(() => setReportLoading(false))
  }

  useEffect(() => {
    if (activeTab === 'directory') {
      loadEmployees()
    } else if (activeTab === 'analytics') {
      loadAnalytics()
    } else if (activeTab === 'reports') {
      loadReportData()
    }
  }, [page, filterLine, filterSection, filterPosition, activeTab, reportLine, reportSection])

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      setPage(1)
      loadEmployees()
    }
  }

  // CRUD Trigger Events
  const handleOpenCreate = () => {
    form.reset()
    setDrawerMode('create')
    setDrawerOpened(true)
  }

  const handleOpenEdit = (emp) => {
    form.setValues({
      nik: emp.nik,
      employee_name: emp.employee_name,
      position: emp.position || 'Operator',
      section: emp.section || '',
      line: emp.line || '',
      skill_1: emp.skill_1 || '',
      skill_1_grade: emp.skill_1_grade || '',
      skill_2: emp.skill_2 || '',
      skill_2_grade: emp.skill_2_grade || '',
      skill_3: emp.skill_3 || '',
      skill_3_grade: emp.skill_3_grade || '',
      skill_4: emp.skill_4 || '',
      skill_4_grade: emp.skill_4_grade || '',
      skill_5: emp.skill_5 || '',
      skill_5_grade: emp.skill_5_grade || '',
      skill_6: emp.skill_6 || '',
      skill_6_grade: emp.skill_6_grade || '',
      skill_7: emp.skill_7 || '',
      skill_7_grade: emp.skill_7_grade || '',
      skill_8: emp.skill_8 || '',
      skill_8_grade: emp.skill_8_grade || '',
      skill_9: emp.skill_9 || '',
      skill_9_grade: emp.skill_9_grade || '',
      skill_10: emp.skill_10 || '',
      skill_10_grade: emp.skill_10_grade || '',
      join_date: emp.join_date || '',
      status: emp.status || 'Active',
    })
    setSelectedEmployee(emp)
    setDrawerMode('edit')
    setDrawerOpened(true)
  }

  const handleDeleteEmployee = (id) => {
    if (!window.confirm('Are you sure you want to delete this employee record?')) return
    deleteEmployee(id)
      .then(() => {
        notifications.show({
          title: 'Success',
          message: 'Employee record successfully deleted.',
          color: 'green',
        })
        loadEmployees()
      })
      .catch((err) => {
        notifications.show({
          title: 'Error',
          message: err.message || 'Failed to remove employee record.',
          color: 'red',
        })
      })
  }

  const handleSubmit = async (values) => {
    try {
      if (drawerMode === 'create') {
        await createEmployee(values)
        notifications.show({ title: 'Success', message: 'Employee added successfully.', color: 'green' })
      } else {
        await updateEmployee(selectedEmployee.id, values)
        notifications.show({ title: 'Success', message: 'Employee updated successfully.', color: 'green' })
      }
      setDrawerOpened(false)
      loadEmployees()
    } catch (err) {
      notifications.show({
        title: 'Operation Failed',
        message: err.message || 'Failed to write data.',
        color: 'red',
      })
    }
  }

  // Client-Side Excel Import
  const handleImportExcel = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(sheet)

        if (json.length === 0) {
          throw new Error('Excel sheet is empty.')
        }

        // Map column variations
        const mapped = json.map((row) => ({
          nik: String(row['NIK'] || row['nik'] || '').trim(),
          employee_name: String(row['Employee Name'] || row['employee_name'] || row['Name'] || row['name'] || '').trim(),
          position: String(row['Position'] || row['position'] || 'Operator').trim(),
          section: String(row['Section'] || row['section'] || '').trim(),
          line: String(row['Line'] || row['line'] || row['Department'] || row['department'] || '').trim(),
          skill_1: String(row['Skill 1'] || row['skill_1'] || '').trim(),
          skill_1_grade: String(row['Skill 1 Grade'] || row['skill_1_grade'] || '').trim(),
          skill_2: String(row['Skill 2'] || row['skill_2'] || '').trim(),
          skill_2_grade: String(row['Skill 2 Grade'] || row['skill_2_grade'] || '').trim(),
          skill_3: String(row['Skill 3'] || row['skill_3'] || '').trim(),
          skill_3_grade: String(row['Skill 3 Grade'] || row['skill_3_grade'] || '').trim(),
          skill_4: String(row['Skill 4'] || row['skill_4'] || '').trim(),
          skill_4_grade: String(row['Skill 4 Grade'] || row['skill_4_grade'] || '').trim(),
          skill_5: String(row['Skill 5'] || row['skill_5'] || '').trim(),
          skill_5_grade: String(row['Skill 5 Grade'] || row['skill_5_grade'] || '').trim(),
          skill_6: String(row['Skill 6'] || row['skill_6'] || '').trim(),
          skill_6_grade: String(row['Skill 6 Grade'] || row['skill_6_grade'] || '').trim(),
          skill_7: String(row['Skill 7'] || row['skill_7'] || '').trim(),
          skill_7_grade: String(row['Skill 7 Grade'] || row['skill_7_grade'] || '').trim(),
          skill_8: String(row['Skill 8'] || row['skill_8'] || '').trim(),
          skill_8_grade: String(row['Skill 8 Grade'] || row['skill_8_grade'] || '').trim(),
          skill_9: String(row['Skill 9'] || row['skill_9'] || '').trim(),
          skill_9_grade: String(row['Skill 9 Grade'] || row['skill_9_grade'] || '').trim(),
          skill_10: String(row['Skill 10'] || row['skill_10'] || '').trim(),
          skill_10_grade: String(row['Skill 10 Grade'] || row['skill_10_grade'] || '').trim(),
          join_date: row['Join Date'] || row['join_date'] || '',
          status: row['Status'] || row['status'] || 'Active',
        }))

        const response = await bulkImportEmployees(mapped)
        notifications.show({
          title: 'Import Success',
          message: `Successfully imported: ${response.inserted} entries. Updated: ${response.updated} entries.`,
          color: 'green',
        })
        setImportModalOpened(false)
        loadEmployees()
      } catch (err) {
        notifications.show({
          title: 'Import Failed',
          message: err.message || 'Error parsing Excel sheet columns.',
          color: 'red',
        })
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // Client-Side Excel Export
  const handleExportExcel = (dataToExport, filename = 'Multi_Skill_Employees.xlsx') => {
    const wsData = dataToExport.map((emp) => ({
      'NIK': emp.nik,
      'Employee Name': emp.employee_name,
      'Position': emp.position,
      'Section': emp.section,
      'Line': emp.line,
      'Skill 1': emp.skill_1,
      'Skill 1 Grade': emp.skill_1_grade,
      'Skill 2': emp.skill_2,
      'Skill 2 Grade': emp.skill_2_grade,
      'Skill 3': emp.skill_3,
      'Skill 3 Grade': emp.skill_3_grade,
      'Skill 4': emp.skill_4,
      'Skill 4 Grade': emp.skill_4_grade,
      'Skill 5': emp.skill_5,
      'Skill 5 Grade': emp.skill_5_grade,
      'Skill 6': emp.skill_6,
      'Skill 6 Grade': emp.skill_6_grade,
      'Skill 7': emp.skill_7,
      'Skill 7 Grade': emp.skill_7_grade,
      'Skill 8': emp.skill_8,
      'Skill 8 Grade': emp.skill_8_grade,
      'Skill 9': emp.skill_9,
      'Skill 9 Grade': emp.skill_9_grade,
      'Skill 10': emp.skill_10,
      'Skill 10 Grade': emp.skill_10_grade,
      'Join Date': emp.join_date,
      'Status': emp.status
    }))

    const ws = XLSX.utils.json_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Employees')
    XLSX.writeFile(wb, filename)
  }

  // Client-Side PDF Export
  const handleExportPDF = (dataToExport, titleText = 'Employee Multi Skill Report') => {
    const doc = new jsPDF('landscape')
    doc.setFont('Helvetica', 'bold')
    doc.text(titleText, 14, 15)
    doc.setFontSize(10)
    doc.setFont('Helvetica', 'normal')
    doc.text(`Generated at: ${new Date().toLocaleString()}`, 14, 20)

    const headers = [['NIK', 'Name', 'Position', 'Section', 'Line', 'Total Skills', 'Multi Skill', 'Skills']]
    const rows = dataToExport.map((emp) => {
      const skillsFormatted = []
      for (let i = 1; i <= 10; i++) {
        if (emp[`skill_${i}`]) {
          const g = emp[`skill_${i}_grade`]
          skillsFormatted.push(`${emp[`skill_${i}`]}${g ? ` (${g})` : ''}`)
        }
      }
      return [
        emp.nik,
        emp.employee_name,
        emp.position,
        emp.section,
        emp.line,
        `${emp.total_skill} Skills`,
        emp.is_multiskill,
        skillsFormatted.join(', ')
      ]
    })

    doc.autoTable({
      head: headers,
      body: rows,
      startY: 25,
      theme: 'grid',
      headStyles: { fillColor: [253, 126, 20], textColor: [255, 255, 255] },
      styles: { fontSize: 8 },
      columnStyles: { 7: { cellWidth: 100 } }
    })

    doc.save(`${titleText.toLowerCase().replace(/\s+/g, '_')}.pdf`)
  }

  // Render Directory Tab Layout
  const renderDirectoryTab = () => (
    <Stack gap="md">
      {/* Filter panel */}
      <Card withBorder p="md" radius="md">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="sm">
          <TextInput
            placeholder="Search NIK or Name..."
            leftSection={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            radius="md"
          />

          <Select
            placeholder="Line"
            clearable
            value={filterLine}
            onChange={setFilterLine}
            data={lineOptions}
            radius="md"
          />

          <Select
            placeholder="Section"
            clearable
            value={filterSection}
            onChange={setFilterSection}
            data={sectionOptions}
            radius="md"
          />

          <Select
            placeholder="Position"
            clearable
            value={filterPosition}
            onChange={setFilterPosition}
            data={positionOptions}
            radius="md"
          />
        </SimpleGrid>
        <Group justify="space-between" mt="md">
          <Text size="xs" color="dimmed">💡 Tips: Klik NIK / Nama karyawan atau double-click pada baris tabel untuk mengubah (update) data skill.</Text>
          <Button variant="filled" color="orange" onClick={loadEmployees} radius="md" leftSection={<Filter size={16} />}>
            Apply Filters
          </Button>
        </Group>
      </Card>

      {/* Main Grid Table */}
      <Card withBorder radius="md" p="0" style={{ overflow: 'hidden' }}>
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover verticalSpacing="sm" style={{ minWidth: 1400 }}>
            <Table.Thead style={{ backgroundColor: tc.theadBg }}>
              <Table.Tr>
                <Table.Th className="sticky-col-1" style={{ paddingLeft: '16px', width: '100px' }}>NIK</Table.Th>
                <Table.Th className="sticky-col-2 sticky-border-right" style={{ width: '180px' }}>Employee Name</Table.Th>
                <Table.Th style={{ width: '100px' }}>Line</Table.Th>
                <Table.Th style={{ width: '100px' }}>Section</Table.Th>
                <Table.Th style={{ width: '100px' }}>Position</Table.Th>
                <Table.Th style={{ width: '100px' }}>Total Skills</Table.Th>
                <Table.Th style={{ width: '100px' }}>Multi Skill</Table.Th>
                <Table.Th style={{ width: '380px' }}>Skill Set (Direct Columns)</Table.Th>
                <Table.Th style={{ width: '100px' }}>Join Date</Table.Th>
                <Table.Th style={{ width: '80px' }}>Status</Table.Th>
                <Table.Th style={{ width: '100px', textAlign: 'right', paddingRight: '16px' }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                <Table.Tr>
                  <Table.Td colSpan={11} align="center" style={{ height: '200px' }}>
                    <Loader color="orange" size="md" />
                  </Table.Td>
                </Table.Tr>
              ) : employees.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={11} align="center" style={{ height: '200px' }}>
                    <Text color="dimmed">No employee skills records found.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                employees.map((emp) => {
                  const skillsList = []
                  for (let i = 1; i <= 10; i++) {
                    if (emp[`skill_${i}`]) {
                      skillsList.push({ name: emp[`skill_${i}`], grade: emp[`skill_${i}_grade`] })
                    }
                  }
                  return (
                    <Table.Tr 
                      key={emp.id} 
                      onDoubleClick={() => handleOpenEdit(emp)} 
                      style={{ cursor: 'pointer' }}
                      title="Double-click row to edit employee skills"
                    >
                      <Table.Td className="sticky-col-1" style={{ paddingLeft: '16px' }}>
                        <Text 
                          size="sm" 
                          fw={700} 
                          color="orange" 
                          style={{ display: 'inline-block', borderBottom: '1px dashed' }}
                          onClick={() => handleOpenEdit(emp)}
                        >
                          {emp.nik}
                        </Text>
                      </Table.Td>
                      <Table.Td className="sticky-col-2 sticky-border-right">
                        <Group gap="xs" wrap="nowrap">
                          <Text 
                            size="sm" 
                            fw={600} 
                            color="orange" 
                            style={{ borderBottom: '1px dashed' }}
                            onClick={() => handleOpenEdit(emp)}
                          >
                            {emp.employee_name}
                          </Text>
                          <ActionIcon variant="subtle" size="xs" color="orange" onClick={() => handleOpenEdit(emp)}>
                            <Edit2 size={12} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                      <Table.Td><Text size="sm">{emp.line || '-'}</Text></Table.Td>
                      <Table.Td><Text size="sm">{emp.section || '-'}</Text></Table.Td>
                      <Table.Td>
                        <Badge variant="outline" color="blue">{emp.position}</Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge 
                          variant="light" 
                          color="blue"
                          styles={isDark ? {
                            root: { backgroundColor: 'rgba(34, 139, 230, 0.22)' },
                            label: { color: '#74c0fc' }
                          } : undefined}
                        >
                          {emp.total_skill} Skills
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="filled" color={emp.is_multiskill === 'YES' ? 'green' : 'gray'}>
                          {emp.is_multiskill}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="5px">
                          {skillsList.length === 0 ? (
                            <Text size="xs" color="dimmed">- No skills listed -</Text>
                          ) : (
                            skillsList.map((skill, sIdx) => (
                              <Badge 
                                key={sIdx} 
                                size="xs" 
                                color="orange" 
                                variant="light"
                                styles={isDark ? {
                                  root: { backgroundColor: 'rgba(253, 126, 20, 0.22)' },
                                  label: { color: '#ffa94d' }
                                } : undefined}
                              >
                                {skill.name} {skill.grade ? `(${skill.grade})` : ''}
                              </Badge>
                            ))
                          )}
                        </Group>
                      </Table.Td>
                      <Table.Td><Text size="sm">{emp.join_date || '-'}</Text></Table.Td>
                      <Table.Td>
                        <Badge color={emp.status === 'Active' ? 'green' : 'gray'} variant="filled">
                          {emp.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ paddingRight: '16px' }}>
                        <Group gap="xs" justify="end">
                          <ActionIcon variant="light" color="yellow" size="md" radius="md" onClick={() => handleOpenEdit(emp)}>
                            <Edit2 size={16} />
                          </ActionIcon>
                          <ActionIcon variant="light" color="red" size="md" radius="md" onClick={() => handleDeleteEmployee(emp.id)}>
                            <Trash2 size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  )
                })
              )}
            </Table.Tbody>
          </Table>
        </Box>

        {/* Pagination footer */}
        <Group justify="space-between" p="md" style={{ borderTop: `1px solid ${tc.border}` }}>
          <Text size="sm" color="dimmed">
            Showing {employees.length} of {total} employees
          </Text>
          <Pagination total={Math.ceil(total / limit)} value={page} onChange={setPage} color="orange" radius="md" />
        </Group>
      </Card>
    </Stack>
  )

  // Render Analytics Tab Layout
  const renderAnalyticsTab = () => {
    if (analyticsLoading) {
      return (
        <Group justify="center" align="center" style={{ height: '300px' }}>
          <Loader color="orange" size="md" />
        </Group>
      )
    }

    if (!analyticsData) {
      return (
        <Text color="dimmed" align="center" my="xl">No analytics metrics found.</Text>
      )
    }

    const sortedLineData = analyticsData.multiskill_by_line
      ? [...analyticsData.multiskill_by_line].sort((a, b) => 
          (a.line || '').localeCompare(b.line || '', undefined, { numeric: true, sensitivity: 'base' })
        )
      : [];

    const filteredDistribution = analyticsData.skill_distribution
      ? analyticsData.skill_distribution.filter(item => item.skills_count !== 0)
      : [];

    return (
      <Stack gap="lg">
        {/* KPI Cards */}
        <SimpleGrid cols={{ base: 1, sm: 5 }}>
          <Card withBorder p="md" radius="md" style={{ position: 'relative', overflow: 'hidden' }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase', letterSpacing: '0.8px' }}>Total Employees</Text>
                <Title order={1} mt={4}>{analyticsData.total_all}</Title>
              </div>
              <Users size={24} color="#fd7e14" style={{ opacity: 0.8 }} />
            </Box>
          </Card>

          <Card withBorder p="md" radius="md" style={{ position: 'relative', overflow: 'hidden' }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase', letterSpacing: '0.8px' }}>Multi Skill Employees</Text>
                <Title order={1} mt={4} color="orange">{analyticsData.total_multiskill}</Title>
              </div>
              <Award size={24} color="#fd7e14" style={{ opacity: 0.8 }} />
            </Box>
          </Card>

          <Card withBorder p="md" radius="md" style={{ position: 'relative', overflow: 'hidden' }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase', letterSpacing: '0.8px' }}>Multi Skill %</Text>
                <Title order={1} mt={4} color="green">{analyticsData.multiskill_percentage}%</Title>
              </div>
              <Check size={24} color="#40c057" style={{ opacity: 0.8 }} />
            </Box>
          </Card>

          <Card withBorder p="md" radius="md" style={{ position: 'relative', overflow: 'hidden' }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase', letterSpacing: '0.8px' }}>Highest Line</Text>
                <Text size="lg" fw={800} mt={4} color="blue" lineClamp={1}>{analyticsData.highest_multiskill_line}</Text>
              </div>
            </Box>
          </Card>

          <Card withBorder p="md" radius="md" style={{ position: 'relative', overflow: 'hidden' }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase', letterSpacing: '0.8px' }}>Lowest Line</Text>
                <Text size="lg" fw={800} mt={4} color="red" lineClamp={1}>{analyticsData.lowest_multiskill_line}</Text>
              </div>
            </Box>
          </Card>
        </SimpleGrid>

        <Grid gutter="md">
          {/* Multi Skill % by Line */}
          <Grid.Col span={12}>
            <Card withBorder p="md" radius="md">
              <Text fw={700} size="md" mb="md">Multi Skill Percentage by Line (%)</Text>
              <Box style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sortedLineData}
                    margin={{ top: 15, right: 15, left: -20, bottom: 45 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={tc.chartGrid} />
                    <XAxis 
                      dataKey="line" 
                      stroke={tc.chartAxis} 
                      tick={{ fontSize: 10, fill: tc.chartAxis }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                    />
                    <YAxis domain={[0, 100]} stroke={tc.chartAxis} />
                    <Tooltip contentStyle={{ backgroundColor: tc.tooltipBg, borderColor: tc.tooltipBorder, color: tc.tooltipColor }} />
                    <Bar dataKey="percentage" name="Multi Skill %" fill="#228be6" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: tc.chartLabel, fontSize: 10 }} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid.Col>

          {/* Multi Skill % by Section */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder p="md" radius="md">
              <Text fw={700} size="md" mb="md">Multi Skill Percentage by Section (%)</Text>
              <Box style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.multiskill_by_section}
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={tc.chartGrid} />
                    <XAxis dataKey="section" stroke={tc.chartAxis} />
                    <YAxis domain={[0, 100]} stroke={tc.chartAxis} />
                    <Tooltip contentStyle={{ backgroundColor: tc.tooltipBg, borderColor: tc.tooltipBorder, color: tc.tooltipColor }} />
                    <Bar dataKey="percentage" name="Multi Skill %" fill="#fab005" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: tc.chartLabel, fontSize: 10 }} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid.Col>

          {/* Skill Count Distribution */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder p="md" radius="md">
              <Text fw={700} size="md" mb="md">Skill Count Distribution (Number of Employees)</Text>
              <Box style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredDistribution}
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={tc.chartGrid} />
                    <XAxis dataKey="skills_count" stroke={tc.chartAxis} />
                    <YAxis stroke={tc.chartAxis} />
                    <Tooltip contentStyle={{ backgroundColor: tc.tooltipBg, borderColor: tc.tooltipBorder, color: tc.tooltipColor }} />
                    <Bar dataKey="employees_count" name="Employee Count" fill="#40c057" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: tc.chartLabel, fontSize: 10 }} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid.Col>

          {/* Top Multi Skill Employees */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder p="md" radius="md">
              <Text fw={700} size="md" mb="md">Top Multi Skill Employees</Text>
              <Box style={{ height: 280, overflowY: 'auto' }}>
                <Table verticalSpacing="xs" highlightOnHover>
                  <Table.Thead style={{ backgroundColor: tc.theadBg, position: 'sticky', top: 0, zIndex: 1 }}>
                    <Table.Tr>
                      <Table.Th style={{ width: '60px' }}>Rank</Table.Th>
                      <Table.Th>Name (NIK)</Table.Th>
                      <Table.Th>Line</Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>Skills</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {analyticsData.top_employees && analyticsData.top_employees.length > 0 ? (
                      analyticsData.top_employees.map((emp, index) => (
                        <Table.Tr key={index}>
                          <Table.Td fw={700} style={{
                            color: index === 0 ? '#fab005' : index === 1 ? '#be4bdb' : index === 2 ? '#228be6' : '#909296'
                          }}>
                            #{index + 1}
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" fw={600} color="orange">{emp.employee_name}</Text>
                            <Text size="xs" color="dimmed">{emp.nik} • {emp.section}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge variant="outline" size="sm" color="orange">{emp.line || '-'}</Badge>
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>
                            <Badge 
                              color="blue" 
                              variant="light" 
                              size="sm"
                              styles={isDark ? {
                                root: { backgroundColor: 'rgba(34, 139, 230, 0.22)' },
                                label: { color: '#74c0fc' }
                              } : undefined}
                            >
                              {emp.total_skill} Skills
                            </Badge>
                          </Table.Td>
                        </Table.Tr>
                      ))
                    ) : (
                      <Table.Tr>
                        <Table.Td colSpan={4} align="center">
                          <Text size="sm" color="dimmed">No top employees data</Text>
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </Box>
            </Card>
          </Grid.Col>

          {/* Recent Activity */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder p="md" radius="md">
              <Text fw={700} size="md" mb="md">Recent Activity (Last Updates)</Text>
              <Box style={{ height: 280, overflowY: 'auto' }} pr="xs">
                {analyticsData.recent_activities && analyticsData.recent_activities.length > 0 ? (
                  <Timeline active={-1} bulletSize={22} lineWidth={2}>
                    {analyticsData.recent_activities.map((act, index) => (
                      <Timeline.Item
                        key={index}
                        bullet={<Award size={12} />}
                        title={
                          <Group justify="space-between" wrap="nowrap" gap="xs">
                            <Text size="sm" fw={700} color="orange" truncate>{act.employee_name}</Text>
                            <Text size="xs" color="dimmed" style={{ flexShrink: 0 }}>
                              {act.updated_at ? new Date(act.updated_at).toLocaleDateString('id-ID', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : '-'}
                            </Text>
                          </Group>
                        }
                      >
                        <Text size="xs" color="dimmed">
                          NIK: {act.nik} • Pos: {act.position} • Line: {act.line || '-'}
                        </Text>
                        <Text size="xs" mt={4}>
                          Current skills: <Badge 
                            size="xs" 
                            color="blue" 
                            variant="light"
                            styles={isDark ? {
                              root: { backgroundColor: 'rgba(34, 139, 230, 0.22)' },
                              label: { color: '#74c0fc' }
                            } : undefined}
                          >
                            {act.total_skill} Skills
                          </Badge>
                        </Text>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  <Text size="sm" color="dimmed" align="center" mt="xl">No recent activities found.</Text>
                )}
              </Box>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    )
  }

  // Render Reports Tab Layout
  const renderReportsTab = () => (
    <Stack gap="md">
      {/* Filtering selectors */}
      <Card withBorder p="md" radius="md">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <Select
            label="Filter Line"
            placeholder="All Lines"
            clearable
            value={reportLine}
            onChange={setReportLine}
            data={lineOptions}
            radius="md"
          />

          <Select
            label="Filter Section"
            placeholder="All Sections"
            clearable
            value={reportSection}
            onChange={setReportSection}
            data={sectionOptions}
            radius="md"
          />
        </SimpleGrid>
        <Group justify="flex-end" mt="md">
          <Button 
            color="orange" 
            leftSection={<FileDown size={16} />}
            onClick={() => handleExportExcel(reportEmployees, 'Multi_Skill_Report.xlsx')}
            disabled={reportEmployees.length === 0}
            radius="md"
          >
            Export Report (Excel)
          </Button>
          <Button 
            color="red" 
            leftSection={<FileText size={16} />}
            onClick={() => handleExportPDF(reportEmployees, 'Employee Multi Skill Report')}
            disabled={reportEmployees.length === 0}
            radius="md"
          >
            Export Report (PDF)
          </Button>
        </Group>
      </Card>

      {/* Reports Table Summary */}
      <Card withBorder radius="md" p="0" style={{ overflow: 'hidden' }}>
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead style={{ backgroundColor: tc.theadBg }}>
              <Table.Tr>
                <Table.Th style={{ paddingLeft: '16px' }}>NIK</Table.Th>
                <Table.Th>Employee Name</Table.Th>
                <Table.Th>Position</Table.Th>
                <Table.Th>Line</Table.Th>
                <Table.Th>Section</Table.Th>
                <Table.Th>Total Skills</Table.Th>
                <Table.Th>Multi Skill</Table.Th>
                <Table.Th>Skills List</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {reportLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={8} align="center" style={{ height: '200px' }}>
                    <Loader color="orange" size="md" />
                  </Table.Td>
                </Table.Tr>
              ) : reportEmployees.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={8} align="center" style={{ height: '200px' }}>
                    <Text color="dimmed">No employee skill coverage data found matching criteria.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                reportEmployees.map((emp) => {
                  const skills = []
                  for (let i = 1; i <= 10; i++) {
                    if (emp[`skill_${i}`]) {
                      const g = emp[`skill_${i}_grade`]
                      skills.push(`${emp[`skill_${i}`]}${g ? ` (${g})` : ''}`)
                    }
                  }
                  return (
                    <Table.Tr key={emp.id}>
                      <Table.Td style={{ paddingLeft: '16px' }}><Text size="sm" fw={700}>{emp.nik}</Text></Table.Td>
                      <Table.Td><Text size="sm">{emp.employee_name}</Text></Table.Td>
                      <Table.Td><Text size="sm">{emp.position}</Text></Table.Td>
                      <Table.Td><Text size="sm">{emp.line}</Text></Table.Td>
                      <Table.Td><Text size="sm">{emp.section}</Text></Table.Td>
                      <Table.Td>
                        <Badge 
                          size="md" 
                          color="blue"
                          styles={isDark ? {
                            root: { backgroundColor: 'rgba(34, 139, 230, 0.22)' },
                            label: { color: '#74c0fc' }
                          } : undefined}
                        >
                          {emp.total_skill} Skills
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="filled" color={emp.is_multiskill === 'YES' ? 'green' : 'gray'}>
                          {emp.is_multiskill}
                        </Badge>
                      </Table.Td>
                      <Table.Td><Text size="xs" color="dimmed">{skills.join(', ') || '-'}</Text></Table.Td>
                    </Table.Tr>
                  )
                })
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Card>
    </Stack>
  )

  return (
    <div style={{ padding: '8px' }}>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Multi Skill Management</Title>
        <Group>
          <Button 
            leftSection={<Upload size={16} />} 
            variant="default"
            onClick={() => setImportModalOpened(true)}
            radius="md"
          >
            Import Excel
          </Button>
          <Button 
            leftSection={<FileDown size={16} />} 
            variant="default"
            onClick={() => handleExportExcel(employees, 'Multi_Skill_Workforce.xlsx')}
            disabled={employees.length === 0}
            radius="md"
          >
            Export Excel
          </Button>
          <Button 
            leftSection={<Plus size={16} />} 
            color="orange" 
            onClick={handleOpenCreate} 
            radius="md"
          >
            New Employee
          </Button>
        </Group>
      </Group>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onChange={setActiveTab} color="orange" variant="outline">
        <Tabs.List mb="md">
          <Tabs.Tab value="directory" leftSection={<Users size={16} />}>
            Employee Skills Directory
          </Tabs.Tab>
          <Tabs.Tab value="analytics" leftSection={<BarChart3 size={16} />}>
            Analytics Dashboard
          </Tabs.Tab>
          <Tabs.Tab value="reports" leftSection={<FileText size={16} />}>
            Reports & Print
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="directory">
          {renderDirectoryTab()}
        </Tabs.Panel>

        <Tabs.Panel value="analytics">
          {renderAnalyticsTab()}
        </Tabs.Panel>

        <Tabs.Panel value="reports">
          {renderReportsTab()}
        </Tabs.Panel>
      </Tabs>

      {/* Excel Upload Modal */}
      <Modal
        opened={importModalOpened}
        onClose={() => setImportModalOpened(false)}
        title={<Text fw={700}>Bulk Import Workforce from Excel</Text>}
        radius="md"
      >
        <Stack gap="md" p="sm">
          <Text size="sm" color="dimmed">
            Please choose an Excel file (.xlsx or .xls) to upload. The columns should correspond to:
            <br />
            <strong>NIK, Employee Name, Position, Section, Line, Skill 1, Skill 1 Grade, ..., Skill 10, Skill 10 Grade</strong>
          </Text>
          <FileButton onChange={handleImportExcel} accept=".xlsx,.xls">
            {(props) => <Button {...props} leftSection={<Upload size={16} />} color="orange" fullWidth>Choose File</Button>}
          </FileButton>
        </Stack>
      </Modal>

      {/* Edit / Create Employee Skill Modal */}
      <Modal
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        title={<Text fw={700} size="lg">{drawerMode === 'create' ? 'Add New Employee Skills' : 'Edit Employee Skills'}</Text>}
        size="lg"
        radius="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md" pb="xl">
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput label="NIK" placeholder="e.g. 230045" required {...form.getInputProps('nik')} />
              <TextInput label="Employee Name" placeholder="e.g. Budi Santoso" required {...form.getInputProps('employee_name')} />
            </SimpleGrid>
            
            <SimpleGrid cols={3}>
              <Select label="Position" placeholder="Position" data={positionOptions} {...form.getInputProps('position')} />
              <Select label="Line" placeholder="Line" data={lineOptions} {...form.getInputProps('line')} />
              <Select label="Section" placeholder="Section" data={sectionOptions} {...form.getInputProps('section')} />
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput label="Join Date" placeholder="YYYY-MM-DD" {...form.getInputProps('join_date')} />
              <Select label="Status" placeholder="Choose Status" data={['Active', 'Inactive']} {...form.getInputProps('status')} />
            </SimpleGrid>

            <Text size="sm" fw={700} mt="sm" color="orange">Employee Skill Sets & Grades</Text>
            
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <Group key={num} grow preventGrowOverflow={false} wrap="nowrap" align="flex-end">
                  <TextInput
                    label={`Skill ${num}`}
                    placeholder={num <= 3 ? "Required Skill" : "Additional Skill"}
                    style={{ flex: 1 }}
                    {...form.getInputProps(`skill_${num}`)}
                  />
                  <Select
                    label="Grade"
                    placeholder="A/B/C"
                    data={['A', 'B', 'C']}
                    clearable
                    style={{ width: '90px', flexGrow: 0 }}
                    {...form.getInputProps(`skill_${num}_grade`)}
                  />
                </Group>
              ))}
            </SimpleGrid>
          </Stack>
          
          <Box pt="md" style={{ borderTop: `1px solid ${tc.border}` }}>
            <Button type="submit" color="orange" fullWidth size="md" radius="md">
              {drawerMode === 'create' ? 'Save Employee' : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Modal>
    </div>
  )
}
