"use client"

import { useState, useEffect } from "react"
import {
  Card,
  Title,
  Text,
  Group,
  Badge,
  Paper,
  Stack,
  Button,
  Center,
  Loader,
  Container,
  Table,
  Avatar,
  ThemeIcon,
  Select,
  Grid,
} from "@mantine/core"
import { IconTrophy, IconMedal, IconUsers, IconArrowLeft, IconFilter } from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"
import { notifications } from "@mantine/notifications"
import api from "../../services/api"

export default function KaizenRanking() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState("monthly") // Changed from "all-time" to "monthly"
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [rankings, setRankings] = useState([])
  const [stats, setStats] = useState({
    total_participants: 0,
  })

  // Generate month options
  const months = [
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ]

  // Generate year options (last 5 years)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString(),
  }))

  useEffect(() => {
    fetchRankings()
  }, [filterType, selectedMonth, selectedYear])

  const fetchRankings = async () => {
    try {
      setLoading(true)

      // Build query parameters based on filter type
      let queryParams = `timeframe=${filterType}`

      if (filterType === "specific") {
        queryParams += `&month=${Number.parseInt(selectedMonth) + 1}&year=${selectedYear}`
      } else if (filterType === "year-only") {
        queryParams += `&year=${selectedYear}`
      }

      const response = await api.get(`/rankings?${queryParams}`)
      setRankings(response.data.rankings)
      setStats({
        total_participants: response.data.total_participants,
      })
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

  const getTimeframeLabel = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    switch (filterType) {
      case "monthly":
        return `${months[currentMonth].label} ${currentYear}`
      case "yearly":
        return `Tahun ${selectedYear || currentYear}`
      case "specific":
        return `${months.find((m) => m.value === selectedMonth)?.label} ${selectedYear}`
      case "year-only":
        return `Tahun ${selectedYear}`
      default:
        return "Semua Waktu"
    }
  }

  const getMedalColor = (rank) => {
    switch (rank) {
      case 1:
        return "yellow" // Gold
      case 2:
        return "gray" // Silver
      case 3:
        return "orange" // Bronze
      default:
        return "blue"
    }
  }

  const renderRankingTable = () => {
    if (rankings.length === 0) {
      return (
        <Center p="xl">
          <Text c="dimmed">No ranking data available for this timeframe</Text>
        </Center>
      )
    }

    return (
      <Table striped highlightOnHover withBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ textAlign: "center" }}>Rank</Table.Th>
            <Table.Th style={{ textAlign: "center" }}>Name</Table.Th>
            <Table.Th style={{ textAlign: "center" }}>Submissions</Table.Th>
            <Table.Th style={{ textAlign: "center" }}>Pass Submissions</Table.Th>
            <Table.Th style={{ textAlign: "center" }}>Point Submissions</Table.Th>
            <Table.Th style={{ textAlign: "center" }}>Pass Reward Point</Table.Th>
            <Table.Th style={{ textAlign: "center" }}>Total Points</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rankings.map((item, index) => (
            <Table.Tr key={index}>
              <Table.Td style={{ textAlign: "center" }}>
                <Group spacing="xs" position="center">
                  {item.rank <= 3 ? (
                    <ThemeIcon size="sm" radius="xl" color={getMedalColor(item.rank)}>
                      {item.rank === 1 ? <IconTrophy size={12} /> : <IconMedal size={12} />}
                    </ThemeIcon>
                  ) : null}
                  <Text fw={item.rank <= 3 ? 700 : 400}>{item.rank}</Text>
                </Group>
              </Table.Td>
              <Table.Td style={{ textAlign: "center" }}>
                <Group spacing="sm" position="center">
                  <Avatar color="blue" radius="xl">
                    {item.pic_name.charAt(0)}
                  </Avatar>
                  <Text fw={500}>{item.pic_name}</Text>
                </Group>
              </Table.Td>
              <Table.Td style={{ textAlign: "center" }}>{item.total_submissions}</Table.Td>
              <Table.Td style={{ textAlign: "center" }}>{item.passed_submissions}</Table.Td>
              <Table.Td style={{ textAlign: "center" }}>{item.total_submissions}</Table.Td>
              <Table.Td style={{ textAlign: "center" }}>{item.additional_points || 0}</Table.Td>
              <Table.Td style={{ textAlign: "center" }}>
                <Text fw={700}>{item.points}</Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    )
  }

  return (
    <Container size="lg" py="xl">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group position="apart" mb="xl">
          <Group>
            <ThemeIcon size={40} radius="md" color="blue">
              <IconTrophy size={24} />
            </ThemeIcon>
            <Title order={2}>Kaizen Leaderboard</Title>
          </Group>

          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate("/kaizen/submission")}
          >
            Back to Menu
          </Button>
        </Group>

        <Paper p="md" withBorder radius="md" mb="xl" bg="blue.0">
          <Group position="apart" mb="md">
            <Group>
              <IconFilter size={20} />
              <Text fw={500} size="lg">
                Filter Rankings
              </Text>
            </Group>

            <Badge size="lg" color="blue">
              <Group spacing="xs">
                <IconUsers size={16} />
                <Text>{stats.total_participants} Participants</Text>
              </Group>
            </Badge>
          </Group>

          <Grid align="flex-end">
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                label="Periode Waktu"
                value={filterType}
                onChange={setFilterType}
                data={[
                  { value: "monthly", label: "Bulan Ini" }, // Moved to top as default
                  { value: "yearly", label: "Tahun Ini" },
                  { value: "all-time", label: "Semua Waktu" },
                  { value: "year-only", label: "Tahun Tertentu" },
                  { value: "specific", label: "Bulan & Tahun Tertentu" },
                ]}
              />
            </Grid.Col>

            {(filterType === "specific" || filterType === "year-only") && (
              <>
                {filterType === "specific" && (
                  <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Select label="Bulan" value={selectedMonth} onChange={setSelectedMonth} data={months} />
                  </Grid.Col>
                )}
                <Grid.Col span={{ base: 12, sm: 6, md: filterType === "year-only" ? 6 : 3 }}>
                  <Select label="Tahun" value={selectedYear} onChange={setSelectedYear} data={years} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: filterType === "year-only" ? 6 : 3 }}>
                  <Button onClick={fetchRankings} fullWidth leftSection={<IconFilter size={16} />}>
                    Terapkan Filter
                  </Button>
                </Grid.Col>
              </>
            )}
          </Grid>
        </Paper>

        <Paper p="md" withBorder radius="md" mb="xl">
          <Title order={3} mb="md">
            Rankings - {getTimeframeLabel()}
          </Title>

          {loading ? (
            <Center style={{ height: "300px" }}>
              <Loader size="xl" />
            </Center>
          ) : (
            <Stack spacing="md">
              {renderRankingTable()}

              <Paper p="md" withBorder radius="md" bg="blue.0">
                <Text size="sm" fw={500}>
                  <strong>Point System:</strong> 1 point for each submission + Pass points awarded by admin
                </Text>
                <Text size="sm" c="dimmed" mt="xs">
                  The leaderboard recognizes the most active contributors to our continuous improvement initiatives.
                </Text>
              </Paper>
            </Stack>
          )}
        </Paper>
      </Card>
    </Container>
  )
}
