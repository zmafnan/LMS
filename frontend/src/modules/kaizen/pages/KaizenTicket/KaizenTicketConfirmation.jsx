"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Container, Card, Title, Text, Group, Badge, Stack, Button, Center, Loader, Divider, Box } from "@mantine/core"
import { IconTicket, IconBuilding, IconCalendar, IconArrowLeft, IconCamera, IconCheck } from "@tabler/icons-react"
import { notifications } from "@mantine/notifications"
import html2canvas from "html2canvas"
import api from "../../services/api"

export default function KaizenTicketConfirmation() {
  const { ticket } = useParams()
  const navigate = useNavigate()
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const ticketRef = useRef(null)

  useEffect(() => {
    if (ticket) {
      fetchSubmission()
    } else {
      setLoading(false)
      notifications.show({
        title: "Error",
        message: "No ticket number provided",
        color: "red",
      })
      setTimeout(() => navigate("/kaizen/tracking"), 2000)
    }
  }, [ticket, navigate])

  const fetchSubmission = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/submissions/ticket/${ticket}`)
      setSubmission(response.data)
    } catch (error) {
      console.error("API Error:", error)
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const captureTicket = async () => {
    if (ticketRef.current) {
      try {
        const canvas = await html2canvas(ticketRef.current)
        const image = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.href = image
        link.download = `kaizen-ticket-${ticket}.png`
        link.click()

        notifications.show({
          title: "Success",
          message: "Screenshot saved",
          color: "green",
        })
      } catch (error) {
        console.error("Screenshot error:", error)
        notifications.show({
          title: "Error",
          message: "Failed to capture screenshot",
          color: "red",
        })
      }
    }
  }

  if (loading) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader size="lg" />
      </Center>
    )
  }

  if (!submission) {
    return (
      <Center style={{ height: "100vh" }}>
        <Stack align="center" spacing="md">
          <Text>Submission not found</Text>
          <Button onClick={() => navigate("/kaizen/tracking")}>Back</Button>
        </Stack>
      </Center>
    )
  }

  return (
    <Container size="100%" p="xs" style={{ maxWidth: "100%" }}>
      <div ref={ticketRef}>
        <Card shadow="sm" padding="md" radius="md" withBorder>
          {/* Centered Ticket Icon and Title */}
          <Box mb="md" style={{ textAlign: "center" }}>
            <IconTicket size={48} color="#228be6" style={{ marginBottom: 8 }} />
            <Title order={2} ta="center" mb="xs">
              Kaizen Submission
            </Title>
            <Title order={3} ta="center" mb="xs">
              Confirmation
            </Title>
            <Text size="md" c="dimmed" ta="center">
              Your Kaizen has been successfully submitted!
            </Text>
          </Box>

          {/* Ticket Information Card */}
          <Box p="md" mb="md" bg="blue.0" style={{ borderRadius: "8px" }}>
            <Title order={4} mb="md" ta="center">
              Ticket Information
            </Title>

            <Center mb="md">
              <Badge size="xl" color="blue" p="md">
                {submission.ticket_number}
              </Badge>
            </Center>

            <Divider my="sm" />

            {/* PIC Info */}
            <Text fw={500} size="md" mb="xs">
              {submission.pic_name}
            </Text>

            {/* Department and Date in two columns */}
            <Group position="apart" mb="xs">
              <Group spacing="xs" noWrap>
                <IconBuilding size={16} />
                <Text size="sm">Department:</Text>
              </Group>
              <Text size="sm">{submission.department}</Text>
            </Group>

            <Group position="apart" mb="xs">
              <Group spacing="xs" noWrap>
                <IconCalendar size={16} />
                <Text size="sm">Submission Date:</Text>
              </Group>
              <Text size="sm">{formatDate(submission.submission_date)}</Text>
            </Group>

            <Divider my="sm" />

            <Text fw={500} size="sm" mb="xs">
              Status:
            </Text>
            <Badge fullWidth size="md" color="yellow">
              PENDING REVIEW
            </Badge>
          </Box>

          {/* Next Steps - Simplified */}
          <Stack spacing="xs">
            <Group spacing="xs" noWrap>
              <IconCheck size={16} color="green" />
              <Text size="sm">Submission recorded successfully</Text>
            </Group>
            <Group spacing="xs" noWrap>
              <IconCheck size={16} color="green" />
              <Text size="sm">Keep this ticket number for reference</Text>
            </Group>
          </Stack>
        </Card>
      </div>

      {/* Action Buttons - Simplified */}
      <Group position="center" mt="md" spacing="xs">
        <Button
          variant="outline"
          leftIcon={<IconArrowLeft size={16} />}
          onClick={() => navigate("/kaizen/submission")}
          size="sm"
          compact
        >
          Back
        </Button>
        <Button color="blue" leftIcon={<IconCamera size={16} />} onClick={captureTicket} size="sm" compact>
          Save Screenshot
        </Button>
      </Group>
    </Container>
  )
}
