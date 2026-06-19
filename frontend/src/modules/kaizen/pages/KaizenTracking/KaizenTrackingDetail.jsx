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
  Timeline,
  Center,
  Loader,
  Container,
  Divider,
  Box,
  ThemeIcon,
  Tabs,
  ActionIcon,
} from "@mantine/core"
import {
  IconTicket,
  IconUser,
  IconBuilding,
  IconCalendar,
  IconEdit,
  IconCheck,
  IconX,
  IconClock,
  IconPhoto,
  IconArrowLeft,
  IconPhotoPlus,
  IconPhotoCheck,
  IconTag,
  IconDownload,
  IconExternalLink,
} from "@tabler/icons-react"
import { notifications } from "@mantine/notifications"
import api from "../../services/api"

export default function KaizenTrackingDetail() {
  const { ticket } = useParams()
  const navigate = useNavigate()
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("before")

  useEffect(() => {
    fetchSubmission()
  }, [ticket])

  const fetchSubmission = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/submissions/ticket/${ticket}`)
      setSubmission(response.data)
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch submission details",
        color: "red",
      })
      navigate("/kaizen/tracking")
    } finally {
      setLoading(false)
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <IconClock size={16} />
      case "On Checking Progress":
        return <IconClock size={100} />
      case "Pass OK":
        return <IconCheck size={16} />
      case "Failed":
        return <IconX size={16} />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Center style={{ height: "70vh" }}>
        <Stack align="center" spacing="md">
          <Loader size="xl" color="blue" />
          <Text size="lg" color="dimmed">
            Loading Kaizen details...
          </Text>
        </Stack>
      </Center>
    )
  }

  if (!submission) {
    return (
      <Center style={{ height: "70vh" }}>
        <Stack align="center" spacing="md">
          <ThemeIcon size={60} radius="xl" color="red" variant="light">
            <IconX size={30} />
          </ThemeIcon>
          <Text size="xl" fw={500}>
            Submission not found
          </Text>
          <Button onClick={() => navigate("/kaizen/tracking")}>Back to Tracking</Button>
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

  return (
    <Container size="md" py="xl">
      <Card shadow="md" padding="lg" radius="md" withBorder>
        {/* Header with back button and status badge */}
        <Group position="apart" mb="md">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate("/kaizen/tracking")}
          >
            Back to Tracking
          </Button>
          <Badge
            size="lg"
            color={getStatusColor(submission.validation_status)}
            leftSection={getStatusIcon(submission.validation_status)}
          >
            {submission.validation_status}
          </Badge>
        </Group>

        {/* Title section with icon */}
        <Group mb="xl" align="center">
          <ThemeIcon size={50} radius="md" color="blue">
            <IconTicket size={30} />
          </ThemeIcon>
          <Box>
            <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
              Kaizen Tracking Detail
            </Text>
            <Title order={2}>{submission.kaizen_title || "Untitled Kaizen"}</Title>
            <Group spacing="xs">
              <Badge color="blue" size="sm">
                {submission.ticket_number}
              </Badge>
              <Badge color="gray" size="sm">
                {submission.kaizen_type}
              </Badge>
              {submission.is_implemented && (
                <Badge color="green" size="sm">
                  Implemented
                </Badge>
              )}
            </Group>
          </Box>
        </Group>

        <Divider mb="xl" />

        {/* Main content grid */}
        <SimpleGrid cols={1} spacing="xl">
          {/* Submission details card */}
          <Paper p="md" withBorder radius="md" shadow="xs">
            <Title order={4} mb="lg">
              Submission Information
            </Title>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Group noWrap align="flex-start">
                <ThemeIcon size={36} radius="md" color="blue" variant="light">
                  <IconUser size={20} />
                </ThemeIcon>
                <div>
                  <Text size="sm" color="dimmed">
                    Suggested By
                  </Text>
                  <Text size="md" weight={500}>
                    {submission.pic_name}
                  </Text>
                </div>
              </Group>

              <Group noWrap align="flex-start">
                <ThemeIcon size={36} radius="md" color="indigo" variant="light">
                  <IconBuilding size={20} />
                </ThemeIcon>
                <div>
                  <Text size="sm" color="dimmed">
                    Department
                  </Text>
                  <Text size="md" weight={500}>
                    {submission.department}
                  </Text>
                </div>
              </Group>

              <Group noWrap align="flex-start">
                <ThemeIcon size={36} radius="md" color="cyan" variant="light">
                  <IconCalendar size={20} />
                </ThemeIcon>
                <div>
                  <Text size="sm" color="dimmed">
                    Submission Date
                  </Text>
                  <Text size="md" weight={500}>
                    {formatDate(submission.submission_date)}
                  </Text>
                </div>
              </Group>

              <Group noWrap align="flex-start">
                <ThemeIcon size={36} radius="md" color="grape" variant="light">
                  <IconTag size={20} />
                </ThemeIcon>
                <div>
                  <Text size="sm" color="dimmed">
                    Kaizen Type
                  </Text>
                  <Text size="md" weight={500}>
                    {submission.kaizen_type}
                  </Text>
                </div>
              </Group>
            </SimpleGrid>
          </Paper>

          {/* Description sections */}
          <Paper p="md" withBorder radius="md" shadow="xs">
            <Title order={4} mb="md">
              Background
            </Title>
            <Text>{submission.background}</Text>
          </Paper>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <Paper p="md" withBorder radius="md" shadow="xs">
              <Title order={4} mb="md">
                Before Implementation
              </Title>
              <Text>{submission.before_description}</Text>
            </Paper>

            <Paper p="md" withBorder radius="md" shadow="xs">
              <Title order={4} mb="md">
                After Implementation
              </Title>
              <Text>{submission.after_description}</Text>
            </Paper>
          </SimpleGrid>

          <Paper p="md" withBorder radius="md" shadow="xs">
            <Title order={4} mb="md">
              Benefits
            </Title>
            <Text>{submission.benefits}</Text>
          </Paper>

          {/* Photos section with tabs */}
          {((submission.photos_before && submission.photos_before.length > 0) ||
            (submission.photos_after && submission.photos_after.length > 0)) && (
            <Paper p="md" withBorder radius="md" shadow="xs">
              <Group mb="md">
                <ThemeIcon size={28} radius="md" color="blue">
                  <IconPhoto size={18} />
                </ThemeIcon>
                <Title order={4}>Implementation Photos</Title>
              </Group>

              <Tabs value={activeTab} onChange={setActiveTab}>
                <Tabs.List>
                  <Tabs.Tab value="before" leftSection={<IconPhotoPlus size={16} />}>
                    Before
                  </Tabs.Tab>
                  <Tabs.Tab value="after" leftSection={<IconPhotoCheck size={16} />}>
                    After
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="before" pt="md">
                  {submission.photos_before && submission.photos_before.length > 0 ? (
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      {submission.photos_before.map((url, index) => {
                        const fullUrl = `${api.defaults.baseURL.replace("/api", "")}${url}`
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
                    <Center p="xl">
                      <Text color="dimmed">No before photos available</Text>
                    </Center>
                  )}
                </Tabs.Panel>

                <Tabs.Panel value="after" pt="md">
                  {submission.photos_after && submission.photos_after.length > 0 ? (
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      {submission.photos_after.map((url, index) => {
                        const fullUrl = `${api.defaults.baseURL.replace("/api", "")}${url}`
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
                    <Center p="xl">
                      <Text color="dimmed">No after photos available</Text>
                    </Center>
                  )}
                </Tabs.Panel>
              </Tabs>
            </Paper>
          )}

          {/* Status timeline */}
          <Paper p="md" withBorder radius="md" shadow="xs">
            <Title order={4} mb="lg">
              Status Timeline
            </Title>

            <Timeline
              active={
                submission.validation_status === "Pending"
                  ? 0
                  : submission.validation_status === "On Checking Progress"
                    ? 1
                    : submission.validation_status === "Pass OK" || submission.validation_status === "Failed"
                      ? 2
                      : 0
              }
              bulletSize={24}
              lineWidth={2}
            >
              <Timeline.Item
                bullet={<IconTicket size={12} />}
                title="Submitted"
                lineVariant={submission.validation_status !== "Pending" ? "solid" : "dashed"}
              >
                <Text color="dimmed" size="sm">
                  Kaizen proposal submitted
                </Text>
                <Text size="xs" mt={4} color="blue">
                  {formatDate(submission.createdAt)}
                </Text>
              </Timeline.Item>

              <Timeline.Item
                bullet={<IconClock size={12} />}
                title="Under Review"
                lineVariant={
                  submission.validation_status === "Pass OK" || submission.validation_status === "Failed"
                    ? "solid"
                    : "dashed"
                }
              >
                <Text color="dimmed" size="sm">
                  Technical team is reviewing the submission
                </Text>
                {submission.validation_status !== "Pending" && (
                  <Text size="xs" mt={4} color="blue">
                    In progress
                  </Text>
                )}
              </Timeline.Item>

              <Timeline.Item
                title={
                  submission.validation_status === "Failed" ? "Review Complete - Failed" : "Review Complete - Passed"
                }
                bullet={submission.validation_status === "Failed" ? <IconX size={12} /> : <IconCheck size={12} />}
                color={submission.validation_status === "Failed" ? "red" : "green"}
              >
                <Text color="dimmed" size="sm">
                  {submission.validation_status === "Failed"
                    ? "The submission did not pass validation"
                    : submission.validation_status === "Pass OK"
                      ? "The submission passed validation"
                      : "Awaiting final review"}
                </Text>
                {(submission.validation_status === "Pass OK" || submission.validation_status === "Failed") && (
                  <Text size="xs" mt={4} color={submission.validation_status === "Failed" ? "red" : "green"}>
                    {formatDate(submission.updatedAt)}
                  </Text>
                )}
              </Timeline.Item>
            </Timeline>
          </Paper>

          {/* Test validation section */}
          {submission.test_date || submission.test_quantity || submission.test_result ? (
            <Paper p="md" withBorder radius="md" shadow="xs">
              <Group mb="md">
                <ThemeIcon size={28} radius="md" color="green">
                  <IconCheck size={18} />
                </ThemeIcon>
                <Title order={4}>Test Validation</Title>
              </Group>

              <Stack spacing="md">
                {submission.test_date && (
                  <Group>
                    <Text fw={500} w={120}>
                      Test Date:
                    </Text>
                    <Text>{formatDate(submission.test_date)}</Text>
                  </Group>
                )}

                {submission.test_quantity && (
                  <Group>
                    <Text fw={500} w={120}>
                      Test Quantity:
                    </Text>
                    <Text>{submission.test_quantity}</Text>
                  </Group>
                )}

                {submission.test_result && (
                  <>
                    <Group>
                      <Text fw={500} w={120}>
                        Test Result:
                      </Text>
                    </Group>
                    <Paper p="xs" withBorder bg="gray.0">
                      <Text>{submission.test_result}</Text>
                    </Paper>
                  </>
                )}
              </Stack>
            </Paper>
          ) : null}
        </SimpleGrid>

        <Divider my="xl" />

        {/* Action buttons */}
        <Group position="center" mt="xl">
          <Button
            variant="outline"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate("/kaizen/submission")}
          >
            Back to Menu
          </Button>

          <Button
            color="green"
            leftSection={<IconEdit size={16} />}
            onClick={() => navigate(`/kaizen/submission/form/${ticket}`)}
          >
            Edit Submission
          </Button>
        </Group>
      </Card>
    </Container>
  )
}
