"use client"

import { useState, useEffect } from "react"
import {
  Table,
  Button,
  Group,
  TextInput,
  ActionIcon,
  Card,
  Modal,
  Select,
  Badge,
  Grid,
  Title,
  Divider,
  Center,
  Loader,
  Text,
  ScrollArea,
  Paper,
  ThemeIcon,
  Tooltip,
  Box,
} from "@mantine/core"
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconCalendarPlus,
  IconFileSpreadsheet,
  IconFilter,
  IconCalendarEvent,
  IconCalendarStats,
  IconBuildingFactory2,
  IconBuildingSkyscraper,
  IconCheck,
  IconClock,
} from "@tabler/icons-react"
import { notifications } from "@mantine/notifications"
import { useForm } from "@mantine/form"
import { DateInput } from "@mantine/dates"
import { MonthPickerInput } from "@mantine/dates"
import api from "../../services/api"

export default function Schedule() {
  const [schedules, setSchedules] = useState([])
  const [departments, setDepartments] = useState([])
  const [opened, setOpened] = useState(false)
  const [bulkCreateOpened, setBulkCreateOpened] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [exporting, setExporting] = useState(false)

  const form = useForm({
    initialValues: {
      department_id: "",
      audit_date: null,
      auditor_name: "",
      lean_facilitator_name: "",
      status: "pending",
    },
    validate: {
      department_id: (value) => !value && "Department is required",
      audit_date: (value) => !value && "Audit date is required",
      auditor_name: (value) => !value && "Auditor name is required",
      lean_facilitator_name: (value) => !value && "Lean facilitator name is required",
    },
  })

  const bulkCreateForm = useForm({
    initialValues: {
      month: new Date(),
      defaultAuditor: "",
      defaultFacilitator: "",
    },
  })

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
      // Fetch departments
      const departmentsRes = await api.get("/departments")
      setDepartments(
        departmentsRes.data.map((dept) => ({
          value: dept.id.toString(),
          label: dept.name,
          type: dept.type,
        })),
      )

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
        message: error?.message || error?.error || (typeof error === "string" ? error : "Failed to fetch data"),
        color: "red",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filters])

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      if (selectedId) {
        await api.put(`/schedules/${selectedId}`, values)
      } else {
        await api.post("/schedules", values)
      }
      notifications.show({
        title: "Success",
        message: `Schedule ${selectedId ? "updated" : "created"} successfully`,
        color: "green",
      })
      setOpened(false)
      form.reset()
      fetchData()
    } catch (error) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "An error occurred",
        color: "red",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBulkCreate = async (values) => {
    setLoading(true)
    try {
      // Extract month and year from the date object
      const month = values.month.getMonth() + 1
      const year = values.month.getFullYear()

      const response = await api.post("/schedules/monthly", {
        month,
        year,
        defaultAuditor: values.defaultAuditor,
        defaultFacilitator: values.defaultFacilitator,
      })

      notifications.show({
        title: "Success",
        message: `Created ${response.data.count} schedules for ${month}/${year}`,
        color: "green",
      })

      setBulkCreateOpened(false)
      bulkCreateForm.reset()
      fetchData()
    } catch (error) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "An error occurred",
        color: "red",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (schedule) => {
    setSelectedId(schedule.id)
    form.setValues({
      ...schedule,
      department_id: schedule.department_id.toString(),
      audit_date: new Date(schedule.audit_date),
    })
    setOpened(true)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/schedules/${id}`)
      notifications.show({
        title: "Success",
        message: "Schedule deleted successfully",
        color: "green",
      })
      fetchData()
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to delete schedule",
        color: "red",
      })
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const filterDate = getFilterDate(filters.month)
      const month = filterDate.getMonth() + 1
      const year = filterDate.getFullYear()

      let url = `/schedules/export/excel?month=${month}&year=${year}`
      if (filters.department_type) url += `&department_type=${filters.department_type}`
      if (filters.status) url += `&status=${filters.status}`

      // Create a notification
      const notificationId = notifications.show({
        title: "Exporting",
        message: "Preparing Excel export...",
        loading: true,
        autoClose: false,
      })

      // Fetch the file as blob
      const response = await api.get(url, { responseType: "blob" })

      // Create a blob URL
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const blobUrl = window.URL.createObjectURL(blob)

      // Create a link and trigger download
      const link = document.createElement("a")
      const monthName = new Date(0, month - 1).toLocaleString("default", { month: "long" })
      link.href = blobUrl
      link.download = `Audit_Schedule_${monthName}_${year}.xlsx`
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)

      // Update notification
      notifications.update({
        id: notificationId,
        title: "Success",
        message: "Excel file has been downloaded",
        color: "green",
        loading: false,
        autoClose: 3000,
      })
    } catch (error) {
      console.error("Error exporting to Excel:", error)
      notifications.show({
        title: "Error",
        message: "Failed to export to Excel",
        color: "red",
      })
    } finally {
      setExporting(false)
    }
  }

  const getStatusColor = (status) => {
    return status === "completed" ? "green" : status === "pending" ? "yellow" : "blue"
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  // Calculate statistics
  const totalSchedules = schedules.length
  const completedSchedules = schedules.filter((s) => s.status === "completed").length
  const pendingSchedules = schedules.filter((s) => s.status === "pending").length
  const completionRate = totalSchedules > 0 ? Math.round((completedSchedules / totalSchedules) * 100) : 0

  return (
    <Card shadow="sm" padding="xl" radius="md" withBorder>
      <Group justify="space-between" mb="xl">
        <Group>
          <ThemeIcon size={42} radius="md" color="blue">
            <IconCalendarStats size={24} />
          </ThemeIcon>
          <Title>Audit Schedules</Title>
        </Group>
        <Group>
          <Button
            leftSection={<IconCalendarPlus size={16} />}
            variant="outline"
            color="teal"
            onClick={() => setBulkCreateOpened(true)}
            size="md"
          >
            Create Monthly Schedule
          </Button>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              setSelectedId(null)
              form.reset()
              setOpened(true)
            }}
            size="md"
          >
            Add Schedule
          </Button>
        </Group>
      </Group>

      {/* Statistics Cards */}
      <Grid mb="xl">
        <Grid.Col span={3}>
          <Paper p="md" withBorder radius="md" shadow="xs">
            <Group position="apart">
              <Text fw={500} size="lg">
                Total Schedules
              </Text>
              <Badge size="xl" radius="md">
                {totalSchedules}
              </Badge>
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={3}>
          <Paper p="md" withBorder radius="md" shadow="xs">
            <Group position="apart">
              <Group>
                <ThemeIcon size="sm" radius="xl" color="green">
                  <IconCheck size={14} />
                </ThemeIcon>
                <Text fw={500} size="lg">
                  Completed
                </Text>
              </Group>
              <Badge size="xl" radius="md" color="green">
                {completedSchedules}
              </Badge>
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={3}>
          <Paper p="md" withBorder radius="md" shadow="xs">
            <Group position="apart">
              <Group>
                <ThemeIcon size="sm" radius="xl" color="yellow">
                  <IconClock size={14} />
                </ThemeIcon>
                <Text fw={500} size="lg">
                  Pending
                </Text>
              </Group>
              <Badge size="xl" radius="md" color="yellow">
                {pendingSchedules}
              </Badge>
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={3}>
          <Paper p="md" withBorder radius="md" shadow="xs">
            <Group position="apart">
              <Text fw={500} size="lg">
                Completion Rate
              </Text>
              <Badge
                size="xl"
                radius="md"
                color={
                  completionRate >= 75
                    ? "green"
                    : completionRate >= 50
                      ? "blue"
                      : completionRate >= 25
                        ? "yellow"
                        : "red"
                }
              >
                {completionRate}%
              </Badge>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Filter Section */}
      <Paper withBorder p="md" radius="md" mb="xl" shadow="xs">
        <Group mb="md">
          <ThemeIcon size="md" radius="md" color="gray" variant="light">
            <IconFilter size={16} />
          </ThemeIcon>
          <Title order={4}>Filters</Title>
        </Group>

        <Divider mb="md" />

        <Grid>
          <Grid.Col span={4}>
            <MonthPickerInput
              label="Month"
              placeholder="Pick month"
              value={getFilterDate(filters.month)}
              onChange={(value) => setFilters((prev) => ({ ...prev, month: value || new Date() }))}
              icon={<IconCalendarEvent size={16} />}
              size="md"
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label="Department Type"
              placeholder="All Departments"
              data={[
                { value: "production", label: "Production", icon: IconBuildingFactory2 },
                { value: "non-production", label: "Non-Production", icon: IconBuildingSkyscraper },
              ]}
              value={filters.department_type}
              onChange={(value) => setFilters((prev) => ({ ...prev, department_type: value }))}
              clearable
              size="md"
              icon={<IconBuildingFactory2 size={16} />}
              itemComponent={({ label, icon: Icon }) => (
                <Group>
                  <Icon size={14} />
                  <span>{label}</span>
                </Group>
              )}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label="Status"
              placeholder="All Status"
              data={[
                { value: "pending", label: "Pending" },
                { value: "completed", label: "Completed" },
              ]}
              value={filters.status}
              onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              clearable
              size="md"
            />
          </Grid.Col>
        </Grid>

        {/* Export Button */}
        <Divider my="md" />
        <Group position="right">
          <Button
            leftSection={<IconFileSpreadsheet size={16} />}
            variant="outline"
            color="green"
            onClick={handleExport}
            loading={exporting}
            size="md"
          >
            Export to Excel
          </Button>
        </Group>
      </Paper>

      {/* Schedule Table */}
      <Paper withBorder p="md" radius="md" shadow="xs">
        <Group mb="md" position="apart">
          <Group>
            <Title order={4}>Schedule List</Title>
            <Badge size="lg">
              {schedules.length} {schedules.length === 1 ? "Schedule" : "Schedules"}
            </Badge>
          </Group>
          <Text size="sm" color="dimmed">
            {getFilterDate(filters.month).toLocaleString("default", { month: "long", year: "numeric" })}
          </Text>
        </Group>

        <Divider mb="md" />

        {isLoading ? (
          <Center p="xl">
            <Loader size="xl" />
          </Center>
        ) : schedules.length === 0 ? (
          <Center p="xl">
            <Box ta="center">
              <IconCalendarStats size={48} color="gray" />
              <Text size="xl" fw={500} mt="md" color="dimmed">
                No schedules found
              </Text>
              <Text size="sm" color="dimmed">
                Try changing the filters or create a new schedule
              </Text>
            </Box>
          </Center>
        ) : (
          <ScrollArea h={500}>
            <Table highlightOnHover withColumnBorders striped>
              <Table.Thead sticky>
                <Table.Tr>
                  <Table.Th>Department</Table.Th>
                  <Table.Th>Audit Date</Table.Th>
                  <Table.Th>Auditor</Table.Th>
                  <Table.Th>Lean Facilitator</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Status</Table.Th>
                  <Table.Th style={{ textAlign: "center", width: 120 }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {schedules.map((schedule) => (
                  <Table.Tr key={schedule.id}>
                    <Table.Td>
                      <Group>
                        <ThemeIcon
                          size="sm"
                          radius="xl"
                          color={schedule.Department?.type === "production" ? "blue" : "teal"}
                        >
                          {schedule.Department?.type === "production" ? (
                            <IconBuildingFactory2 size={14} />
                          ) : (
                            <IconBuildingSkyscraper size={14} />
                          )}
                        </ThemeIcon>
                        <Text fw={500}>{schedule.Department?.name}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>{formatDate(schedule.audit_date)}</Table.Td>
                    <Table.Td>{schedule.auditor_name}</Table.Td>
                    <Table.Td>{schedule.lean_facilitator_name}</Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      <Badge
                        color={getStatusColor(schedule.status)}
                        size="md"
                        variant={schedule.status === "completed" ? "filled" : "light"}
                      >
                        {schedule.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group position="center" spacing="xs">
                        <Tooltip label="Edit Schedule">
                          <ActionIcon variant="filled" color="blue" onClick={() => handleEdit(schedule)} size="lg">
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete Schedule">
                          <ActionIcon variant="filled" color="red" onClick={() => handleDelete(schedule.id)} size="lg">
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Paper>

      {/* Modal untuk tambah/edit jadwal tunggal */}
      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false)
          form.reset()
          setSelectedId(null)
        }}
        title={
          <Group>
            <ThemeIcon size="md" radius="md" color="blue">
              {selectedId ? <IconEdit size={16} /> : <IconPlus size={16} />}
            </ThemeIcon>
            <Text>{selectedId ? "Edit Schedule" : "Add Schedule"}</Text>
          </Group>
        }
        size="md"
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Select
            label="Department"
            placeholder="Select department"
            data={departments.map((dept) => ({
              ...dept,
              icon: dept.type === "production" ? IconBuildingFactory2 : IconBuildingSkyscraper,
            }))}
            {...form.getInputProps("department_id")}
            mb="md"
            size="md"
            itemComponent={({ label, icon: Icon }) => (
              <Group>
                <Icon size={14} />
                <span>{label}</span>
              </Group>
            )}
          />

          <DateInput
            label="Audit Date"
            placeholder="Pick a date"
            {...form.getInputProps("audit_date")}
            mb="md"
            size="md"
            icon={<IconCalendarEvent size={16} />}
          />

          <TextInput
            label="Auditor Name"
            placeholder="Enter auditor name"
            {...form.getInputProps("auditor_name")}
            mb="md"
            size="md"
          />

          <Select
            label="Lean Facilitator Name"
            placeholder="Select facilitator"
            data={["Zikri", "Reza", "Miki"]}
            {...form.getInputProps("lean_facilitator_name")}
            mb="md"
            searchable
            creatable
            getCreateLabel={(query) => `+ Create ${query}`}
            size="md"
          />

          <Select
            label="Status"
            placeholder="Select status"
            data={[
              { value: "pending", label: "Pending", color: "yellow" },
              { value: "completed", label: "Completed", color: "green" },
            ]}
            {...form.getInputProps("status")}
            mb="xl"
            size="md"
            itemComponent={({ label, color }) => (
              <Group>
                <Badge color={color} size="sm">
                  {label}
                </Badge>
              </Group>
            )}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={() => setOpened(false)} size="md">
              Cancel
            </Button>
            <Button type="submit" loading={loading} size="md">
              {selectedId ? "Update" : "Create"}
            </Button>
          </Group>
        </form>
      </Modal>

      {/* Modal untuk bulk create monthly schedules */}
      <Modal
        opened={bulkCreateOpened}
        onClose={() => {
          setBulkCreateOpened(false)
          bulkCreateForm.reset()
        }}
        title={
          <Group>
            <ThemeIcon size="md" radius="md" color="teal">
              <IconCalendarPlus size={16} />
            </ThemeIcon>
            <Text>Create Monthly Schedule for All Departments</Text>
          </Group>
        }
        size="md"
        centered
      >
        <form onSubmit={bulkCreateForm.onSubmit(handleBulkCreate)}>
          <MonthPickerInput
            label="Select Month"
            placeholder="Choose month and year"
            value={bulkCreateForm.values.month}
            onChange={(value) => bulkCreateForm.setFieldValue("month", value)}
            mb="md"
            required
            size="md"
            icon={<IconCalendarEvent size={16} />}
          />

          <TextInput
            label="Default Auditor Name (Optional)"
            placeholder="Will be applied to all schedules"
            {...bulkCreateForm.getInputProps("defaultAuditor")}
            mb="md"
            size="md"
          />

          <Select
            label="Default Lean Facilitator (Optional)"
            placeholder="Will be applied to all schedules"
            data={["Alam", "Ega", "Jubed", "Musa", "Sari", "Sendi", "Rishal", "Zikri"]}
            {...bulkCreateForm.getInputProps("defaultFacilitator")}
            mb="xl"
            searchable
            clearable
            size="md"
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={() => setBulkCreateOpened(false)} size="md">
              Cancel
            </Button>
            <Button type="submit" loading={loading} color="teal" size="md">
              Create Monthly Schedules
            </Button>
          </Group>
        </form>
      </Modal>
    </Card>
  )
}
