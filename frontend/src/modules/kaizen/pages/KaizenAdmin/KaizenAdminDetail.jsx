"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Card,
  Title,
  Text,
  Group,
  Badge,
  Paper,
  Stack,
  Image,
  SimpleGrid,
  Button,
  Select,
  Textarea,
  NumberInput,
  Center,
  Loader,
  Container,
  Tabs,
  Switch,
  Grid,
  ActionIcon,
  Box,
  Divider,
} from "@mantine/core"
import { DateInput } from "@mantine/dates"
import {
  IconTicket,
  IconUser,
  IconBuilding,
  IconCalendar,
  IconEdit,
  IconArrowLeft,
  IconPhotoPlus,
  IconPhotoCheck,
  IconChartBar,
  IconTag,
  IconUsers,
  IconExternalLink,
  IconAward,
  IconDownload,
} from "@tabler/icons-react"
import { notifications } from "@mantine/notifications"
import api from "../../services/api"

export default function KaizenAdminDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [validationData, setValidationData] = useState({
    validation_status: "",
    test_date: null,
    test_quantity: null,
    test_result: "",
  })

  const [impactData, setImpactData] = useState({
    pph_before: "",
    pph_after: "",
    tct_before: "",
    tct_after: "",
    rft_before: "",
    rft_after: "",
    saving_cost: "",
    is_implemented: false,
  })

  const [pointData, setPointData] = useState({
    point: 0,
  })

  useEffect(() => {
    // Check if ID is defined before fetching
    if (id) {
      fetchSubmission()
    } else {
      setLoading(false)
      notifications.show({
        title: "Error",
        message: "No submission ID provided. Redirecting to admin panel.",
        color: "red",
      })
      // Redirect to admin panel after a short delay
      setTimeout(() => {
        navigate("/kaizen/admin")
      }, 1500)
    }
  }, [id, navigate])

  const fetchSubmission = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/submissions/${id}`)
      setSubmission(response.data)

      // Initialize validation data from submission
      setValidationData({
        validation_status: response.data.validation_status || "Pending",
        test_date: response.data.test_date ? new Date(response.data.test_date) : null,
        test_quantity: response.data.test_quantity || null,
        test_result: response.data.test_result || "",
      })

      // Initialize impact data from submission
      setImpactData({
        pph_before: response.data.pph_before || "",
        pph_after: response.data.pph_after || "",
        tct_before: response.data.tct_before || "",
        tct_after: response.data.tct_after || "",
        rft_before: response.data.rft_before || "",
        rft_after: response.data.rft_after || "",
        saving_cost: response.data.saving_cost || "",
        is_implemented: response.data.is_implemented || false,
      })

      // Initialize point data from submission
      setPointData({
        point: response.data.point || 0,
      })
    } catch (error) {
      console.error("API Error:", error)
      notifications.show({
        title: "Error",
        message: "Failed to fetch submission details",
        color: "red",
      })
      navigate("/kaizen/admin")
    } finally {
      setLoading(false)
    }
  }

  const handleValidationUpdate = async () => {
    try {
      setSaving(true)

      // Prepare data for submission
      const dataToSubmit = {
        ...validationData,
        test_date: validationData.test_date ? validationData.test_date.toISOString() : null,
      }

      await api.patch(`/submissions/${id}/validation`, dataToSubmit, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      notifications.show({
        title: "Success",
        message: "Validation status updated successfully",
        color: "green",
      })

      // Refresh submission data
      fetchSubmission()
    } catch (error) {
      console.error("API Error:", error)
      notifications.show({
        title: "Error",
        message: "Failed to update validation status",
        color: "red",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleImpactUpdate = async () => {
    try {
      setSaving(true)

      // Prepare data for submission
      const dataToSubmit = {
        ...impactData,
      }

      await api.patch(`/submissions/${id}/impact`, dataToSubmit, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      notifications.show({
        title: "Success",
        message: "Impact metrics updated successfully",
        color: "green",
      })

      // Refresh submission data
      fetchSubmission()
    } catch (error) {
      console.error("API Error:", error)
      notifications.show({
        title: "Error",
        message: "Failed to update impact metrics",
        color: "red",
      })
    } finally {
      setSaving(false)
    }
  }
  const handleDownloadPdf = () => {
    if (!submission || !id) {
      notifications.show({
        title: "Error",
        message: "Submission data is not available.",
        color: "red",
      });
      return;
    }
    const pdfUrl = `${api.defaults.baseURL}/erc-pdf/${id}`;
    window.open(pdfUrl, "_blank");
  };

  const handlePointUpdate = async () => {
    try {
      setSaving(true)

      // Prepare data for submission
      const dataToSubmit = {
        point: pointData.point,
      }

      await api.patch(`/submissions/${id}/point`, dataToSubmit, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      notifications.show({
        title: "Success",
        message: "Point updated successfully",
        color: "green",
      })

      // Refresh submission data
      fetchSubmission()
    } catch (error) {
      console.error("API Error:", error)
      notifications.show({
        title: "Error",
        message: "Failed to update point",
        color: "red",
      })
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status) => {
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

  if (loading) {
    return (
      <Center style={{ height: "70vh" }}>
        <Loader size="xl" />
      </Center>
    )
  }

  if (!submission) {
    return (
      <Center style={{ height: "70vh" }}>
        <Stack align="center" spacing="md">
          <Text>Submission not found</Text>
          <Button onClick={() => navigate("/kaizen/admin")}>Back to Admin Panel</Button>
        </Stack>
      </Center>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const baseUrl = api.defaults.baseURL.replace("/api", "")

  return (
    <Container size="md" py="xl">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group position="apart" mb="xl">
          <Group>
            <IconTicket size={32} />
            <Title order={2}>Kaizen Admin Detail</Title>
          </Group>
          <Badge size="xl" color={getStatusColor(submission.validation_status)}>
            {submission.validation_status}
          </Badge>
        </Group>

        <Paper p="md" withBorder radius="md" mb="xl">
          <Group position="apart" mb="md">
            <Title order={4}>Submission Details</Title>
            <Badge size="lg" color="blue">
              {submission.ticket_number}
            </Badge>
          </Group>

          <Title order={5} mb="md">
            {submission.kaizen_title}
          </Title>

          <Stack spacing="md">
            <Group>
              <IconUser size={20} />
              <Text fw={500}>PIC:</Text>
              <Text>{submission.pic_name}</Text>
            </Group>

            <Group>
              <IconBuilding size={20} />
              <Text fw={500}>Department:</Text>
              <Text>{submission.department}</Text>
            </Group>

            {submission.erc_team && (
              <Group>
                <IconUsers size={20} />
                <Text fw={500}>ERC Team:</Text>
                <Text>{submission.erc_team}</Text>
              </Group>
            )}

            {submission.sku && (
              <Group>
                <IconTag size={20} />
                <Text fw={500}>SKU / Model:</Text>
                <Text>{submission.sku}</Text>
              </Group>
            )}

            <Group>
              <IconCalendar size={20} />
              <Text fw={500}>Submission Date:</Text>
              <Text>{formatDate(submission.submission_date)}</Text>
            </Group>

            <Group>
              <Text fw={500}>Kaizen Type:</Text>
              <Badge>{submission.kaizen_type}</Badge>
            </Group>

            <Group>
              <Text fw={500}>Implementation Status:</Text>
              <Badge color={submission.is_implemented ? "green" : "yellow"}>
                {submission.is_implemented ? "Implemented" : "Not Implemented"}
              </Badge>
            </Group>

            <Group>
              <IconAward size={20} />
              <Text fw={500}>Point:</Text>
              <Badge color="orange" size="lg">
                {submission.point || 0}
              </Badge>
            </Group>
          </Stack>
        </Paper>

        <SimpleGrid cols={1} spacing="md" mb="xl">
          <Paper p="md" withBorder radius="md">
            <Title order={4} mb="md">
              Background
            </Title>
            <Text>{submission.background}</Text>
          </Paper>

          <Paper p="md" withBorder radius="md">
            <Title order={4} mb="md">
              Before Implementation
            </Title>
            <Text>{submission.before_description}</Text>
          </Paper>

          <Paper p="md" withBorder radius="md">
            <Title order={4} mb="md">
              After Implementation
            </Title>
            <Text>{submission.after_description}</Text>
          </Paper>

          <Paper p="md" withBorder radius="md">
            <Title order={4} mb="md">
              Benefits
            </Title>
            <Text>{submission.benefits}</Text>
          </Paper>
        </SimpleGrid>

        {/* Photos Section with Tabs */}
        <Paper p="md" withBorder radius="md" mb="xl">
          <Title order={4} mb="md">
            Photos
          </Title>

          <Tabs defaultValue="before">
            <Tabs.List>
              <Tabs.Tab value="before" leftSection={<IconPhotoPlus size={16} />}>
                Before Photos
              </Tabs.Tab>
              <Tabs.Tab value="after" leftSection={<IconPhotoCheck size={16} />}>
                After Photos
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="before" pt="xs">
              {submission.photos_before && submission.photos_before.length > 0 ? (
                <SimpleGrid cols={2} spacing="md" mt="md">
                  {submission.photos_before.map((url, index) => {
                    const fullUrl = `${baseUrl}${url}`
                    return (
                      <Box key={index} style={{ position: "relative" }}>
                        <Image
                          src={fullUrl || "/placeholder.svg"}
                          alt={`Before Photo ${index + 1}`}
                          radius="md"
                          style={{ maxHeight: "200px", objectFit: "cover" }}
                        />
                        <ActionIcon
                          component="a"
                          href={fullUrl}
                          target="_blank"
                          color="blue"
                          variant="filled"
                          radius="xl"
                          style={{
                            position: "absolute",
                            bottom: "8px",
                            right: "8px",
                          }}
                        >
                          <IconExternalLink size={16} />
                        </ActionIcon>
                      </Box>
                    )
                  })}
                </SimpleGrid>
              ) : (
                <Text c="dimmed" ta="center" mt="md">
                  No before photos available
                </Text>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="after" pt="xs">
              {submission.photos_after && submission.photos_after.length > 0 ? (
                <SimpleGrid cols={2} spacing="md" mt="md">
                  {submission.photos_after.map((url, index) => {
                    const fullUrl = `${baseUrl}${url}`
                    return (
                      <Box key={index} style={{ position: "relative" }}>
                        <Image
                          src={fullUrl || "/placeholder.svg"}
                          alt={`After Photo ${index + 1}`}
                          radius="md"
                          style={{ maxHeight: "200px", objectFit: "cover" }}
                        />
                        <ActionIcon
                          component="a"
                          href={fullUrl}
                          target="_blank"
                          color="blue"
                          variant="filled"
                          radius="xl"
                          style={{
                            position: "absolute",
                            bottom: "8px",
                            right: "8px",
                          }}
                        >
                          <IconExternalLink size={16} />
                        </ActionIcon>
                      </Box>
                    )
                  })}
                </SimpleGrid>
              ) : (
                <Text c="dimmed" ta="center" mt="md">
                  No after photos available
                </Text>
              )}
            </Tabs.Panel>
          </Tabs>
        </Paper>

        {/* Point Management */}
        <Paper p="md" withBorder radius="md" mb="xl" bg="orange.0">
          <Title order={4} mb="xl">
            <IconAward size={20} style={{ marginRight: 8 }} />
            Point Management
          </Title>

          <Text mb="md">
            Assign points to this Kaizen submission for ranking purposes. Each submission automatically receives 1 base
            point.
          </Text>

          <NumberInput
            label="Additional Points"
            description="Enter the number of additional points to award for this Kaizen"
            placeholder="Enter points"
            value={pointData.point}
            onChange={(value) => setPointData({ point: value })}
            min={0}
            max={100}
          />

          <Divider my="md" />

          <Text size="sm" fw={500} mb="xs">
            Total Points:{" "}
            <Badge size="lg" color="orange">
              {pointData.point || 0}
            </Badge>
          </Text>

          <Button onClick={handlePointUpdate} loading={saving} color="orange" fullWidth mt="md">
            Update Points
          </Button>
        </Paper>

        {/* Impact Metrics Management */}
        <Paper p="md" withBorder radius="md" mb="xl" bg="green.0">
          <Title order={4} mb="xl">
            <IconChartBar size={20} style={{ marginRight: 8 }} />
            Impact Metrics
          </Title>

          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                label="PPH Before"
                placeholder="Enter PPH before"
                value={impactData.pph_before}
                onChange={(value) => setImpactData({ ...impactData, pph_before: value })}
                precision={2}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="PPH After"
                placeholder="Enter PPH after"
                value={impactData.pph_after}
                onChange={(value) => setImpactData({ ...impactData, pph_after: value })}
                precision={2}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="TCT Before (seconds)"
                placeholder="Enter TCT before"
                value={impactData.tct_before}
                onChange={(value) => setImpactData({ ...impactData, tct_before: value })}
                precision={2}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="TCT After (seconds)"
                placeholder="Enter TCT after"
                value={impactData.tct_after}
                onChange={(value) => setImpactData({ ...impactData, tct_after: value })}
                precision={2}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="RFT Before (%)"
                placeholder="Enter RFT before"
                value={impactData.rft_before}
                onChange={(value) => setImpactData({ ...impactData, rft_before: value })}
                precision={2}
                min={0}
                max={100}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="RFT After (%)"
                placeholder="Enter RFT after"
                value={impactData.rft_after}
                onChange={(value) => setImpactData({ ...impactData, rft_after: value })}
                precision={2}
                min={0}
                max={100}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <NumberInput
                label="Saving Cost"
                placeholder="Enter cost savings"
                value={impactData.saving_cost}
                onChange={(value) => setImpactData({ ...impactData, saving_cost: value })}
                precision={2}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Switch
                label="Implementation Status"
                checked={impactData.is_implemented}
                onChange={(event) => setImpactData({ ...impactData, is_implemented: event.currentTarget.checked })}
                labelPosition="left"
                styles={{ label: { fontWeight: 500 } }}
              />
            </Grid.Col>
          </Grid>

          <Button onClick={handleImpactUpdate} loading={saving} color="green" fullWidth mt="md">
            Update Impact Metrics
          </Button>
        </Paper>

        <Paper p="md" withBorder radius="md" mb="xl" bg="blue.0">
          <Title order={4} mb="xl">
            Validation Management
          </Title>

          <Stack spacing="md">
            <Select
              label="Validation Status"
              placeholder="Select status"
              data={[
                { value: "Pending", label: "Pending" },
                { value: "On Checking Progress", label: "On Checking Progress" },
                { value: "Pass OK", label: "Pass OK" },
                { value: "Failed", label: "Failed" },
              ]}
              value={validationData.validation_status}
              onChange={(value) => setValidationData({ ...validationData, validation_status: value })}
              required
            />

            <DateInput
              label="Test Date"
              placeholder="Select test date"
              value={validationData.test_date}
              onChange={(value) => setValidationData({ ...validationData, test_date: value })}
            />

            <NumberInput
              label="Test Quantity"
              placeholder="Enter test quantity"
              value={validationData.test_quantity}
              onChange={(value) => setValidationData({ ...validationData, test_quantity: value })}
            />

            <Textarea
              label="Test Result"
              placeholder="Enter test results"
              value={validationData.test_result}
              onChange={(e) => setValidationData({ ...validationData, test_result: e.target.value })}
              minRows={3}
            />

            <Button onClick={handleValidationUpdate} loading={saving} color="blue" fullWidth mt="md">
              Update Validation Status
            </Button>
          </Stack>
        </Paper>

        <Group position="center" mt="xl">
          <Button variant="outline" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate("/kaizen/admin")}>
            Back to Admin Panel
          </Button>

            <Button
            color="teal" // Warna berbeda untuk download
            leftSection={<IconDownload size={16} />}
            onClick={handleDownloadPdf}
            disabled={!submission || loading}
          >
            Download ERC PDF
          </Button>

          <Button
            color="green"
            leftSection={<IconEdit size={16} />}
            onClick={() => navigate(`/kaizen/submission/form/${submission.ticket_number}`)}
          >
            Edit Submission
          </Button>
        </Group>
      </Card>
    </Container>
  )
}
