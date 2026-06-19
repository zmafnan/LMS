"use client"

import { useState, useEffect } from "react"
import {
  Card,
  Title,
  Text,
  Group,
  Select,
  Table,
  NumberInput,
  Badge,
  Stack,
  Grid,
  Paper,
  ThemeIcon,
  Divider,
  ScrollArea,
  Center,
  Loader,
} from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { MonthPickerInput } from "@mantine/dates"
import {
  IconFilter,
  IconCalendarStats,
  IconBuildingFactory2,
  IconBuildingSkyscraper,
  IconMedal,
  IconAward,
} from "@tabler/icons-react"

import api from "../../services/api"

// Helper function to get medal icon based on rank
const getMedalIcon = (rank) => {
  if (rank === 1) return <IconMedal size={22} color="#FFD700" /> // Gold
  if (rank === 2) return <IconMedal size={22} color="#C0C0C0" /> // Silver
  if (rank === 3) return <IconMedal size={22} color="#CD7F32" /> // Bronze
  return null
}

// Helper function to get score color
const getScoreColor = (score) => {
  if (score >= 3.5) return "green"
  if (score >= 2.5) return "blue"
  if (score >= 1.5) return "yellow"
  return "red"
}

export default function Dashboard6S() {
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState("current_month")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [productionRankings, setProductionRankings] = useState([])
  const [nonProductionRankings, setNonProductionRankings] = useState([])

  const periodOptions = [
    { value: "current_month", label: "Bulan Ini" },
    { value: "specific_month", label: "Pilih Bulan" },
    { value: "yearly", label: "Tahunan" },
    { value: "all_time", label: "Semua Waktu" },
  ]

  const fetchRankings = async () => {
    setLoading(true)
    try {
      const params = { period }

      if (period === "specific_month") {
        const parsedDate = new Date(selectedDate)
        const dateObj = isNaN(parsedDate.getTime()) ? new Date() : parsedDate
        params.month = dateObj.getMonth() + 1
        params.year = dateObj.getFullYear()
      } else if (period === "yearly") {
        params.year = selectedYear
      }

      const response = await api.get("/dashboard/rankings", { params })
      setProductionRankings(response.data.productionRankings)
      setNonProductionRankings(response.data.nonProductionRankings)
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch rankings",
        color: "red",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRankings()
  }, [period, selectedDate, selectedYear])

  // Get period display text
  const getPeriodDisplayText = () => {
    if (period === "current_month") {
      return `Rankings for ${new Date().toLocaleString("default", { month: "long", year: "numeric" })}`
    } else if (period === "specific_month") {
      const parsedDate = new Date(selectedDate)
      const dateObj = isNaN(parsedDate.getTime()) ? new Date() : parsedDate
      return `Rankings for ${dateObj.toLocaleString("default", { month: "long", year: "numeric" })}`
    } else if (period === "yearly") {
      return `Rankings for year ${selectedYear}`
    } else {
      return "Rankings Sepanjang Waktu"
    }
  }

  const RankingTable = ({ data, type }) => (
    <Card shadow="sm" p="lg" radius="md" withBorder h="100%">
      <Group position="apart" mb="md">
        <Group>
          <ThemeIcon size={40} radius="md" color={type === "production" ? "blue" : "teal"}>
            {type === "production" ? <IconBuildingFactory2 size={24} /> : <IconBuildingSkyscraper size={24} />}
          </ThemeIcon>
          <Title order={3}>
            {type === "production" ? "Ranking Departemen Produksi" : "Ranking Departemen Non-Produksi"}
          </Title>
        </Group>
        <Badge size="lg" variant="outline">
          {data.length} Departemen
        </Badge>
      </Group>

      <ScrollArea h={400}>
        <Table highlightOnHover withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ textAlign: "center" }}>Rank</Table.Th>
              <Table.Th>Department</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Sort</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Set in Order</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Shine</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Standardize</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Sustain</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Safety</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Final Score</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((item) => (
              <Table.Tr key={item.department_name}>
                <Table.Td style={{ textAlign: "center" }}>
                  <Group position="center" spacing="xs">
                    {getMedalIcon(item.rank)}
                    <Text fw={700} size="lg">
                      {item.rank}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text fw={item.rank <= 3 ? 700 : 400}>{item.department_name}</Text>
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  <Badge color={getScoreColor(item.scores.sort)}>{item.scores.sort}</Badge>
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  <Badge color={getScoreColor(item.scores.set_in_order)}>{item.scores.set_in_order}</Badge>
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  <Badge color={getScoreColor(item.scores.shine)}>{item.scores.shine}</Badge>
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  <Badge color={getScoreColor(item.scores.standardize)}>{item.scores.standardize}</Badge>
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  <Badge color={getScoreColor(item.scores.sustain)}>{item.scores.sustain}</Badge>
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  <Badge color={getScoreColor(item.scores.safety)}>{item.scores.safety}</Badge>
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  <Badge
                    size="lg"
                    color={getScoreColor(item.final_score)}
                    variant={item.rank <= 3 ? "filled" : "light"}
                    p="md"
                    style={{ fontSize: item.rank <= 3 ? 16 : 14 }}
                  >
                    {item.final_score}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Card>
  )

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
            <ThemeIcon size={42} radius="md" color="yellow">
              <IconAward size={24} />
            </ThemeIcon>
            <Title order={2}>Dashboard 6S Audit Rankings</Title>
          </Group>

          <Badge size="lg" color="yellow" variant="filled" p="md">
            {getPeriodDisplayText()}
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
          </Group>

          <Divider my="md" />

          <Grid align="flex-end">
            <Grid.Col span={4}>
              <Select
                label="Filter Periode"
                data={periodOptions}
                value={period}
                onChange={setPeriod}
                icon={<IconCalendarStats size={16} />}
                size="md"
              />
            </Grid.Col>

            {period === "specific_month" && (
              <Grid.Col span={4}>
                <MonthPickerInput
                  label="Pilih Bulan"
                  placeholder="Pick month"
                  value={(() => { const parsed = new Date(selectedDate); return isNaN(parsed.getTime()) ? new Date() : parsed; })()}
                  onChange={setSelectedDate}
                  size="md"
                />
              </Grid.Col>
            )}

            {period === "yearly" && (
              <Grid.Col span={4}>
                <NumberInput
                  label="Tahun"
                  value={selectedYear}
                  onChange={(val) => setSelectedYear(val)}
                  min={2020}
                  max={2100}
                  size="md"
                />
              </Grid.Col>
            )}
          </Grid>
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
        ) : (
          <>
            <Grid gutter="xl">
              <Grid.Col span={6}>
                <RankingTable data={productionRankings} type="production" />
              </Grid.Col>

              <Grid.Col span={6}>
                <RankingTable data={nonProductionRankings} type="non-production" />
              </Grid.Col>
            </Grid>

            <Paper p="md" withBorder radius="md" mt="xl" bg="rgba(0,0,0,0.03)">
              <Group position="apart">
                <Text size="sm" color="dimmed">
                  Skor: <Badge color="red">{"<1.5"}</Badge> <Badge color="yellow">1.5-2.5</Badge>{" "}
                  <Badge color="blue">2.5-3.5</Badge> <Badge color="green">{">3.5"}</Badge>
                </Text>
                <Group>
                  <Text size="sm" fw={500}>
                    Total Departemen Produksi: {productionRankings.length}
                  </Text>
                  <Text size="sm" fw={500}>
                    Total Departemen Non-Produksi: {nonProductionRankings.length}
                  </Text>
                </Group>
              </Group>
            </Paper>
          </>
        )}
      </Card>
    </Stack>
  )
}
