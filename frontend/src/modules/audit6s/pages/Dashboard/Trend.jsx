"use client"

import { useState, useEffect } from "react"
import {
  Card,
  Title,
  Text,
  Group,
  Stack,
  Button,
  Loader,
  Center,
  Divider,
  useMantineTheme,
  Select,
  SimpleGrid,
  Paper,
  Box,
  Badge,
  ThemeIcon,
  RingProgress,
  Tabs,
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates"
import { notifications } from "@mantine/notifications"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts"
import {
  IconChartLine,
  IconCalendarStats,
  IconFilter,
  IconArrowUp,
  IconArrowDown,
  IconMinus,
  IconBuildingFactory2,
  IconBuildingSkyscraper,
  IconTarget,
} from "@tabler/icons-react"
import dayjs from "dayjs"

import api from "../../services/api"
import { useThemeColors } from "../../../../hooks/useThemeColors"

// Vibrant color palette for TV display
const COLORS = [
  "#3498db",
  "#e74c3c",
  "#2ecc71",
  "#f39c12",
  "#9b59b6",
  "#1abc9c",
  "#d35400",
  "#34495e",
  "#16a085",
  "#c0392b",
]

// Helper function to format scores with exactly two decimal places
const formatScore = (score) => {
  if (!score || score === "N/A") return "N/A"
  return Number.parseFloat(score).toFixed(2)
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const score = formatScore(payload[0].value)
    const scoreColor = score >= 3.5 ? "#2ecc71" : score >= 2.5 ? "#3498db" : score >= 1.5 ? "#f39c12" : "#e74c3c"

    return (
      <Paper
        shadow="md"
        p="md"
        withBorder
        style={{
          backgroundColor: "var(--lms-chart-tooltip-bg)",
          borderColor: "var(--lms-chart-tooltip-border)",
          color: "var(--lms-text-primary)"
        }}
      >
        <Text fw={700}>{label}</Text>
        <Group spacing="xs">
          <Text>Skor:</Text>
          <Text fw={700} style={{ color: scoreColor }}>
            {score}
          </Text>
        </Group>
      </Paper>
    )
  }
  return null
}

// Array of month names
const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]

