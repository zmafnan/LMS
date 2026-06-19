"use client"

import { useState, useEffect, useRef } from "react"
import {
  Card,
  Title,
  Text,
  Stack,
  Group,
  Select,
  TextInput,
  NumberInput,
  Textarea,
  Button,
  Paper,
  FileInput,
  Image,
  SimpleGrid,
  ActionIcon,
  Modal,
  Progress,
  Accordion,
  Badge,
  Container,
  Box,
  Stepper,
  rem,
  Affix,
  Transition,
} from "@mantine/core"
import { DateInput } from "@mantine/dates"
import { useNavigate } from "react-router-dom"
import { notifications } from "@mantine/notifications"
import {
  IconUpload,
  IconTrash,
  IconCamera,
  IconClipboardCheck,
  IconSortAscending,
  IconLayoutGrid,
  IconSparkles,
  IconListCheck,
  IconHeartHandshake,
  IconShieldCheck,
  IconPencil,
  IconArrowLeft,
  IconArrowRight,
} from "@tabler/icons-react"
import api from "../../services/api"
import Webcam from "react-webcam"
import SignatureCanvas from "react-signature-canvas"
import { useMediaQuery } from "@mantine/hooks"

export default function ProductionAuditCreate() {
  const navigate = useNavigate()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [showCamera, setShowCamera] = useState(false)
  const [loading, setLoading] = useState(false)
  const [schedules, setSchedules] = useState([])
  const [previousAudit, setPreviousAudit] = useState(null)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState({
    schedule_id: "",
    department_id: "",
    audit_date: null,
    auditor_name: "",
    lean_facilitator_name: "",
    previous_findings: "",
    current_findings: "",
    photos: [],
  })
  const [signatures, setSignatures] = useState({
    auditor: null,
    facilitator: null,
    department: null,
  })

  const [signatureModal, setSignatureModal] = useState({
    opened: false,
    type: null,
  })

  // Fetch schedules saat komponen mount
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await api.get("/schedules")
        // Filter hanya schedule yang belum completed dan untuk departemen production
        const pendingSchedules = response.data
          .filter(
            (schedule) =>
              schedule.status === "pending" &&
              schedule.Department?.type === "production" &&
              ["WAREHOUSE", "FINISH GOOD"].includes(
                schedule.Department?.name?.toUpperCase()
              )
          )
          .map((schedule) => ({
            value: schedule.id.toString(),
            label: `${schedule.Department.name} - ${new Date(
              schedule.audit_date
            ).toLocaleDateString()}`,
            schedule,
          }))
        setSchedules(pendingSchedules)
      } catch (error) {
        notifications.show({
          title: "Error",
          message: "Failed to fetch schedules",
          color: "red",
        })
      }
    }

    fetchSchedules()
  }, [])

  const [previousAuditPhotos, setPreviousAuditPhotos] = useState([])

  const handleScheduleChange = async (scheduleId) => {
    const selectedSchedule = schedules.find((s) => s.value === scheduleId)?.schedule
    if (selectedSchedule) {
      setSelectedSchedule(selectedSchedule)

      // Clear previous audit data first
      setPreviousAudit(null)
      setPreviousAuditPhotos([])

      // Set form data with empty previous findings
      setFormData({
        ...formData,
        schedule_id: scheduleId,
        department_id: selectedSchedule.department_id,
        audit_date: new Date(selectedSchedule.audit_date),
        auditor_name: selectedSchedule.auditor_name,
        lean_facilitator_name: selectedSchedule.lean_facilitator_name,
        previous_findings: "", // Default empty until we verify we have valid previous findings
      })

      try {
        // Use the new backend endpoint to get the previous audit
        const response = await api.get("/production-audits/previous", {
          params: {
            department_id: selectedSchedule.department_id.toString(),
            audit_date: selectedSchedule.audit_date,
          },
        })

        const previousAudit = response.data

        if (previousAudit) {
          setPreviousAudit(previousAudit)

          setFormData((prev) => ({
            ...prev,
            previous_findings: previousAudit.current_findings || "",
          }))

          // Extract and set previous audit photos
          if (previousAudit.photo_url) {
            try {
              const photoUrls = JSON.parse(previousAudit.photo_url)
              setPreviousAuditPhotos(photoUrls)
            } catch (error) {
              console.error("Error parsing previous audit photos:", error)
            }
          }
        } else {
        }
      } catch (error) {
        console.error("Error fetching previous audit:", error)
        notifications.show({
          title: "Error",
          message: "Failed to fetch previous audit data",
          color: "red",
        })
      }
    }
  }

  // Tambahkan state untuk preview foto
  const [photosPreviews, setPhotosPreviews] = useState([])

  // Handler untuk multiple photos
  const handlePhotosChange = (files) => {
    // Update formData dengan files baru
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...Array.from(files)],
    }))

    // Create preview URLs
    const newPreviews = Array.from(files).map((file) => URL.createObjectURL(file))
    setPhotosPreviews((prev) => [...prev, ...newPreviews])
  }

  // Handler untuk menghapus foto
  const handleRemovePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }))

    // Hapus preview dan revoke URL
    URL.revokeObjectURL(photosPreviews[index])
    setPhotosPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const calculateAverage = (scores) => {
    const sum = scores.reduce((acc, curr) => acc + (curr || 0), 0)
    return (sum / scores.length).toFixed(2)
  }

  const [scores, setScores] = useState({
    sort: [null, null, null, null],
    setInOrder: [null, null, null, null],
    shine: [null, null, null, null],
    standardize: [null, null, null, null],
    sustain: [null, null, null, null],
    safety: [null, null, null, null],
  })

  const webcamRef = useRef(null)

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot()
    if (imageSrc) {
      // Convert base64 to file
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" })
          handlePhotosChange([file])
        })
      setShowCamera(false)
    }
  }

  const handleScoreChange = (category, index, value) => {
    setScores((prev) => ({
      ...prev,
      [category]: prev[category].map((score, i) => (i === index ? value : score)),
    }))
  }

  // Modifikasi handleSubmit untuk memastikan current_findings terkirim
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const formDataToSend = new FormData()

    try {
      // Show submitting notification
      const submittingId = notifications.show({
        title: "Submitting Audit",
        message: "Please wait while we save your audit data...",
        loading: true,
        autoClose: false,
      })

      // Append semua field
      formDataToSend.append("schedule_id", formData.schedule_id)
      formDataToSend.append("department_id", formData.department_id)
      formDataToSend.append("audit_date", formData.audit_date.toISOString())
      formDataToSend.append("auditor_name", formData.auditor_name)
      formDataToSend.append("lean_facilitator_name", formData.lean_facilitator_name)
      formDataToSend.append("previous_findings", formData.previous_findings)
      formDataToSend.append("current_findings", formData.current_findings)
      formDataToSend.append("auditor_signature", signatures.auditor)
      formDataToSend.append("facilitator_signature", signatures.facilitator)
      formDataToSend.append("department_signature", signatures.department)

      // Append scores
      const averageScores = {
        sort_score: calculateAverage(scores.sort),
        set_in_order_score: calculateAverage(scores.setInOrder),
        shine_score: calculateAverage(scores.shine),
        standardize_score: calculateAverage(scores.standardize),
        sustain_score: calculateAverage(scores.sustain),
        safety_score: calculateAverage(scores.safety),
      }

      Object.keys(averageScores).forEach((key) => {
        formDataToSend.append(key, averageScores[key])
      })

      // Append photos
      formData.photos.forEach((photo) => {
        formDataToSend.append("photos", photo)
      })

      // Save audit data to database
      const response = await api.post("/production-audits", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      // Check if we have a valid response with an ID
      if (!response.data || !response.data.id) {
        throw new Error("Failed to get audit ID from server response")
      }

      console.log("Audit saved successfully with ID:", response.data.id)

      // Update notification
      notifications.update({
        id: submittingId,
        title: "Success",
        message: "Audit data saved successfully",
        color: "green",
        loading: false,
        autoClose: 3000,
      })

      // Update schedule status to completed
      await api.put(`/schedules/${formData.schedule_id}`, { status: "completed" })

      // Generate PDF report
      const getBaseUrl = () => {
        const fullUrl = api.defaults.baseURL
        return fullUrl.endsWith("/api") ? fullUrl.slice(0, -4) : fullUrl
      }

      const baseUrl = getBaseUrl()
      const pdfUrl = `${baseUrl}/api/audit-report-pdf/${response.data.id}/production`

      // Download PDF without opening a new window
      try {
        // Show loading notification
        const loadingId = notifications.show({
          title: "Downloading PDF",
          message: "Please wait while we prepare your report...",
          loading: true,
          autoClose: false,
        })

        // Fetch the PDF file
        const pdfResponse = await fetch(pdfUrl)

        if (!pdfResponse.ok) {
          throw new Error(`Failed to download PDF: ${pdfResponse.status} ${pdfResponse.statusText}`)
        }

        const pdfBlob = await pdfResponse.blob()

        // Create a URL for the blob
        const blobUrl = window.URL.createObjectURL(pdfBlob)

        // Create a hidden anchor element
        const downloadLink = document.createElement("a")
        downloadLink.href = blobUrl
        downloadLink.download = `audit-report-${response.data.id}.pdf`

        // Append to the document, click it, and remove it
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)

        // Clean up the blob URL
        window.URL.revokeObjectURL(blobUrl)

        // Update notification
        notifications.update({
          id: loadingId,
          title: "Success",
          message: "Report downloaded successfully",
          color: "green",
          loading: false,
          autoClose: 3000,
        })

        // Navigate to the mobile schedule page after successful download
        setTimeout(() => {
          navigate("/6S/Schedule/mobile")
        }, 1500)
      } catch (error) {
        console.error("Error downloading PDF:", error)
        notifications.show({
          title: "Warning",
          message: "Audit saved but couldn't download the report automatically",
          color: "yellow",
        })

        // Navigate even if download fails
        navigate("/6S/Schedule/mobile")
      }
    } catch (error) {
      console.error("Error submitting audit:", error)
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to submit audit: " + error.message,
        color: "red",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateFinalScore = () => {
    const categories = ["sort", "setInOrder", "shine", "standardize", "sustain", "safety"]
    const sum = categories.reduce((acc, category) => acc + Number.parseFloat(calculateAverage(scores[category])), 0)
    return (sum / categories.length).toFixed(2)
  }

  const getCompletionPercentage = () => {
    const categories = ["sort", "setInOrder", "shine", "standardize", "sustain", "safety"]
    let totalFields = 0
    let completedFields = 0

    categories.forEach((category) => {
      scores[category].forEach((score) => {
        totalFields++
        if (score !== null) completedFields++
      })
    })

    return Math.round((completedFields / totalFields) * 100)
  }

  const SignatureModal = ({ opened, onClose, title, onSave }) => {
    const sigPad = useRef(null)

    const handleSave = () => {
      if (sigPad.current) {
        const signatureData = sigPad.current.toDataURL()
        onSave(signatureData)
        onClose()
      }
    }

    return (
      <Modal opened={opened} onClose={onClose} title={title} size="md" fullScreen={isMobile}>
        <Stack>
          <Text size="sm">Silakan tanda tangan di bawah ini:</Text>
          <div style={{ border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
            <SignatureCanvas
              ref={sigPad}
              canvasProps={{
                width: isMobile ? window.innerWidth - 40 : 500,
                height: 200,
                className: "signature-canvas",
                style: { width: "100%", height: "200px" },
              }}
            />
          </div>
          <Group justify="space-between">
            <Button onClick={() => sigPad.current?.clear()} variant="outline" color="red">
              Clear
            </Button>
            <Button onClick={handleSave} color="green">
              Save Signature
            </Button>
          </Group>
        </Stack>
      </Modal>
    )
  }

  const ScoreSection = ({ title, description, criteria, category, icon }) => {
    const scoreValue = calculateAverage(scores[category])
    const scoreColor = scoreValue >= 3.5 ? "green" : scoreValue >= 2.5 ? "blue" : scoreValue >= 1.5 ? "yellow" : "red"

    return (
      <Accordion.Item value={category}>
        <Accordion.Control icon={icon}>
          <Group justify="space-between" wrap="nowrap">
            <Text fw={500}>{title}</Text>
            {scoreValue > 0 && (
              <Badge color={scoreColor} size="lg" radius="sm">
                {scoreValue}
              </Badge>
            )}
          </Group>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack>
            <Text size="sm" c="dimmed" mb="md">
              {description}
            </Text>
            {criteria.map((criterion, index) => (
              <Paper key={index} p="md" withBorder radius="md">
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    {criterion}
                  </Text>
                  <NumberInput
                    min={1}
                    max={4}
                    precision={2}
                    step={0.1}
                    placeholder="Score (1-4)"
                    value={scores[category][index]}
                    onChange={(value) => handleScoreChange(category, index, value)}
                    size="md"
                    radius="md"
                    styles={{
                      input: {
                        fontSize: isMobile ? rem(18) : rem(16),
                        height: isMobile ? rem(48) : rem(42),
                      },
                    }}
                  />
                </Stack>
              </Paper>
            ))}
            <Group justify="flex-end">
              <Badge size="xl" color={scoreColor} radius="md" p="md">
                Average: {calculateAverage(scores[category])}
              </Badge>
            </Group>
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    )
  }

  const nextStep = () => {
    if (activeStep < 3) setActiveStep((current) => current + 1)
  }

  const prevStep = () => {
    if (activeStep > 0) setActiveStep((current) => current - 1)
  }

  return (
    <Container size="md" px={isMobile ? "xs" : "md"} py="md">
      <form onSubmit={handleSubmit}>
        <Card shadow="sm" padding={isMobile ? "xs" : "lg"} radius="md" withBorder>
          <Title order={2} ta="center" mb="md" style={{ fontSize: isMobile ? rem(20) : rem(24) }}>
            CHECKLIST AUDIT 6S Gudang/Warehouse
          </Title>
          <Text c="dimmed" mb="xl" ta="center">
            Audit Goal: Untuk Meng-Audit inisiatif dalam menyesuaikan dengan standar 6S, mengidentifikasi area dimana 6S
            dijaga dengan baik
          </Text>
          <Box mb="xl">
            <Stepper active={activeStep} onStepClick={setActiveStep} breakpoint="sm" allowNextStepsSelect={false}>
              <Stepper.Step label="Info" description="Audit Info">
                <Stack gap="md" mt="xl">
                  <Select
                    label="Pilih Schedule Audit"
                    placeholder="Pilih schedule audit"
                    data={schedules}
                    value={formData.schedule_id}
                    onChange={handleScheduleChange}
                    required
                    searchable
                    size={isMobile ? "md" : "sm"}
                    styles={{
                      input: {
                        fontSize: isMobile ? rem(16) : rem(14),
                      },
                    }}
                  />

                  {selectedSchedule && (
                    <>
                      <Paper p="md" withBorder radius="md">
                        <Stack gap="xs">
                          <Group>
                            <Text fw={500} size="sm" w={120}>
                              Department:
                            </Text>
                            <Text>{selectedSchedule.Department.name}</Text>
                          </Group>
                          <Group>
                            <Text fw={500} size="sm" w={120}>
                              Audit Date:
                            </Text>
                            <Text>{new Date(selectedSchedule.audit_date).toLocaleDateString()}</Text>
                          </Group>
                        </Stack>
                      </Paper>

                      <TextInput
                        label="Auditor Name"
                        name="auditor_name"
                        value={formData.auditor_name}
                        onChange={(e) => setFormData({ ...formData, auditor_name: e.target.value })}
                        size={isMobile ? "md" : "sm"}
                      />
                      <TextInput
                        label="Lean Facilitator Name"
                        name="lean_facilitator_name"
                        value={formData.lean_facilitator_name}
                        onChange={(e) => setFormData({ ...formData, lean_facilitator_name: e.target.value })}
                        size={isMobile ? "md" : "sm"}
                      />
                      <DateInput
                        label="Audit Date"
                        placeholder="Pick date"
                        value={formData.audit_date}
                        onChange={(value) => setFormData({ ...formData, audit_date: value })}
                        required
                        size={isMobile ? "md" : "sm"}
                      />

                      <Paper p="md" withBorder radius="md" bg="gray.0">
                        <Title order={5} mb="xs">
                          Temuan Sebelumnya
                        </Title>
                        <Textarea
                          placeholder="Masukkan temuan audit sebelumnya"
                          value={formData.previous_findings}
                          onChange={(e) => setFormData({ ...formData, previous_findings: e.target.value })}
                          minRows={3}
                          autosize
                          size={isMobile ? "md" : "sm"}
                        />
                      </Paper>

                      {previousAuditPhotos.length > 0 && (
                        <Paper p="md" withBorder radius="md" bg="gray.0">
                          <Title order={5} mb="xs">
                            Foto Temuan Sebelumnya
                          </Title>
                          <SimpleGrid cols={isMobile ? 2 : 3} spacing="sm">
                            {previousAuditPhotos.map((photoUrl, index) => (
                              <div key={index} style={{ position: "relative" }}>
                                <Image
                                  src={
                                    photoUrl.startsWith("http")
                                      ? photoUrl
                                      : `${api.defaults.baseURL.replace("/api", "")}${photoUrl}` || "/placeholder.svg"
                                  }
                                  alt={`Previous finding ${index + 1}`}
                                  radius="md"
                                  style={{ width: "100%", height: "auto", maxHeight: "200px", objectFit: "cover" }}
                                />
                              </div>
                            ))}
                          </SimpleGrid>
                        </Paper>
                      )}
                    </>
                  )}
                </Stack>
              </Stepper.Step>

              <Stepper.Step label="Scoring" description="6S Evaluation">
                <Stack gap="md" mt="xl">
                  <Paper p="md" withBorder radius="md" bg="blue.0">
                    <Group position="apart">
                      <Text fw={700}>Completion Progress</Text>
                      <Text fw={500}>{getCompletionPercentage()}%</Text>
                    </Group>
                    <Progress value={getCompletionPercentage()} mt="xs" size="lg" radius="xl" color="blue" />
                  </Paper>

                  <Accordion variant="separated" radius="md">

                    {ScoreSection({
                      title: "1. SORT",
                      description: "Pisahkan dan hilangkan segala sesuatu yang tidak diperlukan di area kerja",
                      category: "sort",
                      icon: <IconSortAscending size={20} />,
                      criteria: [
                        "1. Tidak ada barang-barang pribadi dilorong dan disudut-sudut area kerja",
                        "2. Semua barang pribadi yang tidak ada hubungannya dengan pekerjaan harus disimpan pada tempatnya",
                        "3. Terdapat Mapping yang menunjukan tata letak barang",
                        "4. Semua peralatan kerja yang sudah tidak digunakan disimpan pada tempatnya",
                      ],
                    })}

                    {ScoreSection({
                      title: "2. SET IN ORDER",
                      description: "Susun dan tempatkan material dan perlengkapan kerja pada tempatnya",
                      category: "setInOrder",
                      icon: <IconLayoutGrid size={20} />,
                      criteria: [
                        "1. Tempat khusus untuk pallet dan perlengkapan kerja harus jelas (Visual)",
                        "2. Pallet dan perlengkapan kerja diletakkan pada tempatnya",
                        "3. Penempatan pallet dan perlengkapan kerja disusun secara rapih",
                        "4. Penempatan carton dan perlengkapan kerja berada dalam area kerja (dalam garis line)",
                      ],
                    })}

                    {ScoreSection({
                      title: "3. SHINE",
                      description: "Segala sesuatu terjaga kebersihannya",
                      category: "shine",
                      icon: <IconSparkles size={20} />,
                      criteria: [
                        "1. Material bersih dari debu, sisa material/scrap dan oli",
                        "2. Lantai, dinding, mesin dan perlengkapan kerja bebas debu, oli, sampah dan sarang laba-laba",
                        "3. Tersedianya alat kebersihan disetiap area kerja dalam kondisi baik dan berfungsi",
                        "4. Kondisi garis, label, petunjuk, visual display dll bersih dan tidak rusak",
                      ],
                    })}

                    {ScoreSection({
                      title: "4. STANDARDIZED",
                      description:
                        "Tempatkan material diarea yang sudah ditetapkan dengan jumlah sesuai batas minimal dan maksimal",
                      category: "standardize",
                      icon: <IconListCheck size={20} />,
                      criteria: [
                        "1. Semua standar kerja atau proses diketahui dan terlihat jelas (SOP, Humidity, checklist suhu, checklist kapur)",
                        "2. Pastikan semua sistem dijalankan dan terupdate",
                        "3. Semua perlengkapan kerja yang digunakan sesuai dengan standar yang ditentukan",
                        "4. Tempatkan carton di area yang telah ditetapkan dengan jumlah sesuai batas minimal dan maksimal",
                      ],
                    })}

                    {ScoreSection({
                      title: "5. SUSTAIN",
                      description:
                        "Terus melakukan dan berupaya meningkatkan ke 4S sebelumnya, disiplin dan bermotivasi",
                      category: "sustain",
                      icon: <IconHeartHandshake size={20} />,
                      criteria: [
                        "1. Dilaksanakan briefing harian/mingguan tentang 6S",
                        "2. Karyawan mengetahui dan memahami definisi 6S",
                        "3. Improvement temuan sebelumnya",
                        "4. Pastikan area proses kerja dalam keadaan rapi dan bersih",
                      ],
                    })}

                    {ScoreSection({
                      title: "6. SAFETY",
                      description:
                        "Peduli keselamatan, kesehatan kerja serta menciptakan lingkungan kerja yang aman dan nyaman",
                      category: "safety",
                      icon: <IconShieldCheck size={20} />,
                      criteria: [
                        "1. Jalur evakuasi tidak terhalang oleh apapun",
                        "2. Benda di area kerja diletakkan dalam posisi aman dan tidak berpotensi menimpa seseorang",
                        "3. Kabel-kabel tertata rapi",
                        "4. Kabel dalam kondisi baik (tidak terkelupas, dll)",
                      ],
                    })}

                  </Accordion>

                  <Paper p="xl" withBorder radius="md" bg="blue.0" mt="md">
                    <Stack align="center">
                      <Title order={3}>Final Score</Title>
                      <Badge size="xl" radius="xl" p="lg" color="blue" variant="filled" style={{ fontSize: rem(24) }}>
                        {calculateFinalScore()}
                      </Badge>
                    </Stack>
                  </Paper>
                </Stack>
              </Stepper.Step>

              <Stepper.Step label="Findings" description="Current Findings">
                <Stack gap="md" mt="xl">
                  <Paper p="md" withBorder radius="md" bg="gray.0">
                    <Title order={5} mb="xs">
                      <Group>
                        <IconPencil size={20} />
                        <Text>Temuan Sekarang</Text>
                      </Group>
                    </Title>
                    <Textarea
                      placeholder="Masukkan temuan audit saat ini"
                      value={formData.current_findings}
                      onChange={(e) => setFormData({ ...formData, current_findings: e.target.value })}
                      minRows={5}
                      autosize
                      required
                      size={isMobile ? "md" : "sm"}
                    />
                  </Paper>

                  <Paper p="md" withBorder radius="md">
                    <Title order={5} mb="xs">
                      Foto Temuan
                    </Title>
                    <Group mb="md">
                      <FileInput
                        placeholder="Upload foto temuan"
                        accept="image/*"
                        multiple
                        icon={<IconUpload size={16} />}
                        onChange={handlePhotosChange}
                        style={{ flex: 1 }}
                        size={isMobile ? "md" : "sm"}
                      />
                      <Button
                        leftSection={<IconCamera size={16} />}
                        onClick={() => setShowCamera(true)}
                        size={isMobile ? "md" : "sm"}
                      >
                        Kamera
                      </Button>
                    </Group>

                    {photosPreviews.length > 0 && (
                      <SimpleGrid cols={isMobile ? 2 : 3} spacing="sm">
                        {photosPreviews.map((preview, index) => (
                          <div key={index} style={{ position: "relative" }}>
                            <Image
                              src={preview || "/placeholder.svg"}
                              alt={`Preview ${index + 1}`}
                              radius="md"
                              style={{ width: "100%", height: "auto", maxHeight: "200px", objectFit: "cover" }}
                            />
                            <ActionIcon
                              color="red"
                              variant="filled"
                              style={{
                                position: "absolute",
                                top: 5,
                                right: 5,
                                borderRadius: "50%",
                              }}
                              onClick={() => handleRemovePhoto(index)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </div>
                        ))}
                      </SimpleGrid>
                    )}
                  </Paper>
                </Stack>
              </Stepper.Step>

              <Stepper.Step label="Sign" description="Signatures">
                <Stack gap="md" mt="xl">
                  <Paper p="xl" withBorder radius="md" bg="blue.0" mb="md">
                    <Stack align="center">
                      <Title order={3}>Final Score</Title>
                      <Badge size="xl" radius="xl" p="lg" color="blue" variant="filled" style={{ fontSize: rem(24) }}>
                        {calculateFinalScore()}
                      </Badge>
                    </Stack>
                  </Paper>
                  <Paper p="md" withBorder radius="md">
                    <Title order={5} mb="md">
                      Signatures
                    </Title>
                    <Stack gap="lg">
                      <Paper p="md" withBorder radius="md" bg="gray.0">
                        <Group position="apart">
                          <Text fw={500}>Auditor Signature</Text>
                          {signatures.auditor ? (
                            <ActionIcon
                              color="red"
                              variant="subtle"
                              onClick={() => setSignatures({ ...signatures, auditor: null })}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          ) : null}
                        </Group>
                        {signatures.auditor ? (
                          <Box mt="md">
                            <img
                              src={signatures.auditor || "/placeholder.svg"}
                              alt="Auditor signature"
                              style={{ maxWidth: "100%", border: "1px solid #eee", borderRadius: "8px" }}
                            />
                          </Box>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => setSignatureModal({ opened: true, type: "auditor" })}
                            fullWidth
                            mt="md"
                            leftSection={<IconPencil size={16} />}
                          >
                            Add Signature
                          </Button>
                        )}
                      </Paper>

                      <Paper p="md" withBorder radius="md" bg="gray.0">
                        <Group position="apart">
                          <Text fw={500}>Lean Facilitator Signature</Text>
                          {signatures.facilitator ? (
                            <ActionIcon
                              color="red"
                              variant="subtle"
                              onClick={() => setSignatures({ ...signatures, facilitator: null })}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          ) : null}
                        </Group>
                        {signatures.facilitator ? (
                          <Box mt="md">
                            <img
                              src={signatures.facilitator || "/placeholder.svg"}
                              alt="Facilitator signature"
                              style={{ maxWidth: "100%", border: "1px solid #eee", borderRadius: "8px" }}
                            />
                          </Box>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => setSignatureModal({ opened: true, type: "facilitator" })}
                            fullWidth
                            mt="md"
                            leftSection={<IconPencil size={16} />}
                          >
                            Add Signature
                          </Button>
                        )}
                      </Paper>

                      <Paper p="md" withBorder radius="md" bg="gray.0">
                        <Group position="apart">
                          <Text fw={500}>Department Head Signature</Text>
                          {signatures.department ? (
                            <ActionIcon
                              color="red"
                              variant="subtle"
                              onClick={() => setSignatures({ ...signatures, department: null })}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          ) : null}
                        </Group>
                        {signatures.department ? (
                          <Box mt="md">
                            <img
                              src={signatures.department || "/placeholder.svg"}
                              alt="Department signature"
                              style={{ maxWidth: "100%", border: "1px solid #eee", borderRadius: "8px" }}
                            />
                          </Box>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => setSignatureModal({ opened: true, type: "department" })}
                            fullWidth
                            mt="md"
                            leftSection={<IconPencil size={16} />}
                          >
                            Add Signature
                          </Button>
                        )}
                      </Paper>
                    </Stack>
                  </Paper>

                  <Button
                    type="submit"
                    loading={loading}
                    size="lg"
                    fullWidth
                    mt="xl"
                    color="green"
                    leftSection={<IconClipboardCheck size={20} />}
                  >
                    Submit Audit
                  </Button>
                </Stack>
              </Stepper.Step>
            </Stepper>

            <Group position="apart" mt="xl">
              <Button
                variant="default"
                onClick={prevStep}
                disabled={activeStep === 0}
                leftSection={<IconArrowLeft size={16} />}
                size={isMobile ? "md" : "sm"}
              >
                Back
              </Button>
              {activeStep < 3 ? (
                <Button onClick={nextStep} rightSection={<IconArrowRight size={16} />} size={isMobile ? "md" : "sm"}>
                  Next
                </Button>
              ) : null}
            </Group>
          </Box>
        </Card>

        <Modal
          opened={showCamera}
          onClose={() => setShowCamera(false)}
          title="Ambil Foto"
          size="auto"
          fullScreen={isMobile}
        >
          <Stack>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              style={{ width: "100%" }}
              videoConstraints={{
                facingMode: "environment",
              }}
              onUserMediaError={(err) => {
                console.error("Webcam Error:", err)
                notifications.show({
                  title: "Camera Error",
                  message: err.message,
                  color: "red",
                })
              }}
            />
            <Button onClick={capturePhoto} size="lg" color="blue">
              Ambil Foto
            </Button>
          </Stack>
        </Modal>

        <SignatureModal
          opened={signatureModal.opened}
          onClose={() => setSignatureModal({ opened: false, type: null })}
          title={`${signatureModal.type?.charAt(0).toUpperCase()}${signatureModal.type?.slice(1)} Signature`}
          onSave={(signatureData) => {
            setSignatures({ ...signatures, [signatureModal.type]: signatureData })
          }}
        />

        <Affix position={{ bottom: 20, right: 20 }}>
          <Transition transition="slide-up" mounted={true}>
            {(transitionStyles) => (
              <ActionIcon
                color="blue"
                variant="filled"
                radius="xl"
                size={64}
                style={{ ...transitionStyles, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
                onClick={() => setShowCamera(true)}
              >
                <IconCamera size={32} />
              </ActionIcon>
            )}
          </Transition>
        </Affix>
      </form>
    </Container>
  )
}
