"use client"

import { useState } from "react"
import {
  Card,
  Title,
  TextInput,
  Button,
  Group,
  Text,
  Paper,
  Stack,
  Container,
  Box,
  ThemeIcon,
  Divider,
  rem,
  useMantineTheme,
} from "@mantine/core"
import { IconTicket, IconClipboardCheck, IconArrowRight, IconInfoCircle } from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"
import { notifications } from "@mantine/notifications"
import api from "../../services/api"

export default function KaizenTracking() {
  const [ticketNumber, setTicketNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()
  const theme = useMantineTheme()

  const handleSearch = async () => {
    if (!ticketNumber.trim()) {
      notifications.show({
        title: "Error",
        message: "Please enter a ticket number",
        color: "red",
      })
      return
    }

    setLoading(true)
    try {
      await api.get(`/submissions/ticket/${ticketNumber}`)
      notifications.show({
        title: "Success",
        message: "Ticket found! Redirecting to details...",
        color: "green",
      })
      navigate(`/kaizen/tracking/${ticketNumber}`)
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Ticket not found. Please check the ticket number and try again.",
        color: "red",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <Container size="md" py="xl">
      <Card
        shadow="md"
        padding="xl"
        radius="lg"
        withBorder
        style={{
          borderColor: theme.colors.blue[3],
          overflow: "hidden",
        }}
      >
        <Box mb="xl" style={{ textAlign: "center" }}>
          <ThemeIcon
            size={100}
            radius="md"
            color="blue.6"
            mb="md"
            style={{
              margin: "0 auto",
              // Using CSS animation directly instead of keyframes
              animation: "pulse 2s infinite ease-in-out",
            }}
          >
            <IconClipboardCheck size={60} />
          </ThemeIcon>
          <Title order={1} fw={700} mb="xs">
            Track Your Kaizen
          </Title>
          <Text c="dimmed" size="lg" mb="lg">
            Monitor the progress and status of your continuous improvement initiatives
          </Text>
          <Divider mb="xl" />
        </Box>

        <Paper
          p="xl"
          withBorder
          radius="md"
          mb="xl"
          shadow="md"
          style={{
            borderColor: focused ? theme.colors.blue[5] : theme.colors.gray[3],
            transition: "all 0.3s ease",
            transform: focused ? "translateY(-3px)" : "none",
            backgroundColor: focused ? "#f8fafc" : "white",
          }}
        >
          <Stack spacing="lg">
            <Group position="center" mb="md">
              <ThemeIcon size={60} radius="xl" color="blue.5" variant="light">
                <IconTicket size={34} />
              </ThemeIcon>
            </Group>

            <Text ta="center" size="xl" fw={500} mb="md">
              Enter your ticket number to check status
            </Text>

            <TextInput
              placeholder="Enter ticket number (e.g., KZ-202405-0001)"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyPress={handleKeyPress}
              size="xl"
              radius="md"
              styles={{
                input: {
                  fontSize: rem(18),
                  fontWeight: 500,
                  letterSpacing: "0.5px",
                  transition: "all 0.2s ease",
                  "&:focus": {
                    borderColor: theme.colors.blue[5],
                    boxShadow: "0 0 0 2px rgba(34, 139, 230, 0.2)", // Hardcoded rgba value instead of using theme.fn.rgba
                  },
                },
              }}
              rightSection={
                <Button
                  onClick={handleSearch}
                  loading={loading}
                  disabled={!ticketNumber.trim()}
                  size="md"
                  radius="md"
                  color="blue.6"
                  rightSection={!loading && <IconArrowRight size={16} />}
                  style={{ width: rem(120) }}
                >
                  {loading ? "Searching..." : "Track"}
                </Button>
              }
              rightSectionWidth={130}
            />

            <Text c="dimmed" size="sm" ta="center">
              Format: KZ-YYYYMM-XXXX (e.g., KZ-202405-0001)
            </Text>
          </Stack>
        </Paper>

        <Paper p="md" withBorder radius="md" bg="blue.0">
          <Group spacing="md">
            <ThemeIcon size={32} radius="xl" color="blue" variant="light">
              <IconInfoCircle size={20} />
            </ThemeIcon>
            <Box>
              <Text fw={500}>Don't have a ticket number?</Text>
              <Text size="sm">
                You can submit a new Kaizen proposal from the{" "}
                <Text
                  component="span"
                  c="blue"
                  fw={500}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/kaizen/submission/form")}
                >
                  submission page
                </Text>
                .
              </Text>
            </Box>
          </Group>
        </Paper>
      </Card>

      {/* Add global style for pulse animation */}
      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </Container>
  )
}