export default function DepartmentScoreTrend() {
  const theme = useMantineTheme()
  const tc = useThemeColors()
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState([])
  const [departmentType, setDepartmentType] = useState("production") // Default to production
  const [timePeriod, setTimePeriod] = useState("last_6_months")
  const [dateRange, setDateRange] = useState([null, null])
  const [trendData, setTrendData] = useState([])
  const [departmentCharts, setDepartmentCharts] = useState([])

  // Time period options
  const periodOptions = [
    { value: "last_6_months", label: "6 Bulan Terakhir" },
    { value: "last_12_months", label: "12 Bulan Terakhir" },
    { value: "current_year", label: "Tahun Ini" },
    { value: "custom", label: "Periode Kustom" },
  ]

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get("/departments")
        setDepartments(response.data)

        // Setelah departments diambil, langsung fetch trend data
        const productionDeptIds = response.data.filter((dept) => dept.type === departmentType).map((dept) => dept.id)

        if (productionDeptIds.length > 0) {
          const params = {
            department_id: productionDeptIds.join(","),
            period: timePeriod,
          }

          setLoading(true)
          const trendResponse = await api.get("/trends/department-scores", { params })
          setTrendData(trendResponse.data.data)
          setLoading(false)
        }
      } catch (error) {
        notifications.show({
          title: "Error",
          message: "Failed to fetch data",
          color: "red",
        })
        setLoading(false)
      }
    }

    fetchDepartments()
  }, []) // Hanya jalankan sekali saat komponen mount

  // Fetch trend data when selection changes
  useEffect(() => {
    // Hanya jalankan jika departments sudah tersedia
    if (departments.length > 0) {
      fetchTrendData()
    }
  }, [departmentType, timePeriod, departments.length])

  // Process trend data for individual department charts
  useEffect(() => {
    if (trendData.length > 0) {
      const departmentData = []

      // For each department, create its own chart data
      trendData.forEach((dept, index) => {
        // Map to store monthly data for this department
        const monthlyDataMap = new Map()

        // Process each data point
        dept.data_points.forEach((point) => {
          const date = new Date(point.date)
          const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
          const monthName = MONTH_NAMES[date.getMonth()]
          const monthKey = `${monthName} ${date.getFullYear()}`

          // Initialize month entry if it doesn't exist
          if (!monthlyDataMap.has(monthKey)) {
            monthlyDataMap.set(monthKey, {
              month: monthKey,
              yearMonth: yearMonth, // For sorting
              sum: 0,
              count: 0,
            })
          }

          // Add this data point to the sum
          const monthData = monthlyDataMap.get(monthKey)
          monthData.sum += point.grand_total_score
          monthData.count += 1
        })

        // Convert to array and calculate averages
        let monthlyData = Array.from(monthlyDataMap.values())

        // Sort by year and month
        monthlyData.sort((a, b) => a.yearMonth.localeCompare(b.yearMonth))

        // Calculate average score for each month
        monthlyData = monthlyData.map((month) => ({
          month: month.month,
          score: Number.parseFloat((month.sum / month.count).toFixed(2)),
        }))

        // Calculate trend indicators
        let trendIndicator = "neutral"
        let trendPercentage = 0

        if (monthlyData.length >= 2) {
          const currentScore = monthlyData[monthlyData.length - 1].score
          const previousScore = monthlyData[monthlyData.length - 2].score

          if (currentScore > previousScore) {
            trendIndicator = "up"
            trendPercentage = ((currentScore - previousScore) / previousScore) * 100
          } else if (currentScore < previousScore) {
            trendIndicator = "down"
            trendPercentage = ((previousScore - currentScore) / previousScore) * 100
          }
        }

        // Calculate average score for the entire period
        const totalScore = monthlyData.reduce((sum, item) => sum + item.score, 0)
        const averageScore = formatScore(monthlyData.length > 0 ? totalScore / monthlyData.length : 0)
        const currentScore = monthlyData.length > 0 ? formatScore(monthlyData[monthlyData.length - 1].score) : "N/A"

        // Add to department charts data
        departmentData.push({
          department_id: dept.department_id,
          department_name: dept.department_name,
          color: COLORS[index % COLORS.length],
          chartData: monthlyData,
          trendIndicator,
          trendPercentage: trendPercentage.toFixed(1),
          averageScore: averageScore,
          currentScore: currentScore,
        })
      })

      setDepartmentCharts(departmentData)
    } else {
      setDepartmentCharts([])
    }
  }, [trendData])

  const fetchTrendData = async () => {
    setLoading(true)
    try {
      // Get department IDs of the selected type
      const departmentIds = departments.filter((dept) => dept.type === departmentType).map((dept) => dept.id)

      if (departmentIds.length === 0) {
        setTrendData([])
        setLoading(false)
        return
      }

      const params = {
        department_id: departmentIds.join(","),
      }

      if (timePeriod === "custom" && dateRange[0] && dateRange[1]) {
        params.start_date = dayjs(dateRange[0]).format("YYYY-MM-DD")
        params.end_date = dayjs(dateRange[1]).format("YYYY-MM-DD")
      } else {
        params.period = timePeriod
      }

      const response = await api.get("/trends/department-scores", { params })
      setTrendData(response.data.data)
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch trend data",
        color: "red",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (value) => {
    setDateRange(value)
  }

  const handleFilterApply = () => {
    fetchTrendData()
  }

  // Helper function to get score color
  const getScoreColor = (score) => {
    const numScore = Number.parseFloat(score)
    if (numScore >= 3.5) return "green"
    if (numScore >= 2.5) return "blue"
    if (numScore >= 1.5) return "yellow"
    return "red"
  }

  // Add a helper function to calculate percentage to target after the getScoreColor function
  const calculatePercentageToTarget = (score) => {
    if (!score || score === "N/A") return 0
    const numScore = Number.parseFloat(score)
    return Math.round((numScore / 3.0) * 100)
  }

  // Helper function to get trend icon
  const getTrendIcon = (indicator) => {
    if (indicator === "up") return <IconArrowUp size={16} color="#2ecc71" />
    if (indicator === "down") return <IconArrowDown size={16} color="#e74c3c" />
    return <IconMinus size={16} color="#7f8c8d" />
  }

  return (
    <Stack spacing={0}>
      <Card
        shadow="sm"
        p="xl"
        radius="md"
        withBorder
        style={{ borderBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
      >
        <Group position="apart" mb="md">
          <Group>
            <ThemeIcon size={42} radius="md" color="blue">
              <IconChartLine size={24} />
            </ThemeIcon>
            <Title order={2}>Dashboard Trend Skor Departemen</Title>
          </Group>

          <Badge size="lg" color={departmentType === "production" ? "blue" : "teal"} variant="filled" p="md">
            {departmentType === "production" ? "Departemen Produksi" : "Departemen Non-Produksi"}
          </Badge>
        </Group>

        <Paper p="md" withBorder radius="md" bg="rgba(0,0,0,0.03)">
          <Group position="apart" grow>
            <Group>
              <ThemeIcon size="lg" color="gray" variant="light">
                <IconFilter size={18} />
              </ThemeIcon>
              <Title order={4}>Filter Data</Title>
            </Group>

            <Group position="right">
              <Text size="sm" color="dimmed">
                {timePeriod === "last_6_months"
                  ? "Menampilkan data 6 bulan terakhir"
                  : timePeriod === "last_12_months"
                    ? "Menampilkan data 12 bulan terakhir"
                    : timePeriod === "current_year"
                      ? "Menampilkan data tahun ini"
                      : "Menampilkan data periode kustom"}
              </Text>
            </Group>
          </Group>

          <Divider my="md" />

          <Group position="apart" grow>
            <Tabs
              value={departmentType}
              onChange={setDepartmentType}
              variant="pills"
              radius="md"
              defaultValue="production"
            >
              <Tabs.List grow>
                <Tabs.Tab value="production" leftSection={<IconBuildingFactory2 size={16} />} color="blue" fw={500}>
                  Departemen Produksi
                </Tabs.Tab>
                <Tabs.Tab
                  value="non-production"
                  leftSection={<IconBuildingSkyscraper size={16} />}
                  color="teal"
                  fw={500}
                >
                  Departemen Non-Produksi
                </Tabs.Tab>
              </Tabs.List>
            </Tabs>

            <Select
              label="Periode Waktu"
              data={periodOptions}
              value={timePeriod}
              onChange={setTimePeriod}
              icon={<IconCalendarStats size={16} />}
              size="md"
            />
          </Group>

          {timePeriod === "custom" && (
            <Group position="apart" grow mt="md">
              <DatePickerInput
                type="range"
                label="Rentang Tanggal Kustom"
                placeholder="Pilih rentang tanggal"
                value={dateRange}
                onChange={handleDateRangeChange}
                clearable
                size="md"
              />
              <Group position="right" mt={28}>
                <Button onClick={handleFilterApply} size="md">
                  Terapkan Filter
                </Button>
              </Group>
            </Group>
          )}
        </Paper>
      </Card>

      <Card
        shadow="sm"
        p="xl"
        radius="md"
        withBorder
        style={{ borderTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
      >
        {loading ? (
          <Center style={{ height: 400 }}>
            <Loader size="xl" variant="bars" />
          </Center>
        ) : departmentCharts.length > 0 ? (
          <>
            <SimpleGrid cols={1} spacing="xl">
              {departmentCharts.map((dept) => (
                <Paper key={dept.department_id} shadow="md" p="lg" radius="md" withBorder>
                  <Group position="apart" mb="lg">
                    <Group>
                      <Box
                        style={{
                          width: 12,
                          height: 40,
                          backgroundColor: dept.color,
                          borderRadius: 3,
                        }}
                      />
                      <Stack spacing={0}>
                        <Title order={3}>{dept.department_name}</Title>
                        <Text size="sm" color="dimmed">
                          Trend Skor Audit 6S
                        </Text>
                      </Stack>
                    </Group>

                    <Group spacing="xl">
                      <Stack align="center" spacing={5}>
                        <Text size="xs" color="dimmed" transform="uppercase">
                          Skor Saat Ini
                        </Text>
                        <Badge
                          size="xl"
                          color={getScoreColor(dept.currentScore)}
                          variant="filled"
                          p="md"
                          style={{ fontSize: 18 }}
                        >
                          {dept.currentScore}
                        </Badge>
                      </Stack>

                      <Stack align="center" spacing={5}>
                        <Text size="xs" color="dimmed" transform="uppercase">
                          Rata-rata
                        </Text>
                        <Badge
                          size="xl"
                          color={getScoreColor(dept.averageScore)}
                          variant="light"
                          p="md"
                          style={{ fontSize: 18 }}
                        >
                          {dept.averageScore}
                        </Badge>
                      </Stack>

                      <Stack align="center" spacing={5}>
                        <Text size="xs" color="dimmed" transform="uppercase">
                          % Terhadap Target
                        </Text>
                        <Group spacing={5} position="center">
                          <ThemeIcon size="sm" radius="xl" color="red">
                            <IconTarget size={12} />
                          </ThemeIcon>
                          <Badge
                            size="xl"
                            color={calculatePercentageToTarget(dept.averageScore) >= 100 ? "green" : "orange"}
                            p="md"
                            style={{ fontSize: 18 }}
                          >
                            {calculatePercentageToTarget(dept.averageScore)}%
                          </Badge>
                        </Group>
                      </Stack>

                      <Stack align="center" spacing={5}>
                        <Text size="xs" color="dimmed" transform="uppercase">
                          Trend
                        </Text>
                        <Group spacing={5}>
                          {getTrendIcon(dept.trendIndicator)}
                          <Text
                            fw={700}
                            color={
                              dept.trendIndicator === "up" ? "green" : dept.trendIndicator === "down" ? "red" : "gray"
                            }
                          >
                            {dept.trendPercentage}%
                          </Text>
                        </Group>
                      </Stack>

                      <RingProgress
                        size={80}
                        thickness={8}
                        roundCaps
                        sections={[
                          { value: Number.parseFloat(dept.averageScore) * 25, color: getScoreColor(dept.averageScore) },
                        ]}
                        label={
                          <Text fw={700} ta="center" size="lg">
                            {formatScore(dept.averageScore)}
                          </Text>
                        }
                      />
                    </Group>
                  </Group>

                  <div style={{ height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dept.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={tc.chartGrid} />
                        <XAxis
                          dataKey="month"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                          tick={{ fill: tc.chartLabel, fontSize: 12 }}
                          stroke={tc.chartAxis}
                        />
                        <YAxis
                          domain={[2, 4]}
                          ticks={[2, 2.5, 3, 3.5, 4]}
                          label={{ value: "Skor", angle: -90, position: "insideLeft", fill: tc.chartLabel }}
                          tick={{ fill: tc.chartLabel, fontSize: 12 }}
                          stroke={tc.chartAxis}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={3.5} stroke="#2ecc71" strokeDasharray="3 3" />
                        <ReferenceLine y={2.5} stroke="#3498db" strokeDasharray="3 3" />
                        <ReferenceLine y={1.5} stroke="#f39c12" strokeDasharray="3 3" />
                        <ReferenceLine y={3} stroke="#e74c3c" strokeWidth={2}>
                          <Label
                            value="Target (3.00)"
                            position="right"
                            fill="#e74c3c"
                            fontSize={12}
                            fontWeight="bold"
                          />
                        </ReferenceLine>
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke={dept.color}
                          activeDot={{ r: 8 }}
                          strokeWidth={3}
                          connectNulls={true}
                          dot={{ stroke: dept.color, strokeWidth: 2, r: 6, fill: "white" }}
                          label={({ x, y, value }) => (
                            <text x={x} y={y - 10} fill="var(--lms-chart-label)" fontSize={11} fontWeight="bold" textAnchor="middle">
                              {formatScore(value)}
                            </text>
                          )}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <Group position="apart" mt="md">
                    <Text size="sm" color="dimmed">
                      <Group spacing="xs">
                        <ThemeIcon size="xs" radius="xl" color="red">
                          <IconTarget size={10} />
                        </ThemeIcon>
                        <Text>Target: 3.00</Text>
                        Skor: <Badge color="red">{"<1.5"}</Badge> <Badge color="yellow">1.5-2.5</Badge>{" "}
                        <Badge color="blue">2.5-3.5</Badge> <Badge color="green">{">3.5"}</Badge>
                      </Group>
                    </Text>
                    <Text size="sm" color="dimmed">
                      Data terakhir:{" "}
                      {dept.chartData.length > 0 ? dept.chartData[dept.chartData.length - 1].month : "N/A"}
                    </Text>
                  </Group>
                </Paper>
              ))}
            </SimpleGrid>

            <Paper p="md" withBorder radius="md" mt="xl" bg="rgba(0,0,0,0.03)">
              <Group position="apart">
                <Text size="sm" color="dimmed">
                  Menampilkan trend skor rata-rata bulanan Grand Total untuk setiap{" "}
                  {departmentType === "production" ? "Departemen Produksi" : "Departemen Non-Produksi"}
                </Text>
                <Text size="sm" fw={500}>
                  Total Departemen: {departmentCharts.length}
                </Text>
              </Group>
            </Paper>
          </>
        ) : (
          <Center style={{ height: 400 }}>
            <Stack align="center" spacing="md">
              <IconChartLine size={48} color="#aaa" />
              <Text color="dimmed" size="xl" fw={500}>
                Tidak ada data trend untuk ditampilkan
              </Text>
              <Text color="dimmed" size="sm">
                Pilih departemen atau periode waktu yang berbeda
              </Text>
            </Stack>
          </Center>
        )}
      </Card>
    </Stack>
  )
}
