import { useState, useEffect } from "react"
import { 
  Table, 
  Button, 
  Group, 
  ActionIcon, 
  Card, 
  Badge, 
  Title, 
  Grid, 
  Paper, 
  ThemeIcon, 
  Text, 
  Divider, 
  ScrollArea,
  Box,
  Tooltip,
  Center,
  Loader
} from "@mantine/core"
import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconDownload, 
  IconFileSpreadsheet, 
  IconBuildingFactory2, 
  IconFilter, 
  IconCalendarEvent,
  IconInfoCircle
} from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"
import { notifications } from "@mantine/notifications"
import { MonthPickerInput } from '@mantine/dates';
import api from "../../services/api"

export default function ProductionAudit() {
  const [audits, setAudits] = useState([])
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    month: new Date(),
  });

  const getFilterDate = (val) => {
    if (!val) return new Date()
    const d = new Date(val)
    return isNaN(d.getTime()) ? new Date() : d
  }

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const filterDate = getFilterDate(filters.month);
      const month = filterDate.getMonth() + 1;
      const year = filterDate.getFullYear();

      const response = await api.get("/production-audits", {
        params: {
          month,
          year
        }
      });
      setAudits(response.data);
    } catch (error) {
      console.error("Failed to fetch production audits:", error);
      notifications.show({
        title: "Error",
        message: error?.message || error?.error || (typeof error === "string" ? error : "Failed to fetch audits"),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const filterDate = getFilterDate(filters.month);
      const month = filterDate.getMonth() + 1;
      const year = filterDate.getFullYear();

      // Create a notification
      const notificationId = notifications.show({
        title: "Exporting",
        message: "Preparing Excel export...",
        loading: true,
        autoClose: false,
      });

      const response = await api.get("/production-audits", {
        params: {
          month,
          year,
          format: 'excel'
        },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `production-audit-report-${year}-${month}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Update notification
      notifications.update({
        id: notificationId,
        title: "Success",
        message: "Excel file has been downloaded",
        color: "green",
        loading: false,
        autoClose: 3000,
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to export data",
        color: "red",
      });
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, [filters]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this audit?")) {
      try {
        await api.delete(`/production-audits/${id}`)
        notifications.show({
          title: "Success",
          message: "Audit deleted successfully",
          color: "green",
        })
        fetchAudits()
      } catch (error) {
        notifications.show({
          title: "Error",
          message: "Failed to delete audit",
          color: "red",
        })
      }
    }
  }

  // Calculate statistics
  const getAverageScore = () => {
    if (audits.length === 0) return 0;
    
    const totalScore = audits.reduce((sum, audit) => {
      const scores = [
        audit.sort_score,
        audit.set_in_order_score,
        audit.shine_score,
        audit.standardize_score,
        audit.sustain_score,
        audit.safety_score,
      ];
      return sum + (scores.reduce((a, b) => a + b, 0) / scores.length);
    }, 0);
    
    return (totalScore / audits.length).toFixed(2);
  };

  const getScoreColor = (score) => {
    if (score >= 3.5) return "green";
    if (score >= 2.5) return "blue";
    if (score >= 1.5) return "yellow";
    return "red";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card shadow="sm" padding="xl" radius="md" withBorder>
      <Group justify="space-between" mb="xl">
        <Group>
          <ThemeIcon size={42} radius="md" color="blue">
            <IconBuildingFactory2 size={24} />
          </ThemeIcon>
          <Title>Production Audits</Title>
        </Group>
        <Button 
          leftSection={<IconPlus size={16} />} 
          onClick={() => navigate("/6S/production-audit/create")}
          size="md"
        >
          Create New Audit
        </Button>
      </Group>

      {/* Statistics Cards */}
      <Grid mb="xl">
        <Grid.Col span={4}>
          <Paper p="md" withBorder radius="md" shadow="xs">
            <Group position="apart">
              <Text fw={500} size="lg">Total Audits</Text>
              <Badge size="xl" radius="md">{audits.length}</Badge>
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={4}>
          <Paper p="md" withBorder radius="md" shadow="xs">
            <Group position="apart">
              <Text fw={500} size="lg">Average Score</Text>
              <Badge 
                size="xl" 
                radius="md" 
                color={getScoreColor(getAverageScore())}
              >
                {getAverageScore()}
              </Badge>
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={4}>
          <Paper p="md" withBorder radius="md" shadow="xs">
            <Group position="apart">
              <Text fw={500} size="lg">Period</Text>
              <Badge size="xl" radius="md" color="blue">
                {getFilterDate(filters.month).toLocaleString('default', { month: 'long', year: 'numeric' })}
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
        
        <Grid align="flex-end">
          <Grid.Col span={4}>
            <MonthPickerInput
              label="Filter Month"
              placeholder="Pick month"
              value={getFilterDate(filters.month)}
              onChange={(value) => setFilters(prev => ({ ...prev, month: value || new Date() }))}
              icon={<IconCalendarEvent size={16} />}
              size="md"
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Button
              leftSection={<IconFileSpreadsheet size={16} />}
              onClick={handleExportExcel}
              variant="outline"
              color="green"
              loading={exporting}
              size="md"
            >
              Export to Excel
            </Button>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Results Table */}
      <Paper withBorder p="md" radius="md" shadow="xs">
        <Group mb="md" position="apart">
          <Group>
            <Title order={4}>Audit Results</Title>
            <Badge size="lg">
              {audits.length} {audits.length === 1 ? 'Audit' : 'Audits'}
            </Badge>
          </Group>
          <Group>
            <Text size="sm" color="dimmed">
              Scores: <Badge color="red" size="sm">{"<1.5"}</Badge> <Badge color="yellow" size="sm">1.5-2.5</Badge>{" "}
              <Badge color="blue" size="sm">2.5-3.5</Badge> <Badge color="green" size="sm">{">3.5"}</Badge>
            </Text>
            <Tooltip label="Scores are color-coded based on their value">
              <ActionIcon variant="subtle" color="gray">
                <IconInfoCircle size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
        
        <Divider mb="md" />
        
        {loading ? (
          <Center p="xl">
            <Loader size="xl" />
          </Center>
        ) : audits.length === 0 ? (
          <Center p="xl">
            <Box ta="center">
              <IconBuildingFactory2 size={48} color="gray" />
              <Text size="xl" fw={500} mt="md" color="dimmed">No audits found</Text>
              <Text size="sm" color="dimmed">Try changing the filter or create a new audit</Text>
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
                  <Table.Th style={{ textAlign: "center" }}>Sort</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Set In Order</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Shine</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Standardize</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Sustain</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Safety</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Final Score</Table.Th>
                  <Table.Th style={{ textAlign: "center", width: 150 }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {audits.map((audit) => {
                  const scores = [
                    audit.sort_score,
                    audit.set_in_order_score,
                    audit.shine_score,
                    audit.standardize_score,
                    audit.sustain_score,
                    audit.safety_score,
                  ]
                  const finalScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)

                  return (
                    <Table.Tr key={audit.id}>
                      <Table.Td>
                        <Text fw={500}>{audit.Department?.name}</Text>
                      </Table.Td>
                      <Table.Td>{formatDate(audit.audit_date)}</Table.Td>
                      <Table.Td>{audit.auditor_name}</Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Badge color={getScoreColor(audit.sort_score)}>{audit.sort_score}</Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Badge color={getScoreColor(audit.set_in_order_score)}>{audit.set_in_order_score}</Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Badge color={getScoreColor(audit.shine_score)}>{audit.shine_score}</Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Badge color={getScoreColor(audit.standardize_score)}>{audit.standardize_score}</Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Badge color={getScoreColor(audit.sustain_score)}>{audit.sustain_score}</Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Badge color={getScoreColor(audit.safety_score)}>{audit.safety_score}</Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Badge 
                          size="lg" 
                          color={getScoreColor(finalScore)} 
                          p="md"
                        >
                          {finalScore}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group position="center" spacing="xs">
                          <Tooltip label="Edit Audit">
                            <ActionIcon
                              variant="filled"
                              color="blue"
                              onClick={() => navigate(`/6S/production-audit/edit/${audit.id}`)}
                              size="lg"
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Delete Audit">
                            <ActionIcon 
                              variant="filled" 
                              color="red" 
                              onClick={() => handleDelete(audit.id)}
                              size="lg"
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Download Report">
                            <ActionIcon
                              variant="filled"
                              color="green"
                              onClick={() => navigate(`/6S/production-audit/preview/${audit.id}`)}
                              size="lg"
                            >
                              <IconDownload size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  )
                })}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Paper>
    </Card>
  )
}
