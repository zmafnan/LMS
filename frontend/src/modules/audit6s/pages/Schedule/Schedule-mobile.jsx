"use client"

import { useState, useEffect } from "react"
import {
  Group,
  ActionIcon,
  Badge,
  Title,
  Text,
  Stack,
  Paper,
  Divider,
  Container,
  Loader,
  Center,
  TextInput,
  rem,
  Card,
} from "@mantine/core"
import {
  IconFilter,
  IconCalendarEvent,
  IconUser,
  IconUsers,
  IconClock,
  IconSearch,
  IconArrowLeft,
  IconCalendar,
  IconBuilding,
} from "@tabler/icons-react"
import { notifications } from "@mantine/notifications"
import { MonthPickerInput } from "@mantine/dates"
import api from "../../services/api"
import { useNavigate } from "react-router-dom"

export default function ScheduleMobile() {
  const navigate = useNavigate()
  const [schedules, setSchedules] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const [filters, setFilters] = useState({
    month: new Date(),
    department_type: "",
    status: "",
  })

  const getFilterDate = (val) => {
    if (!val) return new Date()
    const d = new Date(val)
    return isNaN(d.getTime()) ? new Date() : d
  }

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch schedules with filters
      const filterDate = getFilterDate(filters.month)
      const month = filterDate.getMonth() + 1
      const year = filterDate.getFullYear()

      let url = `/schedules?month=${month}&year=${year}`
      if (filters.department_type) url += `&department_type=${filters.department_type}`
      if (filters.status) url += `&status=${filters.status}`

      const schedulesRes = await api.get(url)
      setSchedules(schedulesRes.data)
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
      notifications.show({
        title: "Error",
        message: error?.message || error?.error || (typeof error === "string" ? error : "Failed to fetch schedules"),
        color: "red",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filters])

  const getStatusColor = (status) => {
    return status === "completed" ? "green" : status === "pending" ? "yellow" : "blue"
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const filteredSchedules = schedules.filter((schedule) => {
    if (!searchQuery) return true

    const departmentName = schedule.Department?.name?.toLowerCase() || ""
    const auditorName = schedule.auditor_name?.toLowerCase() || ""
    const facilitatorName = schedule.lean_facilitator_name?.toLowerCase() || ""
    const query = searchQuery.toLowerCase()

    return departmentName.includes(query) || auditorName.includes(query) || facilitatorName.includes(query)
  })

  return (
    <Container size="xs" px="xs" py="md">
      {/* Header with back button */}
      <Group position="apart" mb="md">
        <Group>
          <ActionIcon variant="subtle" onClick={() => navigate(-1)} size="lg">
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Title order={2} style={{ fontSize: rem(20) }}>
            Audit Schedules
          </Title>
        </Group>
      </Group>

      {/* Search Bar */}
      <TextInput
        placeholder="Search departments, auditors..."
        icon={<IconSearch size={16} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        mb="md"
        size="md"
      />

      {/* Filter Section - Always Visible */}
      <Paper withBorder p="md" radius="md" mb="md">
        <Text fw={500} size="sm" mb="md">
          <IconFilter size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
          Filters
        </Text>
        <Stack spacing="md">
          <MonthPickerInput
            label="Month"
            placeholder="Pick month"
            value={getFilterDate(filters.month)}
            onChange={(value) => setFilters((prev) => ({ ...prev, month: value || new Date() }))}
            size="md"
            leftSection={<IconCalendarEvent size={16} />}
          />
          <Group position="apart">
            <Text size="sm">Department Type:</Text>
            <Group>
              <Badge
                color={filters.department_type === "production" ? "blue" : "gray"}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    department_type: prev.department_type === "production" ? "" : "production",
                  }))
                }
                style={{ cursor: "pointer" }}
                size="lg"
              >
                Production
              </Badge>
              <Badge
                color={filters.department_type === "non-production" ? "blue" : "gray"}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    department_type: prev.department_type === "non-production" ? "" : "non-production",
                  }))
                }
                style={{ cursor: "pointer" }}
                size="lg"
              >
                Non-Production
              </Badge>
            </Group>
          </Group>
          <Group position="apart">
            <Text size="sm">Status:</Text>
            <Group>
              <Badge
                color={filters.status === "pending" ? "yellow" : "gray"}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    status: prev.status === "pending" ? "" : "pending",
                  }))
                }
                style={{ cursor: "pointer" }}
                size="lg"
              >
                Pending
              </Badge>
              <Badge
                color={filters.status === "completed" ? "green" : "gray"}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    status: prev.status === "completed" ? "" : "completed",
                  }))
                }
                style={{ cursor: "pointer" }}
                size="lg"
              >
                Completed
              </Badge>
            </Group>
          </Group>
        </Stack>
      </Paper>

      {/* Current Month Display */}
      <Paper withBorder p="md" radius="md" mb="md" bg="blue.0">
        <Group position="apart">
          <Group>
            <IconCalendar size={20} />
            <Text fw={500}>{getFilterDate(filters.month).toLocaleString("default", { month: "long", year: "numeric" })}</Text>
          </Group>
          <Badge size="lg">
            {filteredSchedules.length} {filteredSchedules.length === 1 ? "Schedule" : "Schedules"}
          </Badge>
        </Group>
      </Paper>

      {/* Schedule List - No Accordion */}
      <Paper withBorder radius="md" p="xs">
        <Group position="apart" mb="md" px="xs">
          <Text fw={500} size="sm">
            <IconClock size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
            Schedule List
          </Text>
        </Group>

        {isLoading ? (
          <Center p="xl">
            <Loader size="md" />
          </Center>
        ) : filteredSchedules.length === 0 ? (
          <Paper p="md" withBorder>
            <Center>
              <Text c="dimmed">No schedules found</Text>
            </Center>
          </Paper>
        ) : (
          <Stack spacing="md">
            {filteredSchedules.map((schedule) => (
              <Card key={schedule.id} withBorder padding="md" radius="md">
                <Stack spacing="xs">
                  {/* Department and Status */}
                  <Group position="apart" mb="xs">
                    <Group>
                      <IconBuilding size={18} />
                      <Text fw={600}>{schedule.Department?.name}</Text>
                    </Group>
                    <Badge color={getStatusColor(schedule.status)} size="lg">
                      {schedule.status}
                    </Badge>
                  </Group>

                  {/* Date */}
                  <Group>
                    <IconCalendar size={16} />
                    <Text size="sm">{formatDate(schedule.audit_date)}</Text>
                  </Group>

                  {/* Auditor */}
                  <Group>
                    <IconUser size={16} />
                    <Text size="sm" fw={500}>
                      Auditor:
                    </Text>
                    <Text size="sm">{schedule.auditor_name}</Text>
                  </Group>

                  {/* Facilitator */}
                  <Group>
                    <IconUsers size={16} />
                    <Text size="sm" fw={500}>
                      Facilitator:
                    </Text>
                    <Text size="sm">{schedule.lean_facilitator_name}</Text>
                  </Group>

                  <Divider my="xs" />

                  {/* Department Type */}
                  <Group position="apart">
                    <Text size="sm" c="dimmed">
                      Department Type:
                    </Text>
                    <Badge>{schedule.Department?.type || "N/A"}</Badge>
                  </Group>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Paper>
    </Container>
  )
}
