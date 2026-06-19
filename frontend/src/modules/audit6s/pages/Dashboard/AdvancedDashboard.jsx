"use client"

import { useState, useEffect } from "react"
import {
  Card,
  Title,
  Text,
  Group,
  Stack,
  Grid,
  Paper,
  ThemeIcon,
  Select,
  NumberInput,
  Badge,
  Divider,
  Center,
  Loader,
  Tabs,
  Progress,
} from "@mantine/core"
import {
  IconChartBar,
  IconChartLine,
  IconBuildingFactory2,
  IconBuildingSkyscraper,
  IconTrendingUp,
  IconTrendingDown,
  IconFilter,
  IconTarget,
} from "@tabler/icons-react"
import { notifications } from "@mantine/notifications"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts"
import api from "../../services/api"
import { useThemeColors } from "../../../../hooks/useThemeColors"

// Month names for x-axis labels
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// Vibrant color palette for charts
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

// Target score value
const TARGET_SCORE = 3.0

// Helper function to format scores with exactly 2 decimal places
const formatScore = (score) => {
  if (!score || score === "N/A") return "N/A"
  return Number.parseFloat(score).toFixed(2)
}

// Helper function to get score color
const getScoreColor = (score) => {
  const numScore = Number.parseFloat(score)
  if (numScore >= 3.5) return "green"
  if (numScore >= 2.5) return "blue"
  if (numScore >= 1.5) return "yellow"
  return "red"
}

// Helper function to calculate percentage to target
const calculatePercentageToTarget = (score) => {
  if (!score || score === "N/A") return 0
  const numScore = Number.parseFloat(score)
  return Math.round((numScore / TARGET_SCORE) * 100)
}

// Custom label for data points - Updated to show 2 decimal places
const CustomizedLabel = (props) => {
  const { x, y, value } = props
  if (!value) return null

  const formattedValue = Number.parseFloat(value).toFixed(2) // Changed to 2 decimal places

  return (
    <text x={x} y={y - 10} fill="var(--lms-chart-label)" fontSize={11} fontWeight="bold" textAnchor="middle">
      {formattedValue}
    </text>
  )
}

// Replace the YearlyTrendTooltip component with this simpler version
const YearlyTrendTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const score = payload[0].value ? formatScore(payload[0].value) : "N/A" // Using formatScore
    const scoreColor = score !== "N/A" ? getScoreColor(score) : "gray"
    const departmentCount = payload[0].payload.department_count || 0
    const percentToTarget = calculatePercentageToTarget(score)

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
        <Text fw={700}>{MONTH_NAMES[label]}</Text>
        <Group spacing="xs">
          <Text size="sm">Average Score:</Text>
          <Text fw={700} style={{ color: scoreColor }}>
            {score}
          </Text>
        </Group>
        <Group spacing="xs" mt="xs">
          <Text size="sm">% to Target:</Text>
          <Text fw={700} style={{ color: percentToTarget >= 100 ? "green" : "orange" }}>
            {percentToTarget}%
          </Text>
        </Group>
        <Text size="xs" color="dimmed" mt="xs">
          Based on {departmentCount} {departmentCount === 1 ? "department" : "departments"}
        </Text>
      </Paper>
    )
  }
  return null
}

