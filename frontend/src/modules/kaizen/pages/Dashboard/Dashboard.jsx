"use client"

import { useState, useEffect } from "react"
import {
  Card,
  Title,
  Text,
  Group,
  Badge,
  Paper,
  Grid,
  ThemeIcon,
  Stack,
  Button,
  Center,
  Loader,
  Table,
  Pagination,
} from "@mantine/core"
import {
  IconClipboardCheck,
  IconChartBar,
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconPlus,
  IconToggleLeft,
  IconToggleRight,
} from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    failed: 0,
    implemented: 0,
    notImplemented: 0,
  })
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await api.get("/submissions")

        // Calculate stats
        const allSubmissions = response.data
        const pending = allSubmissions.filter((s) => s.validation_status === "Pending").length
        const inProgress = allSubmissions.filter((s) => s.validation_status === "On Checking Progress").length
        const completed = allSubmissions.filter((s) => s.validation_status === "Pass OK").length
        const failed = allSubmissions.filter((s) => s.validation_status === "Failed").length
        const implemented = allSubmissions.filter((s) => s.is_implemented === true).length
        const notImplemented = allSubmissions.filter((s) => s.is_implemented === false).length

        setStats({
          total: allSubmissions.length,
          pending,
          inProgress,
          completed,
          failed,
          implemented,
          notImplemented,
        })

        // Sort submissions by date (newest first)
        const sortedSubmissions = [...allSubmissions].sort(
          (a, b) => new Date(b.submission_date) - new Date(a.submission_date),
        )
        setSubmissions(sortedSubmissions)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status) => {
    let color
    switch (status) {
      case "Pending":
        color = "yellow"
        break
      case "On Checking Progress":
        color = "blue"
        break
      case "Pass OK":
        color = "green"
        break
      case "Failed":
        color = "red"
        break
      default:
        color = "gray"
    }
    return <Badge color={color}>{status}</Badge>
  }

  // Calculate pagination
  const totalPages = Math.ceil(submissions.length / itemsPerPage)
  const paginatedSubmissions = submissions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (loading) {
    return (
      <Center style={{ height: "70vh" }}>
        <Loader size="xl" />
      </Center>
    )
  }

  return (
    <Stack spacing="lg">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group position="apart" mb="md">
          <Group>
            <ThemeIcon size={40} radius="md" color="blue">
              <IconChartBar size={24} />
            </ThemeIcon>
            <Title order={2}>Kaizen Dashboard</Title>
          </Group>
          <Button leftSection={<IconPlus size={16} />} onClick={() => navigate("/kaizen/submission/form")}>
            Submit New Kaizen
          </Button>
        </Group>

        <Text c="dimmed" mb="xl">
          Overview of all Kaizen submissions and their current status
        </Text>

        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper p="md" radius="md" withBorder>
              <Group position="apart">
                <div>
                  <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                    Total Submissions
                  </Text>
                  <Title order={3}>{stats.total}</Title>
                </div>
                <ThemeIcon size={48} radius="md" color="blue">
                  <IconClipboardCheck size={24} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 6, md: 2 }}>
            <Paper p="md" radius="md" withBorder>
              <Group position="apart">
                <div>
                  <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                    Pending
                  </Text>
                  <Title order={3}>{stats.pending}</Title>
                </div>
                <ThemeIcon size={48} radius="md" color="yellow">
                  <IconClock size={24} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 6, md: 2 }}>
            <Paper p="md" radius="md" withBorder>
              <Group position="apart">
                <div>
                  <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                    In Progress
                  </Text>
                  <Title order={3}>{stats.inProgress}</Title>
                </div>
                <ThemeIcon size={48} radius="md" color="blue">
                  <IconClock size={24} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 6, md: 2 }}>
            <Paper p="md" radius="md" withBorder>
              <Group position="apart">
                <div>
                  <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                    Completed
                  </Text>
                  <Title order={3}>{stats.completed}</Title>
                </div>
                <ThemeIcon size={48} radius="md" color="green">
                  <IconCheck size={24} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 6, md: 2 }}>
            <Paper p="md" radius="md" withBorder>
              <Group position="apart">
                <div>
                  <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                    Failed
                  </Text>
                  <Title order={3}>{stats.failed}</Title>
                </div>
                <ThemeIcon size={48} radius="md" color="red">
                  <IconAlertCircle size={24} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Implementation Status */}
        <Grid mt="md">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="md" radius="md" withBorder>
              <Group position="apart">
                <div>
                  <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                    Implemented
                  </Text>
                  <Title order={3}>{stats.implemented}</Title>
                </div>
                <ThemeIcon size={48} radius="md" color="green">
                  <IconToggleRight size={24} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="md" radius="md" withBorder>
              <Group position="apart">
                <div>
                  <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                    Not Implemented
                  </Text>
                  <Title order={3}>{stats.notImplemented}</Title>
                </div>
                <ThemeIcon size={48} radius="md" color="gray">
                  <IconToggleLeft size={24} />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Recent Submissions Table with Pagination */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={3} mb="md">
          Recent Submissions
        </Title>

        {submissions.length > 0 ? (
          <>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>No</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Kaizen Title</Table.Th>
                  <Table.Th>Suggested By</Table.Th>
                  <Table.Th>Kaizen Type</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginatedSubmissions.map((submission, index) => (
                  <Table.Tr
                    key={submission.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/kaizen/tracking/${submission.id}`)}
                  >
                    <Table.Td>{(currentPage - 1) * itemsPerPage + index + 1}</Table.Td>
                    <Table.Td>{formatDate(submission.submission_date)}</Table.Td>
                    <Table.Td>{submission.kaizen_title}</Table.Td>
                    <Table.Td>{submission.pic_name}</Table.Td>
                    <Table.Td>{submission.kaizen_type}</Table.Td>
                    <Table.Td>{getStatusBadge(submission.validation_status)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Group position="center" mt="md">
                <Pagination total={totalPages} value={currentPage} onChange={setCurrentPage} withEdges />
              </Group>
            )}
          </>
        ) : (
          <Text c="dimmed" ta="center">
            No submissions found
          </Text>
        )}
      </Card>

      {/* Admin Actions Card */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={3} mb="md">
          Admin Actions
        </Title>
        <Button fullWidth onClick={() => navigate("/kaizen/admin")} variant="light">
          Go to Admin Panel
        </Button>
      </Card>
    </Stack>
  )
}
