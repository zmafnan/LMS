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
  TextInput,
  Select,
  Pagination,
  ActionIcon,
  Tooltip,
  ThemeIcon,
} from "@mantine/core"
import { IconEye, IconSearch, IconFilter, IconDatabase, IconArrowLeft, IconBookmark } from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"
import { notifications } from "@mantine/notifications"
import api from "../../services/api"

export default function KaizenMasterData() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState([])
  const [departments, setDepartments] = useState([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  })
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    page: 1,
  })

  useEffect(() => {
    fetchMasterData()
  }, [filters])

  const fetchMasterData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (filters.search) params.append("search", filters.search)
      if (filters.department) params.append("department", filters.department)
      params.append("page", filters.page.toString())
      params.append("limit", "10")

      const response = await api.get(`/submissions/master-data?${params.toString()}`)
      setSubmissions(response.data.submissions)
      setPagination(response.data.pagination)
      setDepartments(response.data.departments)
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch master data",
        color: "red",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value) => {
    setFilters({ ...filters, search: value, page: 1 })
  }

  const handleDepartmentFilter = (value) => {
    setFilters({ ...filters, department: value, page: 1 })
  }

  const handlePageChange = (page) => {
    setFilters({ ...filters, page })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Container size="xl" py="xl">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group position="apart" mb="xl">
          <Group>
            <ThemeIcon size={40} radius="md" color="green">
              <IconDatabase size={24} />
            </ThemeIcon>
            <div>
              <Title order={2}>Kaizen Master Data</Title>
              <Text c="dimmed">Browse successful Kaizen implementations for inspiration</Text>
            </div>
          </Group>

          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate("/kaizen/submission")}
          >
            Back to Menu
          </Button>
        </Group>

        <Paper p="md" withBorder radius="md" mb="xl" bg="green.0">
          <Group mb="md">
            <IconFilter size={20} />
            <Text fw={500} size="lg">
              Search & Filter
            </Text>
          </Group>

          <Group grow>
            <TextInput
              placeholder="Search by title, Suggested By, department, or benefits..."
              leftSection={<IconSearch size={16} />}
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
            />

            <Select
              placeholder="Filter by department"
              clearable
              data={departments.map((dept) => ({ value: dept, label: dept }))}
              value={filters.department}
              onChange={handleDepartmentFilter}
            />
          </Group>

          <Text size="sm" c="dimmed" mt="md">
            <IconBookmark size={16} style={{ marginRight: 4, verticalAlign: "middle" }} />
            Showing only Pass OK Kaizen submissions that can be implemented in your department
          </Text>
        </Paper>

        {loading ? (
          <Center style={{ height: "400px" }}>
            <Loader size="xl" />
          </Center>
        ) : submissions.length === 0 ? (
          <Center style={{ height: "400px" }}>
            <Stack align="center">
              <IconDatabase size={48} color="#868e96" />
              <Text size="xl" fw={500}>
                No Kaizen found
              </Text>
              <Text c="dimmed">Try adjusting your search or filter criteria</Text>
            </Stack>
          </Center>
        ) : (
          <Stack spacing="md">
            <Paper p="md" withBorder radius="md">
              <Group position="apart" mb="md">
                <Text fw={500}>Found {pagination.total} successful Kaizen implementations</Text>
                <Badge color="green" size="lg">
                  Pass OK Only
                </Badge>
              </Group>

              <Table striped highlightOnHover withBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ textAlign: "center" }}>Kaizen Title</Table.Th>
                    <Table.Th style={{ textAlign: "center" }}>Suggested By</Table.Th>
                    <Table.Th style={{ textAlign: "center" }}>Department</Table.Th>
                    <Table.Th style={{ textAlign: "center" }}>Date</Table.Th>
                    <Table.Th style={{ textAlign: "center" }}>Type</Table.Th>
                    <Table.Th style={{ textAlign: "center" }}>Status</Table.Th>
                    <Table.Th style={{ textAlign: "center" }}>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {submissions.map((submission) => (
                    <Table.Tr key={submission.id}>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Text fw={500} lineClamp={2}>
                          {submission.kaizen_title}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>{submission.pic_name}</Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>{submission.department}</Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>{formatDate(submission.submission_date)}</Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Badge>{submission.kaizen_type}</Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Group spacing="xs" position="center">
                          <Badge color="green">Pass OK</Badge>
                          {submission.is_implemented && <Badge color="blue">Implemented</Badge>}
                        </Group>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Tooltip label="View Details">
                          <ActionIcon
                            color="green"
                            variant="filled"
                            onClick={() => navigate(`/kaizen/master-data/${submission.id}`)}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>

            {pagination.totalPages > 1 && (
              <Center>
                <Pagination
                  total={pagination.totalPages}
                  value={pagination.page}
                  onChange={handlePageChange}
                  size="md"
                />
              </Center>
            )}
          </Stack>
        )}
      </Card>
    </Container>
  )
}