// Custom tooltip for monthly rankings chart
const RankingTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const formattedScore = formatScore(data.final_score) // Using formatScore
    const percentToTarget = calculatePercentageToTarget(data.final_score)

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
        <Text fw={700}>
          #{data.rank} - {data.department_name}
        </Text>
        <Group spacing="xs">
          <Text size="sm">Score:</Text>
          <Badge color={getScoreColor(data.final_score)}>{formattedScore}</Badge>
        </Group>
        <Group spacing="xs" mt="xs">
          <Text size="sm">% to Target:</Text>
          <Badge color={percentToTarget >= 100 ? "green" : "orange"}>{percentToTarget}%</Badge>
        </Group>
        <Divider my="xs" />
        <Stack spacing="xs">
          <Group spacing="xs">
            <Text size="xs">Sort:</Text>
            <Badge size="sm" color={getScoreColor(data.scores.sort)}>
              {formatScore(data.scores.sort)}
            </Badge>
          </Group>
          <Group spacing="xs">
            <Text size="xs">Set in Order:</Text>
            <Badge size="sm" color={getScoreColor(data.scores.set_in_order)}>
              {formatScore(data.scores.set_in_order)}
            </Badge>
          </Group>
          <Group spacing="xs">
            <Text size="xs">Shine:</Text>
            <Badge size="sm" color={getScoreColor(data.scores.shine)}>
              {formatScore(data.scores.shine)}
            </Badge>
          </Group>
          <Group spacing="xs">
            <Text size="xs">Standardize:</Text>
            <Badge size="sm" color={getScoreColor(data.scores.standardize)}>
              {formatScore(data.scores.standardize)}
            </Badge>
          </Group>
          <Group spacing="xs">
            <Text size="xs">Sustain:</Text>
            <Badge size="sm" color={getScoreColor(data.scores.sustain)}>
              {formatScore(data.scores.sustain)}
            </Badge>
          </Group>
          <Group spacing="xs">
            <Text size="xs">Safety:</Text>
            <Badge size="sm" color={getScoreColor(data.scores.safety)}>
              {formatScore(data.scores.safety)}
            </Badge>
          </Group>
        </Stack>
      </Paper>
    )
  }
  return null
}

