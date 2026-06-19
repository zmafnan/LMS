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
  getLeanEmployees, createLeanEmployee, updateLeanEmployee, deleteLeanEmployee, bulkImportLeanEmployees, getLeanAnalytics, getLeanReports 
} from '../../services/leanMultiSkillService'
import { useThemeColors } from '../../hooks/useThemeColors'

export default function LeanMultiSkillPage() {
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

  // Master lists options fallbacks
  const defaultLines = ['Lean Office', 'Production Line', 'Support Team', 'Management']
  const defaultSections = ['Continuous Improvement', 'Industrial Engineering', 'Training & Culture']
  const defaultPositions = ['Lean Manager', 'Lean Engineer', 'CI Specialist', 'Lean Facilitator', 'Lean Trainer', 'IE Specialist']

  // Unfiltered dataset to extract unique filter list options
  const [filterData, setFilterData] = useState([])

  const loadFilterOptions = () => {
    getLeanEmployees({ limit: 1000 })
      .then((res) => {
        setFilterData(res.data)
      })
      .catch(console.error)
  }

  useEffect(() => {
    loadFilterOptions()
  }, [])

  const getUniqueOptions = (field, fallbackOptions = []) => {
    const values = filterData.map(emp => emp[field]).filter(Boolean)
    const unique = Array.from(new Set(values))
    return Array.from(new Set([...fallbackOptions, ...unique])).sort()
  }

  const lineOptions = getUniqueOptions('line', defaultLines)
  const sectionOptions = getUniqueOptions('section', defaultSections)
  const positionOptions = getUniqueOptions('position', defaultPositions)

  // Recharts color palette
  const CHART_COLORS = ['#fd7e14', '#228be6', '#40c057', '#fab005', '#be4bdb', '#7950f2', '#e64980']

  // Form setup
  const form = useForm({
    initialValues: {
      nik: '',
      employee_name: '',
      position: 'CI Specialist',
      section: 'Continuous Improvement',
      line: 'Lean Office',
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

    getLeanEmployees(filters)
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
    getLeanAnalytics()
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
    getLeanReports(filters)
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
      position: emp.position || 'CI Specialist',
      section: emp.section || 'Continuous Improvement',
      line: emp.line || 'Lean Office',
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
    if (!window.confirm('Are you sure you want to delete this Lean Team employee record?')) return
    deleteLeanEmployee(id)
      .then(() => {
        notifications.show({
          title: 'Deleted',
          message: 'Lean Team employee successfully removed.',
          color: 'green',
        })
        loadEmployees()
        loadFilterOptions()
      })
      .catch((err) => {
        notifications.show({
          title: 'Delete Failed',
          message: err.message || 'Failed to remove employee.',
          color: 'red',
        })
      })
  }

  const handleSubmit = (values) => {
    const action = drawerMode === 'create' 
      ? createLeanEmployee(values)
      : updateLeanEmployee(selectedEmployee.id, values)

    action
      .then(() => {
        notifications.show({
          title: drawerMode === 'create' ? 'Created' : 'Updated',
          message: `Lean Team employee successfully ${drawerMode === 'create' ? 'created' : 'updated'}.`,
          color: 'green',
        })
        setDrawerOpened(false)
        loadEmployees()
        loadFilterOptions()
      })
      .catch((err) => {
        notifications.show({
          title: 'Save Failed',
          message: err.message || 'Database error occurred.',
          color: 'red',
        })
      })
  }

  // Excel Operations
  const handleExportExcel = (data, filename) => {
    const formatData = data.map((emp) => {
      const skillsList = []
      for (let i = 1; i <= 10; i++) {
        if (emp[`skill_${i}`]) {
          skillsList.push(`${emp[`skill_${i}`]} (${emp[`skill_${i}_grade`] || '-'})`)
        }
      }
      return {
        NIK: emp.nik,
        Name: emp.employee_name,
        Position: emp.position,
        Section: emp.section,
        Line: emp.line,
        Status: emp.status,
        'Join Date': emp.join_date,
        'Skills Count': emp.total_skill || 0,
        'Competency Skills': skillsList.join(', ')
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(formatData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lean Team')
    XLSX.writeFile(workbook, filename)
  }

  const handleImportExcel = (file) => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(worksheet)

        // Convert key names from human headers to database fields
        const formatted = json.map((row) => {
          const res = {}
          const keys = Object.keys(row)

          keys.forEach((key) => {
            const cleanKey = key.trim().toLowerCase()
            if (cleanKey === 'nik') res.nik = String(row[key])
            else if (cleanKey === 'employee name' || cleanKey === 'name') res.employee_name = row[key]
            else if (cleanKey === 'position') res.position = row[key]
            else if (cleanKey === 'section') res.section = row[key]
            else if (cleanKey === 'line') res.line = row[key]
            else if (cleanKey === 'status') res.status = row[key]
            else if (cleanKey === 'join date') res.join_date = row[key]
            
            // Skill mappings
            for (let i = 1; i <= 10; i++) {
              if (cleanKey === `skill ${i}` || cleanKey === `skill_${i}`) {
                res[`skill_${i}`] = row[key]
              }
              if (cleanKey === `skill ${i} grade` || cleanKey === `skill_${i}_grade` || cleanKey === `skill ${i} lvel`) {
                res[`skill_${i}_grade`] = row[key]
              }
            }
          })
          return res
        })

        bulkImportLeanEmployees(formatted)
          .then((res) => {
            notifications.show({
              title: 'Import Success',
              message: `Successfully processed Excel: ${res.inserted} inserted, ${res.updated} updated.`,
              color: 'green',
            })
            setImportModalOpened(false)
            loadEmployees()
            loadFilterOptions()
          })
          .catch((err) => {
            notifications.show({
              title: 'Import Failed',
              message: err.message || 'Failed to process sheet records.',
              color: 'red',
            })
          })
      } catch (err) {
        notifications.show({
          title: 'Format Error',
          message: 'Could not read file. Ensure it is a valid Excel structure.',
          color: 'red',
        })
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // PDF Export Operation
  const handleExportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4')
    doc.text('Lean Team Multi Skill Competency Matrix Report', 14, 15)
    doc.setFontSize(10)
    doc.text(`Generated At: ${new Date().toLocaleDateString('id-ID')}`, 14, 20)

    const tableHeaders = [['NIK', 'Employee Name', 'Position', 'Section', 'Line', 'Skills Count', 'Competencies List']]
    const tableRows = reportEmployees.map((emp) => {
      const skills = []
      for (let i = 1; i <= 10; i++) {
        if (emp[`skill_${i}`]) {
          skills.push(`${emp[`skill_${i}`]} (${emp[`skill_${i}_grade`] || '-'})`)
        }
      }
      return [
        emp.nik,
        emp.employee_name,
        emp.position || '-',
        emp.section || '-',
        emp.line || '-',
        emp.total_skill || '0',
        skills.join(', ') || '-'
      ]
    })

    doc.autoTable({
      head: tableHeaders,
      body: tableRows,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [253, 126, 20] }
    })

    doc.save('Lean_Team_Competency_Matrix.pdf')
  }

  // Directory Tab Layout
  const renderDirectoryTab = () => (
    <Stack gap="md">
      {/* Filtering Card */}
      <Card withBorder p="md" radius="md">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 5 }} spacing="sm">
          <TextInput
            placeholder="Search NIK, Name or Focus..."
            leftSection={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            radius="md"
          />
          <Select
            placeholder="Filter Section"
            clearable
            value={filterSection}
            onChange={setFilterSection}
            data={sectionOptions}
            radius="md"
          />
          <Select
            placeholder="Filter Focus Area"
            clearable
            value={filterLine}
            onChange={setFilterLine}
            data={lineOptions}
            radius="md"
          />
          <Select
            placeholder="Filter Position"
            clearable
            value={filterPosition}
            onChange={setFilterPosition}
            data={positionOptions}
            radius="md"
          />
          <Button variant="filled" color="orange" onClick={loadEmployees} radius="md" leftSection={<Filter size={16} />}>
            Apply Filters
          </Button>
        </SimpleGrid>
      </Card>

      {/* Directory Table */}
      <Card withBorder radius="md" p="0" style={{ overflow: 'hidden' }}>
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover verticalSpacing="sm" style={{ minWidth: 1200 }}>
            <Table.Thead style={{ backgroundColor: tc.theadBg }}>
              <Table.Tr>
                <Table.Th className="sticky-col-1" style={{ width: '110px', paddingLeft: '16px', backgroundColor: tc.theadBg }}>NIK</Table.Th>
                <Table.Th className="sticky-col-2 sticky-border-right" style={{ width: '200px', backgroundColor: tc.theadBg }}>Employee Name</Table.Th>
                <Table.Th style={{ width: '130px' }}>Focus Area</Table.Th>
                <Table.Th style={{ width: '180px' }}>Section</Table.Th>
                <Table.Th style={{ width: '160px' }}>Position</Table.Th>
                <Table.Th style={{ width: '110px' }}>Total Skills</Table.Th>
                <Table.Th style={{ width: '100px' }}>Multi Skill?</Table.Th>
                <Table.Th style={{ minWidth: '350px' }}>Competency Skills (Grades)</Table.Th>
                {hasRole(['admin', 'leader']) && (
                  <Table.Th style={{ width: '100px', textAlign: 'right', paddingRight: '16px' }}>Actions</Table.Th>
                )}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                <Table.Tr>
                  <Table.Td colSpan={9} align="center" style={{ height: '220px' }}>
                    <Loader color="orange" size="md" />
                  </Table.Td>
                </Table.Tr>
              ) : employees.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={9} align="center" style={{ height: '220px' }}>
                    <Text color="dimmed">No Lean Team members found. Try checking filters or seed sample records.</Text>
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
                      <Table.Td><Text size="sm">{emp.position || '-'}</Text></Table.Td>
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
                      {hasRole(['admin', 'leader']) && (
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
                      )}
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
                <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase', letterSpacing: '0.8px' }}>Total Team</Text>
                <Title order={1} mt={4}>{analyticsData.total_all}</Title>
              </div>
              <Users size={24} color="#fd7e14" style={{ opacity: 0.8 }} />
            </Box>
          </Card>

          <Card withBorder p="md" radius="md" style={{ position: 'relative', overflow: 'hidden' }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase', letterSpacing: '0.8px' }}>Multi Skilled</Text>
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
                <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase', letterSpacing: '0.8px' }}>Highest Area</Text>
                <Text size="md" fw={850} mt={6} color="blue" lineClamp={1}>{analyticsData.highest_multiskill_line}</Text>
              </div>
            </Box>
          </Card>

          <Card withBorder p="md" radius="md" style={{ position: 'relative', overflow: 'hidden' }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text size="xs" color="dimmed" fw={700} style={{ textTransform: 'uppercase', letterSpacing: '0.8px' }}>Lowest Area</Text>
                <Text size="md" fw={850} mt={6} color="red" lineClamp={1}>{analyticsData.lowest_multiskill_line}</Text>
              </div>
            </Box>
          </Card>
        </SimpleGrid>

        <Grid gutter="md">
          {/* Multi Skill % by Line */}
          <Grid.Col span={12}>
            <Card withBorder p="md" radius="md">
              <Text fw={700} size="md" mb="md">Multi Skill Competency by Focus Area (%)</Text>
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
                    <Bar dataKey="percentage" name="Competency %" fill="#228be6" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: tc.chartLabel, fontSize: 10 }} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid.Col>

          {/* Multi Skill % by Section */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder p="md" radius="md">
              <Text fw={700} size="md" mb="md">Multi Skill Percentage by Lean Section (%)</Text>
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
                    <Bar dataKey="percentage" name="Competency %" fill="#fab005" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: tc.chartLabel, fontSize: 10 }} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid.Col>

          {/* Skill Distribution */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder p="md" radius="md">
              <Text fw={700} size="md" mb="md">Competencies Quantity Distribution (Active Staff)</Text>
              <Box style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredDistribution}
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={tc.chartGrid} />
                    <XAxis dataKey="skills_count" name="Skills Quantity" stroke={tc.chartAxis} unit=" skills" />
                    <YAxis stroke={tc.chartAxis} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: tc.tooltipBg, borderColor: tc.tooltipBorder, color: tc.tooltipColor }} />
                    <Bar dataKey="employees_count" name="Team Count" fill="#40c057" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: tc.chartLabel, fontSize: 10 }} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid.Col>

          {/* Top Multi Skilled Employees */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder p="md" radius="md" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Text fw={700} size="md" mb="md">Top Skilled Lean Facilitators</Text>
              <Box style={{ flex: 1, overflowY: 'auto' }}>
                <Table highlightOnHover verticalSpacing="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: '80px' }}>NIK</Table.Th>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Focus Area</Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>Competencies</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {analyticsData.top_employees && analyticsData.top_employees.length > 0 ? (
                      analyticsData.top_employees.map((emp) => (
                        <Table.Tr key={emp.nik}>
                          <Table.Td><Text size="xs" fw={700}>{emp.nik}</Text></Table.Td>
                          <Table.Td><Text size="xs" fw={600}>{emp.employee_name}</Text></Table.Td>
                          <Table.Td><Text size="xs">{emp.line}</Text></Table.Td>
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
                          NIK: {act.nik} • Pos: {act.position} • Focus: {act.line || '-'}
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
      <Card withBorder p="md" radius="md">
        <Group align="flex-end" justify="space-between" wrap="nowrap">
          <Group align="flex-end" style={{ flex: 1 }}>
            <Select
              label="Filter Section"
              placeholder="All sections"
              clearable
              value={reportSection}
              onChange={setReportSection}
              data={sectionOptions}
              style={{ width: '200px' }}
              radius="md"
            />
            <Select
              label="Filter Focus Area"
              placeholder="All focus areas"
              clearable
              value={reportLine}
              onChange={setReportLine}
              data={lineOptions}
              style={{ width: '200px' }}
              radius="md"
            />
            <Button color="orange" leftSection={<Filter size={16} />} onClick={loadReportData} radius="md">
              Filter Records
            </Button>
          </Group>

          <Group>
            <Button 
              leftSection={<FileText size={16} />} 
              color="red"
              variant="light"
              onClick={handleExportPDF}
              disabled={reportEmployees.length === 0}
              radius="md"
            >
              Export PDF
            </Button>
            <Button 
              leftSection={<FileDown size={16} />} 
              color="green"
              variant="light"
              onClick={() => handleExportExcel(reportEmployees, 'Lean_Team_Competency_Matrix.xlsx')}
              disabled={reportEmployees.length === 0}
              radius="md"
            >
              Export Excel
            </Button>
          </Group>
        </Group>
      </Card>

      <Card withBorder radius="md" p="0" style={{ overflow: 'hidden' }}>
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover verticalSpacing="sm" style={{ minWidth: 1000 }}>
            <Table.Thead style={{ backgroundColor: tc.theadBg }}>
              <Table.Tr>
                <Table.Th style={{ paddingLeft: '16px' }}>NIK</Table.Th>
                <Table.Th>Employee Name</Table.Th>
                <Table.Th>Position</Table.Th>
                <Table.Th>Section</Table.Th>
                <Table.Th>Focus Area</Table.Th>
                <Table.Th>Total Skills</Table.Th>
                <Table.Th>Multi Skill?</Table.Th>
                <Table.Th style={{ minWidth: '300px' }}>Skills List</Table.Th>
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
                    <Text color="dimmed">No data matches current filters.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                reportEmployees.map((emp) => {
                  const skills = []
                  for (let i = 1; i <= 10; i++) {
                    if (emp[`skill_${i}`]) {
                      skills.push(`${emp[`skill_${i}`]} (${emp[`skill_${i}_grade`] || '-'})`)
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
                          variant="light"
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
        <Title order={2}>Lean Team Multi Skill</Title>
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
            onClick={() => handleExportExcel(employees, 'Lean_Team_Multi_Skill.xlsx')}
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
            New Staff Member
          </Button>
        </Group>
      </Group>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onChange={setActiveTab} color="orange" variant="outline">
        <Tabs.List mb="md">
          <Tabs.Tab value="directory" leftSection={<Users size={16} />}>
            Lean Competency Directory
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
        title={<Text fw={700}>Bulk Import Lean Team from Excel</Text>}
        radius="md"
      >
        <Stack gap="md" p="sm">
          <Text size="sm" color="dimmed">
            Choose an Excel file (.xlsx or .xls) to upload. Columns should correspond to:
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
        title={<Text fw={700} size="lg">{drawerMode === 'create' ? 'Add New Staff Skills' : 'Edit Staff Skills'}</Text>}
        size="lg"
        radius="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md" pb="xl">
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput label="NIK" placeholder="e.g. 990001" required {...form.getInputProps('nik')} />
              <TextInput label="Employee Name" placeholder="e.g. Ferry Wijaya" required {...form.getInputProps('employee_name')} />
            </SimpleGrid>
            
            <SimpleGrid cols={3}>
              <TextInput label="Position" placeholder="e.g. CI Specialist" {...form.getInputProps('position')} />
              <TextInput label="Focus Area (Line)" placeholder="e.g. Lean Office" {...form.getInputProps('line')} />
              <TextInput label="Section" placeholder="e.g. Continuous Improvement" {...form.getInputProps('section')} />
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput label="Join Date" placeholder="YYYY-MM-DD" {...form.getInputProps('join_date')} />
              <Select label="Status" placeholder="Choose Status" data={['Active', 'Inactive']} {...form.getInputProps('status')} />
            </SimpleGrid>

            <Text size="sm" fw={700} mt="sm" color="orange">Lean Skill Sets & Competency Grades</Text>
            
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <Group key={num} grow preventGrowOverflow={false} wrap="nowrap" align="flex-end">
                  <TextInput
                    label={`Skill ${num}`}
                    placeholder={num <= 3 ? "Required Competency" : "Additional Skill"}
                    style={{ flex: 1 }}
                    {...form.getInputProps(`skill_${num}`)}
                  />
                  <Select
                    label="Grade"
                    placeholder="A/B/C"
                    data={['A', 'B', 'C', 'D']}
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
              {drawerMode === 'create' ? 'Save Staff Member' : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Modal>
    </div>
  )
}
