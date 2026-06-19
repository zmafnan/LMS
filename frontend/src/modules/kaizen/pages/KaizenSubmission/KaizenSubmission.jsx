"use client"

import { useState } from "react"
import { Card, Title, Text, Button, Paper, Stack, ThemeIcon, Container, SimpleGrid, Divider, Box } from "@mantine/core"
import {
  IconClipboardCheck,
  IconArrowRight,
  IconFileReport,
  IconSearch,
  IconTrophy,
  IconDatabase,
} from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"

export default function KaizenSubmission() {
  const navigate = useNavigate()
  const [hoveredCard, setHoveredCard] = useState(null)

  return (
    <Container size="md" py="xl">
      <Card shadow="md" padding="xl" radius="lg" withBorder>
        <Box mb="xl" style={{ textAlign: "center" }}>
          <ThemeIcon size={80} radius="md" color="blue.7" mb="md" style={{ margin: "0 auto" }}>
            <IconClipboardCheck size={48} />
          </ThemeIcon>
          <Title order={1} fw={700} mb="xs">
            Kaizen Improvement System
          </Title>
          <Text c="dimmed" size="lg" mb="lg">
            Continuous improvement starts here - Submit, track, or explore successful Kaizen initiatives
          </Text>
          <Divider mb="xl" />
        </Box>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
          <Paper
            p="xl"
            withBorder
            radius="md"
            shadow="md"
            style={{
              transition: "all 0.3s ease",
              transform: hoveredCard === "submit" ? "translateY(-5px)" : "none",
              backgroundColor: hoveredCard === "submit" ? "#f0f9ff" : "white",
            }}
            onMouseEnter={() => setHoveredCard("submit")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <Stack align="center" spacing="md">
              <ThemeIcon size={80} radius="xl" color="blue.7" variant="light">
                <IconFileReport size={48} />
              </ThemeIcon>

              <Title order={3} ta="center" fw={700}>
                Submit Kaizen
              </Title>

              <Text ta="center" size="sm">
                Document your improvement idea and contribute to our culture of excellence
              </Text>

              <Button
                fullWidth
                mt="md"
                size="md"
                color="blue.7"
                rightSection={<IconArrowRight size={16} />}
                onClick={() => navigate("/kaizen/submission/form")}
                style={{
                  transition: "all 0.2s ease",
                  transform: hoveredCard === "submit" ? "scale(1.03)" : "none",
                }}
              >
                Create New Kaizen
              </Button>
            </Stack>
          </Paper>

          <Paper
            p="xl"
            withBorder
            radius="md"
            shadow="md"
            style={{
              transition: "all 0.3s ease",
              transform: hoveredCard === "track" ? "translateY(-5px)" : "none",
              backgroundColor: hoveredCard === "track" ? "#f0fff4" : "white",
            }}
            onMouseEnter={() => setHoveredCard("track")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <Stack align="center" spacing="md">
              <ThemeIcon size={80} radius="xl" color="green.7" variant="light">
                <IconSearch size={48} />
              </ThemeIcon>

              <Title order={3} ta="center" fw={700}>
                Track Progress
              </Title>

              <Text ta="center" size="sm">
                Monitor the status and implementation of your Kaizen initiatives
              </Text>

              <Button
                fullWidth
                mt="md"
                size="md"
                color="green.7"
                rightSection={<IconArrowRight size={16} />}
                onClick={() => navigate("/kaizen/tracking")}
                style={{
                  transition: "all 0.2s ease",
                  transform: hoveredCard === "track" ? "scale(1.03)" : "none",
                }}
              >
                View Kaizen Status
              </Button>
            </Stack>
          </Paper>

          <Paper
            p="xl"
            withBorder
            radius="md"
            shadow="md"
            style={{
              transition: "all 0.3s ease",
              transform: hoveredCard === "rankings" ? "translateY(-5px)" : "none",
              backgroundColor: hoveredCard === "rankings" ? "#fff4f0" : "white",
            }}
            onMouseEnter={() => setHoveredCard("rankings")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <Stack align="center" spacing="md">
              <ThemeIcon size={80} radius="xl" color="orange.7" variant="light">
                <IconTrophy size={48} />
              </ThemeIcon>

              <Title order={3} ta="center" fw={700}>
                Kaizen Rankings
              </Title>

              <Text ta="center" size="sm">
                See who's leading the continuous improvement initiative
              </Text>

              <Button
                fullWidth
                mt="md"
                size="md"
                color="orange.7"
                rightSection={<IconArrowRight size={16} />}
                onClick={() => navigate("/kaizen/rankings")}
                style={{
                  transition: "all 0.2s ease",
                  transform: hoveredCard === "rankings" ? "scale(1.03)" : "none",
                }}
              >
                View Rankings
              </Button>
            </Stack>
          </Paper>

          <Paper
            p="xl"
            withBorder
            radius="md"
            shadow="md"
            style={{
              transition: "all 0.3s ease",
              transform: hoveredCard === "master" ? "translateY(-5px)" : "none",
              backgroundColor: hoveredCard === "master" ? "#f0fdf4" : "white",
            }}
            onMouseEnter={() => setHoveredCard("master")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <Stack align="center" spacing="md">
              <ThemeIcon size={80} radius="xl" color="teal.7" variant="light">
                <IconDatabase size={48} />
              </ThemeIcon>

              <Title order={3} ta="center" fw={700}>
                Master Data
              </Title>

              <Text ta="center" size="sm">
                Browse successful Kaizen implementations for inspiration
              </Text>

              <Button
                fullWidth
                mt="md"
                size="md"
                color="teal.7"
                rightSection={<IconArrowRight size={16} />}
                onClick={() => navigate("/kaizen/master-data")}
                style={{
                  transition: "all 0.2s ease",
                  transform: hoveredCard === "master" ? "scale(1.03)" : "none",
                }}
              >
                Browse Kaizen
              </Button>
            </Stack>
          </Paper>
        </SimpleGrid>
      </Card>
    </Container>
  )
}