export default function AdvancedDashboard() {
  const tc = useThemeColors()
  // State for yearly trends
  const [yearlyTrendLoading, setYearlyTrendLoading] = useState(true)
  const [yearlyTrendData, setYearlyTrendData] = useState([])
  const [yearlyTrendFilters, setYearlyTrendFilters] = useState({
    year: new Date().getFullYear(),
    departmentType: "production",
  })

  // State for monthly rankings
  const [monthlyRankingLoading, setMonthlyRankingLoading] = useState(true)
  const [monthlyRankingData, setMonthlyRankingData] = useState([])
  const [monthlyRankingFilters, setMonthlyRankingFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    departmentType: "production",
  })



  // Generate year options for dropdowns
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: (currentYear - 2 + i).toString(),
    label: (currentYear - 2 + i).toString(),
  }))

  // Generate month options for dropdown
  const monthOptions = MONTH_NAMES.map((month, index) => ({
    value: (index + 1).toString(),
    label: month,
  }))

  // Update the fetchYearlyTrends function to handle the new data structure
  const fetchYearlyTrends = async () => {
    setYearlyTrendLoading(true)
    try {
      const response = await api.get("/advanced-dashboard/yearly-trends", {
        params: yearlyTrendFilters,
      })

      setYearlyTrendData(response.data)
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch yearly trend data",
        color: "red",
      })
    } finally {
      setYearlyTrendLoading(false)
    }
  }

  // Fetch monthly ranking data
  const fetchMonthlyRankings = async () => {
    setMonthlyRankingLoading(true)
    try {
      const response = await api.get("/advanced-dashboard/monthly-rankings", {
        params: monthlyRankingFilters,
      })

      setMonthlyRankingData(response.data.rankings || [])
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch monthly ranking data",
        color: "red",
      })
    } finally {
      setMonthlyRankingLoading(false)
    }
  }



  // Fetch data when filters change
  useEffect(() => {
    fetchYearlyTrends()
  }, [yearlyTrendFilters])

  useEffect(() => {
    fetchMonthlyRankings()
  }, [monthlyRankingFilters])



  // Calculate the yearly average score - Updated to use formatScore
  const calculateYearlyAverage = () => {
    if (!yearlyTrendData.data || yearlyTrendData.data.length === 0) return "N/A"

    let totalScore = 0
    let count = 0

    yearlyTrendData.data.forEach((monthData) => {
      if (monthData.score !== null) {
        totalScore += Number.parseFloat(monthData.score)
        count++
      }
    })

    return count > 0 ? formatScore(totalScore / count) : "N/A"
  }

  // Get current score from the trend data - Updated to use formatScore
  const getCurrentScore = () => {
    if (!yearlyTrendData.data || yearlyTrendData.data.length === 0) return "N/A"

    const validScores = yearlyTrendData.data.filter((item) => item.score !== null)
    return validScores.length > 0 ? formatScore(validScores[validScores.length - 1].score) : "N/A"
  }

  return (
    <Card shadow="sm" padding="xl" radius="md" withBorder>
      <Group justify="space-between" mb="xl">
        <Group>
          <ThemeIcon size={42} radius="md" color="violet">
            <IconChartBar size={24} />
          </ThemeIcon>
          <Title>Advanced 6S Dashboard</Title>
        </Group>
        <Badge size="lg" color="violet" variant="filled" p="md">
          Comprehensive Audit Analysis
        </Badge>
      </Group>

      <Grid gutter="xl">
        {/* Left Side - Yearly Trend */}
        <Grid.Col span={6}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Group position="apart" mb="md">
              <Group>
                <ThemeIcon size={36} radius="md" color="blue">
                  <IconChartLine size={20} />
                </ThemeIcon>
                <Title order={3}>Yearly Trend Analysis</Title>
              </Group>
              <Badge size="lg" color="blue">
                {yearlyTrendFilters.year}
              </Badge>
            </Group>

            {/* Filters */}
            <Paper withBorder p="md" radius="md" mb="xl" bg="rgba(0,0,0,0.03)">
              <Group mb="md">
                <ThemeIcon size="md" radius="md" color="gray" variant="light">
                  <IconFilter size={16} />
                </ThemeIcon>
                <Title order={5}>Filters</Title>
              </Group>

              <Grid>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Year"
                    value={yearlyTrendFilters.year}
                    onChange={(value) => setYearlyTrendFilters((prev) => ({ ...prev, year: value }))}
                    min={2020}
                    max={2030}
                    size="md"
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Tabs
                    value={yearlyTrendFilters.departmentType}
                    onChange={(value) => setYearlyTrendFilters((prev) => ({ ...prev, departmentType: value }))}
                    variant="pills"
                    radius="md"
                  >
                    <Tabs.List grow>
                      <Tabs.Tab
                        value="production"
                        leftSection={<IconBuildingFactory2 size={16} />}
                        color="blue"
                        fw={500}
                      >
                        Production
                      </Tabs.Tab>
                      <Tabs.Tab
                        value="non-production"
                        leftSection={<IconBuildingSkyscraper size={16} />}
                        color="teal"
                        fw={500}
                      >
                        Non-Production
                      </Tabs.Tab>
                    </Tabs.List>
                  </Tabs>
                </Grid.Col>
              </Grid>
            </Paper>

            {/* Chart */}
            {yearlyTrendLoading ? (
              <Center style={{ height: 400 }}>
                <Loader size="xl" variant="bars" />
              </Center>
            ) : yearlyTrendData.data && yearlyTrendData.data.length > 0 ? (
              <>
                <Paper p="md" withBorder radius="md" mb="md">
                  <Grid>
                    <Grid.Col span={4}>
                      <Stack spacing={0}>
                        <Text size="sm" color="dimmed">
                          Average Score
                        </Text>
                        <Badge size="xl" color={getScoreColor(calculateYearlyAverage())} mt={4}>
                          {calculateYearlyAverage()}
                        </Badge>
                      </Stack>
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <Stack spacing={0}>
                        <Text size="sm" color="dimmed">
                          % to Target
                        </Text>
                        {(() => {
                          const averageScore = calculateYearlyAverage()
                          const percentToTarget = calculatePercentageToTarget(averageScore)

                          return (
                            <Stack spacing={5} mt={4}>
                              <Group position="apart">
                                <Badge size="lg" color={percentToTarget >= 100 ? "green" : "orange"}>
                                  {percentToTarget}%
                                </Badge>
                                <Group spacing={4}>
                                  <IconTarget size={16} color="#e74c3c" />
                                  <Text size="sm" fw={500} color="#e74c3c">
                                    {formatScore(TARGET_SCORE)}
                                  </Text>
                                </Group>
                              </Group>
                              <Progress
                                value={percentToTarget}
                                color={percentToTarget >= 100 ? "green" : "orange"}
                                size="sm"
                                radius="xl"
                              />
                            </Stack>
                          )
                        })()}
                      </Stack>
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <Stack spacing={0}>
                        <Text size="sm" color="dimmed">
                          Trend
                        </Text>
                        {(() => {
                          const validScores = yearlyTrendData.data
                            .filter((item) => item.score !== null)
                            .map((item) => Number(item.score))

                          if (validScores.length < 2)
                            return (
                              <Badge size="xl" color="gray" mt={4}>
                                N/A
                              </Badge>
                            )

                          const firstScore = validScores[0]
                          const lastScore = validScores[validScores.length - 1]
                          const percentChange = (((lastScore - firstScore) / firstScore) * 100).toFixed(1)
                          const isPositive = percentChange >= 0

                          return (
                            <Group spacing={4} mt={4}>
                              <Badge size="xl" color={isPositive ? "green" : "red"}>
                                {isPositive ? "+" : ""}
                                {percentChange}%
                              </Badge>
                              {isPositive ? (
                                <IconTrendingUp size={20} color="green" />
                              ) : (
                                <IconTrendingDown size={20} color="red" />
                              )}
                            </Group>
                          )
                        })()}
                      </Stack>
                    </Grid.Col>
                  </Grid>
                </Paper>

                <div style={{ height: 400, marginBottom: "-20px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={yearlyTrendData.data} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={tc.chartGrid} />
                      <XAxis
                        dataKey="month"
                        tickFormatter={(value) => MONTH_NAMES[value]}
                        tick={{ fill: tc.chartLabel, fontSize: 12 }}
                        stroke={tc.chartAxis}
                        height={70}
                      />
                      <YAxis
                        domain={[2, 4]}
                        ticks={[2, 2.5, 3, 3.5, 4]}
                        label={{ value: "Score", angle: -90, position: "insideLeft", fill: tc.chartLabel }}
                        tick={{ fill: tc.chartLabel, fontSize: 12 }}
                        stroke={tc.chartAxis}
                      />
                      <Tooltip content={<YearlyTrendTooltip />} />

                      {/* Reference lines for score thresholds */}
                      <ReferenceLine y={3.5} stroke="#2ecc71" strokeDasharray="3 3" />
                      <ReferenceLine y={2.5} stroke="#3498db" strokeDasharray="3 3" />

                      {/* Target line at score 3 */}
                      <ReferenceLine y={3} stroke="#e74c3c" strokeWidth={2}>
                        <Label
                          value={`Target (${formatScore(TARGET_SCORE)})`}
                          position="right"
                          fill="#e74c3c"
                          fontSize={12}
                          fontWeight="bold"
                        />
                      </ReferenceLine>

                      <Line
                        type="monotone"
                        dataKey="score"
                        name={`${yearlyTrendFilters.departmentType === "production" ? "Production" : "Non-Production"} Average`}
                        stroke={yearlyTrendFilters.departmentType === "production" ? "#3498db" : "#16a085"}
                        activeDot={{ r: 8 }}
                        strokeWidth={3}
                        connectNulls={true}
                        dot={{ strokeWidth: 2, r: 6, fill: "white" }}
                        label={<CustomizedLabel />}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <Group position="apart" mt={0}>
                  <Group spacing="xs">
                    <ThemeIcon size="xs" radius="xl" color="red">
                      <IconTarget size={10} />
                    </ThemeIcon>
                    <Text size="sm" color="dimmed">
                      Target: {formatScore(TARGET_SCORE)}
                    </Text>
                  </Group>
                  <Text size="sm" color="dimmed">
                    Score: <Badge color="yellow">2-2.5</Badge> <Badge color="blue">2.5-3.5</Badge>{" "}
                    <Badge color="green">{">3.5"}</Badge>
                  </Text>
                </Group>

                <Text size="sm" color="dimmed" align="right" mt={5}>
                  {yearlyTrendFilters.departmentType === "production" ? "Production" : "Non-Production"} Departments
                </Text>
              </>
            ) : (
              <Center style={{ height: 400 }}>
                <Stack align="center" spacing="md">
                  <IconChartLine size={48} color="#aaa" />
                  <Text color="dimmed" size="xl" fw={500}>
                    No trend data available
                  </Text>
                  <Text color="dimmed" size="sm">
                    Try selecting a different year or department type
                  </Text>
                </Stack>
              </Center>
            )}
          </Card>
        </Grid.Col>

        {/* Right Side - Monthly Rankings */}
        <Grid.Col span={6}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Group position="apart" mb="md">
              <Group>
                <ThemeIcon size={36} radius="md" color="teal">
                  <IconTrendingUp size={20} />
                </ThemeIcon>
                <Title order={3}>Monthly Rankings</Title>
              </Group>
              <Badge size="lg" color="teal">
                {MONTH_NAMES[monthlyRankingFilters.month - 1]} {monthlyRankingFilters.year}
              </Badge>
            </Group>

            {/* Filters */}
            <Paper withBorder p="md" radius="md" mb="xl" bg="rgba(0,0,0,0.03)">
              <Group mb="md">
                <ThemeIcon size="md" radius="md" color="gray" variant="light">
                  <IconFilter size={16} />
                </ThemeIcon>
                <Title order={5}>Filters</Title>
              </Group>

              <Grid>
                <Grid.Col span={4}>
                  <Select
                    label="Month"
                    data={monthOptions}
                    value={monthlyRankingFilters.month.toString()}
                    onChange={(value) =>
                      setMonthlyRankingFilters((prev) => ({ ...prev, month: Number.parseInt(value) }))
                    }
                    size="md"
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <NumberInput
                    label="Year"
                    value={monthlyRankingFilters.year}
                    onChange={(value) => setMonthlyRankingFilters((prev) => ({ ...prev, year: value }))}
                    min={2020}
                    max={2030}
                    size="md"
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <Tabs
                    value={monthlyRankingFilters.departmentType}
                    onChange={(value) => setMonthlyRankingFilters((prev) => ({ ...prev, departmentType: value }))}
                    variant="pills"
                    radius="md"
                  >
                    <Tabs.List grow>
                      <Tabs.Tab
                        value="production"
                        leftSection={<IconBuildingFactory2 size={16} />}
                        color="blue"
                        fw={500}
                      >
                        Production
                      </Tabs.Tab>
                      <Tabs.Tab
                        value="non-production"
                        leftSection={<IconBuildingSkyscraper size={16} />}
                        color="teal"
                        fw={500}
                      >
                        Non-Production
                      </Tabs.Tab>
                    </Tabs.List>
                  </Tabs>
                </Grid.Col>
              </Grid>
            </Paper>

            {/* Chart */}
            {monthlyRankingLoading ? (
              <Center style={{ height: 400 }}>
                <Loader size="xl" variant="bars" />
              </Center>
            ) : monthlyRankingData && monthlyRankingData.length > 0 ? (
              <>
                <Paper p="md" withBorder radius="md" mb="md">
                  <Grid>
                    <Grid.Col span={4}>
                      <Stack spacing={0}>
                        <Text size="sm" color="dimmed">
                          Average Score
                        </Text>
                        {(() => {
                          if (!monthlyRankingData || monthlyRankingData.length === 0) {
                            return (
                              <Badge size="xl" color="gray" mt={4}>
                                N/A
                              </Badge>
                            )
                          }

                          const avgScore =
                            monthlyRankingData.reduce((sum, dept) => sum + Number(dept.final_score), 0) /
                            monthlyRankingData.length

                          return (
                            <Badge size="xl" color={getScoreColor(avgScore)} mt={4}>
                              {formatScore(avgScore)}
                            </Badge>
                          )
                        })()}
                      </Stack>
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <Stack spacing={0}>
                        <Text size="sm" color="dimmed">
                          % to Target
                        </Text>
                        {(() => {
                          if (!monthlyRankingData || monthlyRankingData.length === 0) {
                            return (
                              <Badge size="xl" color="gray" mt={4}>
                                N/A
                              </Badge>
                            )
                          }

                          const avgScore =
                            monthlyRankingData.reduce((sum, dept) => sum + Number(dept.final_score), 0) /
                            monthlyRankingData.length

                          const percentToTarget = calculatePercentageToTarget(avgScore)

                          return (
                            <Stack spacing={5} mt={4}>
                              <Group position="apart">
                                <Badge size="lg" color={percentToTarget >= 100 ? "green" : "orange"}>
                                  {percentToTarget}%
                                </Badge>
                                <Group spacing={4}>
                                  <IconTarget size={16} color="#e74c3c" />
                                  <Text size="sm" fw={500} color="#e74c3c">
                                    {formatScore(TARGET_SCORE)}
                                  </Text>
                                </Group>
                              </Group>
                              <Progress
                                value={percentToTarget}
                                color={percentToTarget >= 100 ? "green" : "orange"}
                                size="sm"
                                radius="xl"
                              />
                            </Stack>
                          )
                        })()}
                      </Stack>
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <Stack spacing={0}>
                        <Text size="sm" color="dimmed">
                          Top Department
                        </Text>
                        <Group mt={4}>
                          <Text fw={700} size="sm">
                            {monthlyRankingData[0]?.department_name || "N/A"}
                          </Text>
                          <Badge size="md" color={getScoreColor(monthlyRankingData[0]?.final_score || 0)}>
                            {monthlyRankingData[0] ? formatScore(monthlyRankingData[0].final_score) : "N/A"}
                          </Badge>
                        </Group>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                </Paper>

                <div style={{ height: 400, marginBottom: "-20px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyRankingData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={tc.chartGrid} />
                      <XAxis
                        dataKey="department_name"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        tick={{ fill: tc.chartLabel, fontSize: 12 }}
                        stroke={tc.chartAxis}
                      />
                      <YAxis
                        domain={[2, 4]}
                        ticks={[2, 2.5, 3, 3.5, 4]}
                        label={{ value: "Score", angle: -90, position: "insideLeft", fill: tc.chartLabel }}
                        tick={{ fill: tc.chartLabel, fontSize: 12 }}
                        stroke={tc.chartAxis}
                      />
                      <Tooltip content={<RankingTooltip />} />
                      <ReferenceLine y={3.5} stroke="#2ecc71" strokeDasharray="3 3" />
                      <ReferenceLine y={2.5} stroke="#3498db" strokeDasharray="3 3" />

                      {/* Target line at score 3 */}
                      <ReferenceLine y={3} stroke="#e74c3c" strokeWidth={2}>
                        <Label
                          value={`Target (${formatScore(TARGET_SCORE)})`}
                          position="right"
                          fill="#e74c3c"
                          fontSize={12}
                          fontWeight="bold"
                        />
                      </ReferenceLine>

                      <Bar
                        dataKey="final_score"
                        name="Score"
                        fill="#3498db"
                        radius={[4, 4, 0, 0]}
                        barSize={30}
                        label={{
                          position: "top",
                          fill: "var(--lms-chart-label)",
                          fontSize: 12,
                          formatter: (value) => formatScore(value), // Format bar labels
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <Group position="apart" mt={0}>
                  <Group spacing="xs">
                    <ThemeIcon size="xs" radius="xl" color="red">
                      <IconTarget size={10} />
                    </ThemeIcon>
                    <Text size="sm" color="dimmed">
                      Target: {formatScore(TARGET_SCORE)}
                    </Text>
                  </Group>
                  <Text size="sm" color="dimmed">
                    Score: <Badge color="yellow">2-2.5</Badge> <Badge color="blue">2.5-3.5</Badge>{" "}
                    <Badge color="green">{">3.5"}</Badge>
                  </Text>
                </Group>

                <Text size="sm" color="dimmed" align="right" mt={5}>
                  Showing {monthlyRankingData.length} departments
                </Text>
              </>
            ) : (
              <Center style={{ height: 400 }}>
                <Stack align="center" spacing="md">
                  <IconTrendingUp size={48} color="#aaa" />
                  <Text color="dimmed" size="xl" fw={500}>
                    No ranking data available
                  </Text>
                  <Text color="dimmed" size="sm">
                    Try selecting a different month or department type
                  </Text>
                </Stack>
              </Center>
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </Card>
  )
}
