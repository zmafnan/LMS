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
  Center,
  Loader,
  Container,
  Tabs,
  ActionIcon,
  Box,
  Divider,
  Grid,
  ThemeIcon,
} from "@mantine/core"
import {
  IconUser,
  IconBuilding,
  IconCalendar,
  IconArrowLeft,
  IconPhotoPlus,
  IconPhotoCheck,
  IconChartBar,
  IconTag,
  IconUsers,
  IconExternalLink,
  IconAward,
  IconBookmark,
  IconCheck,
} from "@tabler/icons-react"
import { notifications } from "@mantine/notifications"
import api from "../../services/api"

export default function KaizenMasterDataDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchSubmission()
    } else {
      setLoading(false)
      notifications.show({
        title: "Error",
        message: "No submission ID provided. Redirecting to master data.",
        color: "red",
      })
      setTimeout(() => {
        navigate("/kaizen/master-data")
      }, 1500)
    }
  }, [id, navigate])

  const fetchSubmission = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/submissions/${id}`)

      // Only allow viewing Pass OK submissions
      if (response.data.validation_status !== "Pass OK") {
        notifications.show({
          title: "Access Denied",
          message: "This Kaizen is not available in master data.",
          color: "red",
        })
        navigate("/kaizen/master-data")
        return
      }

      setSubmission(response.data)
    } catch (error) {
      console.error("API Error:", error)
      notifications.show({
        title: "Error",
        message: "Failed to fetch submission details",
        color: "red",
      })
      navigate("/kaizen/master-data")
    } finally {
      setLoading(false)
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
          <Button onClick={() => navigate("/kaizen/master-data")}>Back to Master Data</Button>
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
            <IconBookmark size={32} />
            <Title order={2}>Kaizen Master Data Detail</Title>
          </Group>
          <Badge size="xl" color="green" leftSection={<IconCheck size={16} />}>
            Pass OK
          </Badge>
        </Group>

        <Paper p="md" withBorder radius="md" mb="xl" bg="green.0">
          <Title order={4} mb="md">
            Successful Kaizen Implementation
          </Title>

          <Title order={5} mb="md">
            {submission.kaizen_title}
          </Title>

          <Text size="sm" c="dimmed" mb="md">
            <IconBookmark size={16} style={{ marginRight: 4, verticalAlign: "middle" }} />
            This Kaizen has been validated and approved for implementation. You can use this as inspiration for your own
            department.
          </Text>

          <Stack spacing="md">
            <Group>
              <IconUser size={20} />
              <Text fw={500}>Suggested By:</Text>
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

            {submission.point > 0 && (
              <Group>
                <IconAward size={20} />
                <Text fw={500}>Points Awarded:</Text>
                <Badge color="orange" size="lg">
                  {submission.point}
                </Badge>
              </Group>
            )}
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
            Implementation Photos
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

        {/* Impact Metrics Display (Read-only) */}
        {(submission.pph_before ||
          submission.pph_after ||
          submission.tct_before ||
          submission.tct_after ||
          submission.rft_before ||
          submission.rft_after ||
          submission.saving_cost) && (
          <Paper p="md" withBorder radius="md" mb="xl" bg="blue.0">
            <Title order={4} mb="lg">
              <IconChartBar size={20} style={{ marginRight: 8 }} />
              Impact Metrics
            </Title>

            <Grid>
              {submission.pph_before && (
                <Grid.Col span={6}>
                  <Text fw={500}>PPH Before:</Text>
                  <Text size="lg">{submission.pph_before}</Text>
                </Grid.Col>
              )}
              {submission.pph_after && (
                <Grid.Col span={6}>
                  <Text fw={500}>PPH After:</Text>
                  <Text size="lg">{submission.pph_after}</Text>
                </Grid.Col>
              )}
              {submission.tct_before && (
                <Grid.Col span={6}>
                  <Text fw={500}>TCT Before (seconds):</Text>
                  <Text size="lg">{submission.tct_before}</Text>
                </Grid.Col>
              )}
              {submission.tct_after && (
                <Grid.Col span={6}>
                  <Text fw={500}>TCT After (seconds):</Text>
                  <Text size="lg">{submission.tct_after}</Text>
                </Grid.Col>
              )}
              {submission.rft_before && (
                <Grid.Col span={6}>
                  <Text fw={500}>RFT Before (%):</Text>
                  <Text size="lg">{submission.rft_before}%</Text>
                </Grid.Col>
              )}
              {submission.rft_after && (
                <Grid.Col span={6}>
                  <Text fw={500}>RFT After (%):</Text>
                  <Text size="lg">{submission.rft_after}%</Text>
                </Grid.Col>
              )}
              {submission.saving_cost && (
                <Grid.Col span={12}>
                  <Text fw={500}>Cost Savings:</Text>
                  <Text size="lg">{submission.saving_cost}</Text>
                </Grid.Col>
              )}
            </Grid>

            {/* Calculate and show improvements */}
            {submission.pph_before && submission.pph_after && <Divider my="md" />}

            <Grid>
              {submission.pph_before && submission.pph_after && (
                <Grid.Col span={4}>
                  <Paper p="xs" bg="green.1" radius="md">
                    <Text size="sm" fw={500} c="green">
                      PPH Improvement
                    </Text>
                    <Text size="lg" fw={700} c="green">
                      +{(submission.pph_after - submission.pph_before).toFixed(2)}
                    </Text>
                  </Paper>
                </Grid.Col>
              )}
              {submission.rft_before && submission.rft_after && (
                <Grid.Col span={4}>
                  <Paper p="xs" bg="blue.1" radius="md">
                    <Text size="sm" fw={500} c="blue">
                      RFT Improvement
                    </Text>
                    <Text size="lg" fw={700} c="blue">
                      +{(submission.rft_after - submission.rft_before).toFixed(2)}%
                    </Text>
                  </Paper>
                </Grid.Col>
              )}
              {submission.tct_before && submission.tct_after && (
                <Grid.Col span={4}>
                  <Paper p="xs" bg="orange.1" radius="md">
                    <Text size="sm" fw={500} c="orange">
                      TCT Reduction
                    </Text>
                    <Text size="lg" fw={700} c="orange">
                      -{(submission.tct_before - submission.tct_after).toFixed(2)}s
                    </Text>
                  </Paper>
                </Grid.Col>
              )}
            </Grid>
          </Paper>
        )}

        {/* Test Validation Results (Read-only) */}
        {(submission.test_date || submission.test_quantity || submission.test_result) && (
          <Paper p="md" withBorder radius="md" mb="xl">
            <Group mb="md">
              <ThemeIcon size={28} radius="md" color="green">
                <IconCheck size={18} />
              </ThemeIcon>
              <Title order={4}>Validation Results</Title>
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
        )}

        <Group position="center" mt="xl">
          <Button
            variant="outline"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate("/kaizen/master-data")}
          >
            Back to Master Data
          </Button>

          <Button
            color="green"
            leftSection={<IconBookmark size={16} />}
            onClick={() => navigate("/kaizen/submission/form")}
          >
            Create Similar Kaizen
          </Button>
        </Group>
      </Card>
    </Container>
  )
}
