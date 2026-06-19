"use client"

import { useState, useEffect } from "react"
import {
  Card,
  Title,
  Table,
  Badge,
  Group,
  ActionIcon,
  Text,
  Select,
  Paper,
  Stack,
  Button,
  Center,
  Loader,
  Tooltip,
  Container,
  NumberInput, // Tambahkan NumberInput untuk tahun
} from "@mantine/core"
import { DateInput } from "@mantine/dates"
import { IconEye, IconEdit, IconTrash, IconFilter, IconSettings, IconFileSpreadsheet } from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"
import { notifications } from "@mantine/notifications"
import api from "../../services/api"

export default function KaizenAdmin() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    status: "",
    month: new Date(), // Tetap ada untuk filter bulanan di tabel
    yearForExport: new Date().getFullYear(), // State baru untuk filter tahun ekspor
    implemented: undefined,
  })

  useEffect(() => {
    fetchSubmissions()
  }, [filters.status, filters.month, filters.implemented]) // fetchSubmissions tetap berdasarkan filter bulanan

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const dateObj = filters.month instanceof Date ? filters.month : new Date(filters.month)
      const month = isNaN(dateObj.getTime()) ? new Date().getMonth() + 1 : dateObj.getMonth() + 1
      const year = isNaN(dateObj.getTime()) ? new Date().getFullYear() : dateObj.getFullYear()

      const params = { month, year }
      if (filters.status) params.status = filters.status
      if (filters.implemented !== undefined) params.implemented = filters.implemented

      const response = await api.get("/submissions", { params }) //
      setSubmissions(response.data)
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch submissions",
        color: "red",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = async () => {
    try {
      setExporting(true)
      const yearToExport = filters.yearForExport // Gunakan tahun dari state baru

      if (!yearToExport) {
        notifications.show({
          title: "Warning",
          message: "Please select a year for export",
          color: "yellow",
        })
        setExporting(false)
        return
      }

      const queryParams = new URLSearchParams()
      queryParams.append("year", yearToExport)
      queryParams.append("status", "Pass OK") // Tetap hanya ekspor Pass OK
      if (filters.implemented !== undefined) queryParams.append("implemented", filters.implemented.toString())


      // Generate the export URL
      const exportUrl = `${api.defaults.baseURL}/submissions/export/excel?${queryParams.toString()}` //

      // Open the URL in a new tab to trigger download
      window.open(exportUrl, "_blank") //

      notifications.show({
        title: "Success",
        message: `Excel report for ${yearToExport} (Pass OK submissions) is being generated`,
        color: "green",
      })
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to export data",
        color: "red",
      })
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = async (id) => {
    // ... (fungsi handleDelete tetap sama)
    if (window.confirm("Are you sure you want to delete this submission?")) {
      try {
        await api.delete(`/submissions/${id}`) //
        notifications.show({
          title: "Success",
          message: "Submission deleted successfully",
          color: "green",
        })
        fetchSubmissions()
      } catch (error) {
        notifications.show({
          title: "Error",
          message: "Failed to delete submission",
          color: "red",
        })
      }
    }
  }


  const getStatusColor = (status) => {
    // ... (fungsi getStatusColor tetap sama)
    switch (status) {
      case "Pending":
        return "yellow"
      case "On Checking Progress":
        return "blue"
      case "Pass OK":
        return "green"
      case "Failed":
        return "red"
      default:
        return "gray"
    }
  }

  const formatDate = (dateString) => {
    // ... (fungsi formatDate tetap sama)
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Container fluid py="xl">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group position="apart" mb="xl">
          <Group>
            <IconSettings size={32} />
            <Title order={2}>Kaizen Admin Panel</Title>
          </Group>
          <Button
            leftSection={<IconFileSpreadsheet size={16} />}
            onClick={handleExportExcel}
            loading={exporting}
            color="green"
          >
            Export Yearly Report
          </Button>
        </Group>

        <Paper p="md" withBorder radius="md" mb="xl">
          <Group mb="md">
            <IconFilter size={20} />
            <Title order={4}>Filters</Title>
          </Group>

          <Group grow>
            <DateInput
              label="Month (for Table View)"
              placeholder="Select month"
              value={filters.month}
              onChange={(value) => setFilters({ ...filters, month: value || new Date() })}
              valueFormat="MMMM YYYY" //
              clearable={false}
            />

            <NumberInput // Input untuk memilih tahun ekspor
              label="Year (for Export)"
              placeholder="Enter year"
              value={filters.yearForExport}
              onChange={(value) => setFilters({ ...filters, yearForExport: value })}
              min={2000} // Batas minimal tahun
              max={new Date().getFullYear() + 5} // Batas maksimal tahun
            />

            <Select
              label="Status (for Table View)"
              placeholder="All statuses"
              clearable
              data={[
                { value: "Pending", label: "Pending" },
                { value: "On Checking Progress", label: "On Checking Progress" },
                { value: "Pass OK", label: "Pass OK" },
                { value: "Failed", label: "Failed" },
              ]}
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })} //
            />

            <Select
              label="Implementation Status (Table & Export)"
              placeholder="All"
              clearable
              data={[
                { value: "true", label: "Implemented" },
                { value: "false", label: "Not Implemented" },
              ]}
              value={filters.implemented === undefined ? null : String(filters.implemented)} //
              onChange={(value) => {
                let implementedVal
                if (value === "true") implementedVal = true
                else if (value === "false") implementedVal = false
                else implementedVal = undefined
                setFilters({ ...filters, implemented: implementedVal })
              }}
            />
          </Group>
        </Paper>

        {/* Bagian Tabel dan Konten Lainnya (tetap sama) */}
        {loading ? (
          <Center style={{ height: "300px" }}>
            <Loader size="xl" />
          </Center>
        ) : submissions.length === 0 ? (
          <Center style={{ height: "300px" }}>
            <Stack align="center">
              <IconSettings size={48} color="#868e96" />
              <Text size="xl" fw={500}>
                No submissions found for selected month
              </Text>
              <Text c="dimmed">Try changing your filters for table view</Text>
            </Stack>
          </Center>
        ) : (
          <Table striped highlightOnHover withBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Ticket</Table.Th>
                <Table.Th>Title</Table.Th>
                <Table.Th>Suggested By</Table.Th>
                <Table.Th>Department</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Implemented</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {submissions.map((submission) => (
                <Table.Tr key={submission.id}>
                  <Table.Td>{submission.ticket_number}</Table.Td>
                  <Table.Td>{submission.kaizen_title}</Table.Td>
                  <Table.Td>{submission.pic_name}</Table.Td>
                  <Table.Td>{submission.department}</Table.Td>
                  <Table.Td>{formatDate(submission.submission_date)}</Table.Td>
                  <Table.Td>
                    <Badge>{submission.kaizen_type}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(submission.validation_status)}>{submission.validation_status}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={submission.is_implemented ? "green" : "gray"}>
                      {submission.is_implemented ? "Yes" : "No"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group position="center">
                      <Tooltip label="View Details">
                        <ActionIcon
                          color="blue"
                          variant="filled"
                          onClick={() => navigate(`/kaizen/admin/${submission.id}`)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      </Tooltip>

                      <Tooltip label="Edit">
                        <ActionIcon
                          color="green"
                          variant="filled"
                          onClick={() => navigate(`/kaizen/submission/form/${submission.ticket_number}`)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>

                      <Tooltip label="Delete">
                        <ActionIcon color="red" variant="filled" onClick={() => handleDelete(submission.id)}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </Container>
  )
}