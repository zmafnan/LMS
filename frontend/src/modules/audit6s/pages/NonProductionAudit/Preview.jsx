"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Card, Title, Text, Stack, Group, Badge, Image, Button, Paper, SimpleGrid } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import jsPDF from "jspdf"
import { applyPlugin } from "jspdf-autotable"
import api from "../../services/api"
import { IconDownload } from "@tabler/icons-react"

applyPlugin(jsPDF)

export default function NonProductionAuditPreview() {
  const { id } = useParams()
  const [audit, setAudit] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const response = await api.get(`/non-production-audits/${id}`)
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
    baseUrl = baseUrl.replace(/\/index\.php\/?$/, "")
    const cleanPath = photo.startsWith("/") ? photo : `/${photo}`
    return `${baseUrl}${cleanPath}`
  }
  const downloadPdf = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    })

    const marginX = 8
    const marginY = 6
    const contentWidth = 281
    const headerHeight = 15

    const auditDateFormatted = audit.audit_date
      ? new Date(audit.audit_date).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "-"

    const grandTotalScore = (
      ((Number(audit.sort_score) || 0) +
        (Number(audit.set_in_order_score) || 0) +
        (Number(audit.shine_score) || 0) +
        (Number(audit.standardize_score) || 0) +
        (Number(audit.sustain_score) || 0) +
        (Number(audit.safety_score) || 0)) /
      6
    ).toFixed(2)

    // Header layout matching TemplatePDFGENERATE6S/gen-pdf-non.html (60% | 25% | 15%)
    const titleWidth = contentWidth * 0.60
    const infoWidth = contentWidth * 0.25
    const ratingWidth = contentWidth - titleWidth - infoWidth

    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.3)

    // Header outer box & vertical dividers
    doc.rect(marginX, marginY, contentWidth, headerHeight)
    doc.line(marginX + titleWidth, marginY, marginX + titleWidth, marginY + headerHeight)
    doc.line(marginX + titleWidth + infoWidth, marginY, marginX + titleWidth + infoWidth, marginY + headerHeight)

    // Left Header: Main Title + horizontal divider + Audit Goal
    doc.line(marginX, marginY + 6.5, marginX + titleWidth, marginY + 6.5)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9.5)
    doc.text("CHECKLIST AUDIT 6S OFFICE/NON PRODUCTION", marginX + titleWidth / 2, marginY + 4.5, { align: "center" })

    doc.setFontSize(7)
    const goalLines = doc.splitTextToSize(
      "Audit Goal: Untuk Meng-Audit inisiatif dalam menyesuaikan dengan standar 6S, mengidentifikasi area dimana 6S dijaga dengan baik",
      titleWidth - 6
    )
    doc.text(goalLines, marginX + titleWidth / 2, marginY + 10.2, { align: "center" })

    // Middle Header: Area, Auditor, Periode
    const infoX = marginX + titleWidth + 2.5
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.text("Area:", infoX, marginY + 4.5)
    doc.setFont("helvetica", "normal")
    doc.text(String(audit.Department?.name || "-"), infoX + 13, marginY + 4.5)

    doc.setFont("helvetica", "bold")
    doc.text("Auditor:", infoX, marginY + 9)
    doc.setFont("helvetica", "normal")
    doc.text(String(audit.auditor_name || "-"), infoX + 13, marginY + 9)

    doc.setFont("helvetica", "bold")
    doc.text("Periode:", infoX, marginY + 13.5)
    doc.setFont("helvetica", "normal")
    doc.text(auditDateFormatted, infoX + 13, marginY + 13.5)

    // Right Header: Rating Legend
    const ratingX = marginX + titleWidth + infoWidth + 2.5
    doc.setFontSize(6.3)
    doc.setFont("helvetica", "normal")
    doc.text("1 = SANGAT TIDAK BAIK", ratingX, marginY + 3.8)
    doc.text("2 = TIDAK BAIK", ratingX, marginY + 7.2)
    doc.text("3 = BAIK", ratingX, marginY + 10.6)
    doc.text("4 = SANGAT BAIK", ratingX, marginY + 14)

    // Checklist Table matching gen-pdf-non.html
    const bodyRows = [
      // SORT
      [
        {
          content: "SORT\nPisahkan dan hilangkan segala sesuatu yang tidak diperlukan di area kerja",
          rowSpan: 4,
          styles: { fontStyle: "bold", valign: "middle" },
        },
        "Pisahkan barang-barang yang tidak ada hubungannya dengan pekerjaan di area kerja",
        { content: String(audit.sort_score ?? ""), rowSpan: 4, styles: { halign: "center", valign: "middle" } },
        { content: String(audit.previous_findings || ""), rowSpan: 4, styles: { halign: "center", valign: "middle" } },
      ],
      ["Barang yang tidak ada hubungan dengan pekerjaan disimpan pada tempatnya"],
      ["Tidak ada barang pribadi di atas dan dibawah meja"],
      ["Dokumen-dokumen yang berbeda diatas meja terdapat visual yang jelas"],

      // SET IN ORDER
      [
        {
          content: "SET IN ORDER\nSusun dan tempatkan dokumen dan perlengkapan kerja pada tempatnya",
          rowSpan: 4,
          styles: { fontStyle: "bold", valign: "middle" },
        },
        "Dokumen tersusun rapi",
        { content: String(audit.set_in_order_score ?? ""), rowSpan: 4, styles: { halign: "center", valign: "middle" } },
        { content: "", rowSpan: 4 },
      ],
      ["Dokumen disimpan pada tempatnya (bindex, odner)"],
      ["Perlengkapan kerja disusun secara rapi"],
      ["Perlengkapan kerja disusun pada tempatnya"],

      // SHINE
      [
        {
          content: "SHINE\nSegala sesuatu terjaga kebersihannya",
          rowSpan: 4,
          styles: { fontStyle: "bold", valign: "middle" },
        },
        "Lantai, dinding, meja bersih dari debu sampah dan sarang laba-laba",
        { content: String(audit.shine_score ?? ""), rowSpan: 4, styles: { halign: "center", valign: "middle" } },
        { content: "", rowSpan: 3 },
      ],
      ["Dokumen dan peralatan kerja bersih dari debu, sampah dan sarang laba-laba"],
      ["Tersedianya alat kebersihan disetiap area kerja dalam kondisi balk dan berfungsi (Kemoceng, dll)"],
      [
        "Kondisi Visual display Bersih dan tidak rusak",
        { content: "Temuan Sekarang", styles: { halign: "center", valign: "middle", fontStyle: "bold" } },
      ],

      // STANDARDIZED
      [
        {
          content: "STANDARDIZED\nTempatkan dokumen diarea yang sudah ditetapkan dengan jumlah sesuai batas minimal dan maximal",
          rowSpan: 4,
          styles: { fontStyle: "bold", valign: "middle" },
        },
        "Terdapat tempat dokumen",
        { content: String(audit.standardize_score ?? ""), rowSpan: 4, styles: { halign: "center", valign: "middle" } },
        { content: String(audit.current_findings || ""), rowSpan: 4, styles: { halign: "center", valign: "middle" } },
      ],
      ["Terdapat visual yang jelas pada tempat dokumen (bindex)"],
      ["Dokumen disimpan sesual kapasitas tempat dokumen (bindex)"],
      ["Tempat dokumen (bindex) dilempatkan dan disusun secara rapi"],

      // SUSTAIN
      [
        {
          content:
            "SUSTAIN\nTerus melakukan dan berupaya meningkatkan ke 4S sebelumnya. Disiplin, bermotivasi untuk terus melakukan kebiasaan - kebiasaan baik",
          rowSpan: 4,
          styles: { fontStyle: "bold", valign: "middle" },
        },
        "Adanya briefing harian/mingguan tentang 6S",
        { content: String(audit.sustain_score ?? ""), rowSpan: 4, styles: { halign: "center", valign: "middle" } },
        { content: "", rowSpan: 4 },
      ],
      ["Karyawan mengetahui dan memahami definisi 6S"],
      ["Improvement Temuan Sebelumnya"],
      ["Pastikan semua area kerja dalam keadaan rapi dan bersih"],

      // SAFETY
      [
        {
          content: "SAFETY\nPeduli keselamatan, kesehatan kerja serta menciptakan lingkungan kerja yang aman dan nyaman",
          rowSpan: 4,
          styles: { fontStyle: "bold", valign: "middle" },
        },
        "Kabel-kabel tertata rapi",
        { content: String(audit.safety_score ?? ""), rowSpan: 4, styles: { halign: "center", valign: "middle" } },
        { content: "", rowSpan: 4 },
      ],
      ["Kabel-kabel tertata rapi dan dalam kondisi bolk (kabel tidak terkelupas, dll)"],
      ["Jalur evakuasi tidak terhalang oleh apapun"],
      ["Pastikan benda-benda di area kerja diletakkan dalam posisi aman dan tidak berpotensi menimpa seseorang"],

      // Grand Total Score
      [
        { content: "Grand Total Score", colSpan: 2, styles: { halign: "right", fontStyle: "bold", valign: "middle" } },
        { content: grandTotalScore, styles: { halign: "center", fontStyle: "bold", valign: "middle" } },
        "",
      ],
    ]

    doc.autoTable({
      startY: marginY + headerHeight,
      margin: { left: marginX, right: marginX, bottom: 5 },
      tableWidth: contentWidth,
      rowPageBreak: "avoid",
      head: [["KATEGORI", "Standar Criteria", "Total Score", "Temuan Sebelumnya"]],
      body: bodyRows,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 6.3,
        cellPadding: 0.9,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.25,
        valign: "middle",
      },
      headStyles: {
        fillColor: [242, 242, 242],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        lineColor: [0, 0, 0],
        lineWidth: 0.25,
      },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.18 },
        1: { cellWidth: contentWidth * 0.50 },
        2: { cellWidth: contentWidth * 0.12, halign: "center" },
        3: { cellWidth: contentWidth * 0.20, halign: "center" },
      },
    })

    // Signatures Section (3 boxes on bottom right matching gen-pdf-non.html)
    const sigTopY = doc.lastAutoTable.finalY + 3
    const boxWidth = 52
    const boxHeight = 20
    const boxGap = 3
    const totalSigWidth = boxWidth * 3 + boxGap * 2
    const startSigX = marginX + contentWidth - totalSigWidth - 3

    const sigItems = [
      { label: "Auditor", image: audit.auditor_signature },
      { label: "Department", image: audit.department_signature },
      { label: "Fasilitator", image: audit.facilitator_signature },
    ]

    sigItems.forEach((item, idx) => {
      const boxX = startSigX + idx * (boxWidth + boxGap)
      doc.setDrawColor(0, 0, 0)
      doc.setLineWidth(0.25)
      doc.rect(boxX, sigTopY, boxWidth, boxHeight)

      // Image area
      if (item.image) {
        try {
          doc.addImage(item.image, "PNG", boxX + 4, sigTopY + 1, boxWidth - 8, boxHeight - 6.5)
        } catch (e) {
          console.error(`${item.label} signature draw failed`, e)
        }
      }

      // Title line at bottom of signature box
      const titleLineY = sigTopY + boxHeight - 4.8
      doc.line(boxX + 1.5, titleLineY, boxX + boxWidth - 1.5, titleLineY)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(7.5)
      doc.text(item.label, boxX + boxWidth / 2, sigTopY + boxHeight - 1.4, { align: "center" })
    })

    // Outer checklist-container border
    const containerHeight = sigTopY + boxHeight + 3 - marginY
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.35)
    doc.rect(marginX, marginY, contentWidth, containerHeight)

    doc.save(
      `Audit_Report_Non_Production_${audit.Department?.name || "Dept"}_${new Date(audit.audit_date).toISOString().slice(0, 10)}.pdf`
    )
  }
  return (
    <Card shadow="sm" padding="lg">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Audit Report</Title>
        <Button leftSection={<IconDownload size={14} />} onClick={downloadPdf} >
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
