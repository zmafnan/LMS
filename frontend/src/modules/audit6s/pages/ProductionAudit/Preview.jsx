"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Card, Title, Text, Stack, Group, Badge, Image, Button, Paper, SimpleGrid } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import jsPDF from "jspdf"
import "jspdf-autotable"
import api from "../../services/api"
import { IconDownload } from "@tabler/icons-react"

export default function ProductionAuditPreview() {
  const { id } = useParams()
  const [audit, setAudit] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const response = await api.get(`/production-audits/${id}`)
        setAudit(response.data)
      } catch (error) {
        notifications.show({
          title: "Error",
          message: "Failed to fetch audit data",
          color: "red",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAudit()
  }, [id])


  if (loading || !audit) {
    return <Text>Loading...</Text>
  }

  const ScoreSection = ({ title, score, description }) => (
    <Paper shadow="xs" p="md" mb="md">
      <Title order={4} mb="xs">
        {title}
      </Title>
      <Text size="sm" c="dimmed" mb="md">
        {description}
      </Text>
      <Badge size="lg" color={score >= 4 ? "green" : score >= 3 ? "yellow" : "red"}>
        {score}
      </Badge>
    </Paper>
  )

  // Helper function to resolve photo URL
  const getPhotoUrl = (photo) => {
    if (!photo) return "/placeholder.svg"
    if (photo.startsWith("http://") || photo.startsWith("https://") || photo.startsWith("data:")) {
      return photo
    }
    let baseUrl = api.defaults.baseURL || ""
    const apiIndex = baseUrl.indexOf("/api")
    if (apiIndex !== -1) {
      baseUrl = baseUrl.substring(0, apiIndex)
    } else {
      baseUrl = ""
    }
    const cleanPath = photo.startsWith("/") ? photo : `/${photo}`
    return `${baseUrl}${cleanPath}`
  }

  const downloadPdf = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    })

    // Title
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text("LAPORAN AUDIT 6S - PRODUCTION", 14, 15)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 21)

    // Info Table
    const infoData = [
      ["Department:", audit.Department?.name || "N/A", "Audit Date:", new Date(audit.audit_date).toLocaleDateString()],
      ["Auditor Name:", audit.auditor_name || "N/A", "Lean Facilitator:", audit.lean_facilitator_name || "N/A"]
    ]

    doc.autoTable({
      startY: 25,
      head: [],
      body: infoData,
      theme: "plain",
      styles: { cellPadding: 1, fontSize: 10 },
      columnStyles: {
        0: { fontStyle: "bold", width: 35 },
        1: { width: 95 },
        2: { fontStyle: "bold", width: 35 },
        3: { width: 95 }
      }
    })

    // Scores
    const scores = [
      ["1. SORT", audit.sort_score, "Pisahkan dan hilangkan segala sesuatu yang tidak diperlukan di area kerja"],
      ["2. SET IN ORDER", audit.set_in_order_score, "Susun dan tempatkan dokumen dan perlengkapan kerja pada tempatnya"],
      ["3. SHINE", audit.shine_score, "Susun dan tempatkan dokumen dan perlengkapan kerja pada tempatnya"],
      ["4. STANDARDIZE", audit.standardize_score, "Susun dan tempatkan dokumen dan perlengkapan kerja pada tempatnya"],
      ["5. SUSTAIN", audit.sustain_score, "Susun dan tempatkan dokumen dan perlengkapan kerja pada tempatnya"],
      ["6. SAFETY", audit.safety_score, "Susun dan tempatkan dokumen dan perlengkapan kerja pada tempatnya"]
    ]

    const averageScore = ((
      (audit.sort_score || 0) +
      (audit.set_in_order_score || 0) +
      (audit.shine_score || 0) +
      (audit.standardize_score || 0) +
      (audit.sustain_score || 0) +
      (audit.safety_score || 0)
    ) / 6).toFixed(2)

    const scoreRows = scores.map(s => [s[0], s[1], s[2]])
    scoreRows.push([
      { content: "FINAL AVERAGE SCORE", colSpan: 1, styles: { fontStyle: "bold", fillColor: [230, 240, 255] } },
      { content: averageScore, styles: { fontStyle: "bold", fillColor: [230, 240, 255] } },
      { content: "", styles: { fillColor: [230, 240, 255] } }
    ])

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 8,
      head: [["Category", "Score", "Description"]],
      body: scoreRows,
      theme: "grid",
      styles: { fontSize: 9 },
      columnStyles: {
        0: { fontStyle: "bold", width: 45 },
        1: { halign: "center", width: 20 },
        2: { width: 200 }
      }
    })

    // Findings
    const findingsData = [
      ["Previous Findings:", audit.previous_findings || "No findings recorded"],
      ["Current Findings:", audit.current_findings || "No findings recorded"]
    ]

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 8,
      head: [["Type", "Findings Details"]],
      body: findingsData,
      theme: "grid",
      styles: { fontSize: 9 },
      columnStyles: {
        0: { fontStyle: "bold", width: 45 },
        1: { width: 220 }
      }
    })

    // Signatures
    const sigY = doc.lastAutoTable.finalY + 10
    
    if (audit.auditor_signature) {
      try {
        doc.addImage(audit.auditor_signature, "PNG", 20, sigY + 5, 40, 15)
      } catch (e) {
        console.error("Auditor signature image draw failed", e)
      }
    }
    if (audit.facilitator_signature) {
      try {
        doc.addImage(audit.facilitator_signature, "PNG", 110, sigY + 5, 40, 15)
      } catch (e) {
        console.error("Facilitator signature image draw failed", e)
      }
    }
    if (audit.department_signature) {
      try {
        doc.addImage(audit.department_signature, "PNG", 200, sigY + 5, 40, 15)
      } catch (e) {
        console.error("Department head signature image draw failed", e)
      }
    }

    doc.setFont("helvetica", "bold")
    doc.text("Auditor", 40, sigY + 25, { align: "center" })
    doc.text("Facilitator", 130, sigY + 25, { align: "center" })
    doc.text("Department Head", 220, sigY + 25, { align: "center" })

    doc.save(`Audit_Report_Production_${audit.Department?.name || "Dept"}_${new Date(audit.audit_date).toISOString().slice(0, 10)}.pdf`)
  }
  return (
    <Card shadow="sm" padding="lg">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Audit Report</Title>
        <Button leftSection={<IconDownload size={14} />} onClick={downloadPdf}>
          Download PDF
        </Button>
      </Group>

      <div id="pdf-content">
        <Stack spacing="xl">
          <Card withBorder>
            <Title order={3} mb="md">
              Audit Information
            </Title>
            <Stack>
              <Group>
                <Text fw={500}>Department:</Text>
                <Text>{audit.Department?.name}</Text>
              </Group>
              <Group>
                <Text fw={500}>Audit Date:</Text>
                <Text>{new Date(audit.audit_date).toLocaleDateString()}</Text>
              </Group>
              <Group>
                <Text fw={500}>Auditor:</Text>
                <Text>{audit.auditor_name}</Text>
              </Group>
              <Group>
                <Text fw={500}>Lean Facilitator:</Text>
                <Text>{audit.lean_facilitator_name}</Text>
              </Group>
            </Stack>
          </Card>

          <Card withBorder>
            <Title order={3} mb="md">
              Scores
            </Title>
            <Stack>
              <ScoreSection
                title="1. SORT"
                score={audit.sort_score}
                description="Pisahkan dan hilangkan segala sesuatu yang tidak diperlukan di area kerja"
              />
              <ScoreSection
                title="2. SET IN ORDER"
                score={audit.set_in_order_score}
                description="Susun dan tempatkan dokumen dan perlengkapan kerja pada tempatnya"
              />
              <ScoreSection
                title="3. SHINE"
                score={audit.shine_score}
                description="Susun dan tempatkan dokumen dan perlengkapan kerja pada tempatnya"
              />
              <ScoreSection
                title="4. STANDARDIZE"
                score={audit.standardize_score}
                description="Susun dan tempatkan dokumen dan perlengkapan kerja pada tempatnya"
              />
              <ScoreSection
                title="5. SUSTAIN"
                score={audit.sustain_score}
                description="Susun dan tempatkan dokumen dan perlengkapan kerja pada tempatnya"
              />
              <ScoreSection
                title="6. SAFETY"
                score={audit.safety_score}
                description="Susun dan tempatkan dokumen dan perlengkapan kerja pada tempatnya"
              />

              <Paper shadow="xs" p="md">
                <Title order={3}>Final Score</Title>
                <Badge size="xl" color={audit.final_score >= 4 ? "green" : audit.final_score >= 3 ? "yellow" : "red"}>
                  {(
                    (audit.sort_score +
                      audit.set_in_order_score +
                      audit.shine_score +
                      audit.standardize_score +
                      audit.sustain_score +
                      audit.safety_score) /
                    6
                  ).toFixed(2)}
                </Badge>
              </Paper>
            </Stack>
          </Card>

          <Card withBorder>
            <Title order={3} mb="md">
              Findings
            </Title>
            <Stack>
              <div>
                <Text fw={500} mb="xs">
                  Previous Findings:
                </Text>
                <Text>{audit.previous_findings}</Text>
              </div>
              <div>
                <Text fw={500} mb="xs">
                  Current Findings:
                </Text>
                <Text>{audit.current_findings}</Text>
              </div>
            </Stack>
          </Card>

          <Card withBorder>
            <Title order={3} mb="md">
              Photos
            </Title>
            <SimpleGrid cols={2} spacing="md">
              {(() => {
                try {
                  // Safely parse photo URLs
                  const photoUrls =
                    typeof audit.photo_url === "string" ? JSON.parse(audit.photo_url || "[]") : audit.photo_url || []

                  console.log("Photo URLs:", photoUrls) // Debug log

                  return photoUrls.map((url, index) => (
                    <div key={index}>
                      <Image
                        src={getPhotoUrl(url)}
                        alt={`Finding ${index + 1}`}
                        radius="md"
                        onError={(e) => {
                          console.error(`Failed to load image: ${getPhotoUrl(url)}`)
                        }}
                      />
                      <Text size="sm" mt="xs" c="dimmed">
                        Finding {index + 1}
                      </Text>
                    </div>
                  ))
                } catch (error) {
                  console.error("Error displaying photos:", error)
                  return <Text c="red">Error displaying photos</Text>
                }
              })()}
            </SimpleGrid>
          </Card>

          <Card withBorder>
            <Title order={3} mb="md">
              Signatures
            </Title>
            <Group grow>
              {audit.auditor_signature && (
                <div>
                  <Text fw={500} mb="xs">
                    Auditor:
                  </Text>
                  <Image
                    src={audit.auditor_signature || "/placeholder.svg"}
                    alt="Auditor Signature"
                    style={{ border: "1px solid #eee" }}
                  />
                </div>
              )}
              {audit.facilitator_signature && (
                <div>
                  <Text fw={500} mb="xs">
                    Facilitator:
                  </Text>
                  <Image
                    src={audit.facilitator_signature || "/placeholder.svg"}
                    alt="Facilitator Signature"
                    style={{ border: "1px solid #eee" }}
                  />
                </div>
              )}
              {audit.department_signature && (
                <div>
                  <Text fw={500} mb="xs">
                    Department Head:
                  </Text>
                  <Image
                    src={audit.department_signature || "/placeholder.svg"}
                    alt="Department Head Signature"
                    style={{ border: "1px solid #eee" }}
                  />
                </div>
              )}
            </Group>
          </Card>
        </Stack>
      </div>
    </Card>
  )
}
