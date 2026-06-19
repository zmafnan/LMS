"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Container,
  Title,
  TextInput,
  Textarea,
  Button,
  Group,
  Select,
  Paper,
  Stack,
  Text,
  Image,
  SimpleGrid,
  ActionIcon,
  FileInput,
  Modal,
  Card,
  Badge,
  Box,
  LoadingOverlay,
} from "@mantine/core"
import { DateInput } from "@mantine/dates"
import { notifications } from "@mantine/notifications"
import { useMediaQuery } from "@mantine/hooks"
import {
  IconUpload,
  IconTrash,
  IconCamera,
  IconPencil,
  IconClipboardCheck,
  IconX,
} from "@tabler/icons-react"
import SignatureCanvas from "react-signature-canvas"
import Webcam from "react-webcam"
import api from "../../services/api"

export default function KaizenSubmissionForm() {
  const { ticket } = useParams()
  const navigate = useNavigate()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraType, setCameraType] = useState("before") // "before" or "after"
  const webcamRef = useRef(null)
  const [deletingPhoto, setDeletingPhoto] = useState(false)

  const [formData, setFormData] = useState({
    kaizen_title: "",
    pic_name: "",
    department: "",
    submission_date: new Date(),
    background: "",
    kaizen_type: "",
    erc_team: "",
    sku: "",
    before_description: "",
    after_description: "",
    benefits: "",
    process_impact: "",
    quality_impact: "",
    pph_impact: "",
    cost_impact: "",
    photosBefore: [],
    photosAfter: [],
  })

  const [signatures, setSignatures] = useState({
    proposers: null,
    spv_production: null,
    kb_production: null,
    asst_manager_production: null,
    manager_production: null,
    production_technical: null,
    qms: null,
    director_production: null,
  })

  // Store both the file objects and the URLs separately
  const [photosBeforePreviews, setPhotosBeforePreviews] = useState([])
  const [photosAfterPreviews, setPhotosAfterPreviews] = useState([])

  // Track which photos are from the server (existing) vs newly added
  const [existingBeforePhotos, setExistingBeforePhotos] = useState([])
  const [existingAfterPhotos, setExistingAfterPhotos] = useState([])

  const [signatureModal, setSignatureModal] = useState({
    opened: false,
    type: null,
  })

  // Fetch submission data if editing
  useEffect(() => {
    if (ticket) {
      setIsEditing(true)
      fetchSubmissionData()
    }
  }, [ticket])

  const fetchSubmissionData = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/submissions/ticket/${ticket}`)
      const submission = response.data

      // Set form data
      setFormData({
        kaizen_title: submission.kaizen_title || "",
        pic_name: submission.pic_name,
        department: submission.department,
        submission_date: new Date(submission.submission_date),
        background: submission.background,
        kaizen_type: submission.kaizen_type,
        erc_team: submission.erc_team || "",
        sku: submission.sku || "",
        before_description: submission.before_description,
        after_description: submission.after_description,
        benefits: submission.benefits,
        process_impact: submission.process_impact || "",
        quality_impact: submission.quality_impact || "",
        pph_impact: submission.pph_impact || "",
        cost_impact: submission.cost_impact || "",
        photosBefore: [],
        photosAfter: [],
      })

      // Set signatures
      setSignatures({
        proposers: submission.proposers_signature,
        spv_production: submission.spv_production_signature,
        kb_production: submission.kb_production_signature,
        asst_manager_production: submission.asst_manager_production_signature,
        manager_production: submission.manager_production_signature,
        production_technical: submission.production_technical_signature,
        qms: submission.qms_signature,
        director_production: submission.director_production_signature,
      })

      // Set photo previews
      const baseUrl = api.defaults.baseURL.replace("/api", "")

      // Handle before photos
      if (submission.photos_before && submission.photos_before.length > 0) {
        const beforePhotos = submission.photos_before.map((url) => `${baseUrl}${url}`)
        setPhotosBeforePreviews(beforePhotos)
        setExistingBeforePhotos(submission.photos_before)
      }

      // Handle after photos
      if (submission.photos_after && submission.photos_after.length > 0) {
        const afterPhotos = submission.photos_after.map((url) => `${baseUrl}${url}`)
        setPhotosAfterPreviews(afterPhotos)
        setExistingAfterPhotos(submission.photos_after)
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch submission data",
        color: "red",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePhotosChange = (files, type) => {
    if (!files || files.length === 0) return

    if (type === "before") {
      setFormData((prev) => ({
        ...prev,
        photosBefore: [...prev.photosBefore, ...Array.from(files)],
      }))

      const newPreviews = Array.from(files).map((file) => URL.createObjectURL(file))
      setPhotosBeforePreviews((prev) => [...prev, ...newPreviews])
    } else {
      setFormData((prev) => ({
        ...prev,
        photosAfter: [...prev.photosAfter, ...Array.from(files)],
      }))

      const newPreviews = Array.from(files).map((file) => URL.createObjectURL(file))
      setPhotosAfterPreviews((prev) => [...prev, ...newPreviews])
    }
  }

  const handleRemovePhoto = async (index, type) => {
    try {
      if (type === "before") {
        // Check if this is an existing photo from the server
        const baseUrl = api.defaults.baseURL.replace("/api", "")
        const preview = photosBeforePreviews[index]
        const isExistingPhoto = preview.startsWith(baseUrl)

        if (isExistingPhoto && isEditing) {
          // This is an existing photo, we need to delete it from the server
          setDeletingPhoto(true)
          const serverPath = existingBeforePhotos[index]

          await api.delete(`/submissions/${ticket}/photo`, {
            params: {
              photoUrl: serverPath,
              photoType: "before",
            },
          })

          // Update the existing photos list
          const updatedExistingPhotos = [...existingBeforePhotos]
          updatedExistingPhotos.splice(index, 1)
          setExistingBeforePhotos(updatedExistingPhotos)
        } else {
          // This is a newly added photo, just remove it from the form state
          setFormData((prev) => ({
            ...prev,
            photosBefore: prev.photosBefore.filter((_, i) => i !== index - existingBeforePhotos.length),
          }))

          // Revoke the object URL to prevent memory leaks
          if (!preview.startsWith(baseUrl)) {
            URL.revokeObjectURL(preview)
          }
        }

        // Update the previews
        setPhotosBeforePreviews((prev) => prev.filter((_, i) => i !== index))
      } else {
        // After photos - same logic as above
        const baseUrl = api.defaults.baseURL.replace("/api", "")
        const preview = photosAfterPreviews[index]
        const isExistingPhoto = preview.startsWith(baseUrl)

        if (isExistingPhoto && isEditing) {
          setDeletingPhoto(true)
          const serverPath = existingAfterPhotos[index]

          await api.delete(`/submissions/${ticket}/photo`, {
            params: {
              photoUrl: serverPath,
              photoType: "after",
            },
          })

          const updatedExistingPhotos = [...existingAfterPhotos]
          updatedExistingPhotos.splice(index, 1)
          setExistingAfterPhotos(updatedExistingPhotos)
        } else {
          setFormData((prev) => ({
            ...prev,
            photosAfter: prev.photosAfter.filter((_, i) => i !== index - existingAfterPhotos.length),
          }))

          if (!preview.startsWith(baseUrl)) {
            URL.revokeObjectURL(preview)
          }
        }

        setPhotosAfterPreviews((prev) => prev.filter((_, i) => i !== index))
      }

      notifications.show({
        title: "Success",
        message: "Photo removed successfully",
        color: "green",
      })
    } catch (error) {
      console.error("Error removing photo:", error)
      notifications.show({
        title: "Error",
        message: "Failed to remove photo",
        color: "red",
      })
    } finally {
      setDeletingPhoto(false)
    }
  }

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot()
    if (imageSrc) {
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" })
          handlePhotosChange([file], cameraType)
        })
      setShowCamera(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()

      // Append form fields
      Object.keys(formData).forEach((key) => {
        if (key !== "photosBefore" && key !== "photosAfter" && key !== "submission_date") {
          formDataToSend.append(key, formData[key])
        }
      })

      // Append date as ISO string
      formDataToSend.append("submission_date", formData.submission_date.toISOString())

      // Append signatures
      Object.keys(signatures).forEach((key) => {
        if (signatures[key]) {
          formDataToSend.append(`${key}_signature`, signatures[key])
        }
      })

      // Append photos - separate before and after
      formData.photosBefore.forEach((photo) => {
        formDataToSend.append("photosBefore", photo)
      })

      formData.photosAfter.forEach((photo) => {
        formDataToSend.append("photosAfter", photo)
      })

      // Existing photos if editing
      if (isEditing) {
        // Only send the server paths of existing photos, not the full URLs with baseUrl
        if (existingBeforePhotos.length > 0) {
          formDataToSend.append("existing_photos_before", JSON.stringify(existingBeforePhotos))
        }

        if (existingAfterPhotos.length > 0) {
          formDataToSend.append("existing_photos_after", JSON.stringify(existingAfterPhotos))
        }
      }

      let response
      let ticketNumber

      if (isEditing) {
        response = await api.put(`/submissions/${ticket}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        ticketNumber = ticket

        notifications.show({
          title: "Success",
          message: "Kaizen submission updated successfully",
          color: "green",
        })

        // Navigate to ticket confirmation page after editing
        setTimeout(() => {
          if (ticketNumber) {
            navigate(`/kaizen/ticket/${ticketNumber}`)
          } else {
            navigate("/kaizen/admin")
          }
        }, 1000)
      } else {
        response = await api.post("/submissions", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        ticketNumber = response.data.ticket_number

        notifications.show({
          title: "Success",
          message: `Kaizen submission created successfully. Your ticket number is: ${ticketNumber}`,
          color: "green",
        })

        // Navigate to ticket confirmation page after submission
        setTimeout(() => {
          if (ticketNumber) {
            navigate(`/kaizen/ticket/${ticketNumber}`)
          } else {
            navigate("/kaizen/admin")
            notifications.show({
              title: "Warning",
              message: "Could not retrieve ticket number. Redirecting to admin panel.",
              color: "yellow",
            })
          }
        }, 1000)
      }
    } catch (error) {
      console.error("Submission error:", error)
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to submit form",
        color: "red",
      })
    } finally {
      setLoading(false)
    }
  }

  // Navigation removed since we use a single form step now

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
          <Text size="sm">Please sign below:</Text>
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

  // Render signature card
  const renderSignatureCard = (title, type) => (
    <Paper p="md" withBorder radius="md" bg="gray.0">
      <Group position="apart">
        <Text fw={500}>{title}</Text>
        {signatures[type] ? (
          <ActionIcon color="red" variant="subtle" onClick={() => setSignatures({ ...signatures, [type]: null })}>
            <IconTrash size={16} />
          </ActionIcon>
        ) : null}
      </Group>
      {signatures[type] ? (
        <Box mt="md">
          <img
            src={signatures[type] || "/placeholder.svg"}
            alt={`${title} signature`}
            style={{ maxWidth: "100%", border: "1px solid #eee", borderRadius: "8px" }}
          />
        </Box>
      ) : (
        <Button
          variant="outline"
          onClick={() => setSignatureModal({ opened: true, type })}
          fullWidth
          mt="md"
          leftSection={<IconPencil size={16} />}
        >
          Add Signature
        </Button>
      )}
    </Paper>
  )

  // Main form content
  const renderFormContent = () => {
    return (
      <Paper p="md" withBorder radius="md" mt="md">
        <Stack spacing="md">
          <Title order={4}>Basic Information</Title>
          <TextInput
            label="Kaizen Title"
            placeholder="Enter a title for this Kaizen"
            required
            value={formData.kaizen_title}
            onChange={(e) => setFormData({ ...formData, kaizen_title: e.target.value })}
          />

          <TextInput
            label="PIC Name / Suggested By"
            placeholder="Enter name"
            required
            value={formData.pic_name}
            onChange={(e) => setFormData({ ...formData, pic_name: e.target.value })}
          />

          <Select
            label="Kaizen Type"
            placeholder="Select type"
            data={[
              { value: "Eliminate", label: "Eliminate" },
              { value: "Reduce", label: "Reduce" },
              { value: "Combine", label: "Combine" },
              { value: "Simplified", label: "Simplified" },
              { value: "6S", label: "6S" },
              { value: "Quality", label: "Quality" },
            ]}
            value={formData.kaizen_type}
            onChange={(value) => setFormData({ ...formData, kaizen_type: value })}
            required
          />

          <Title order={4} mt="md">Before Implementation</Title>

          <Textarea
            label="Before Description"
            placeholder="Describe the situation before implementation"
            minRows={3}
            required
            value={formData.before_description}
            onChange={(e) => setFormData({ ...formData, before_description: e.target.value })}
          />

          {/* Before Photos Section */}
          <Box mt="xs">
            <Text fw={500} mb="xs">
              Before Photos
            </Text>
            <Group mb="md">
              <FileInput
                placeholder="Upload before photos"
                accept="image/*"
                multiple
                icon={<IconUpload size={16} />}
                onChange={(files) => handlePhotosChange(files, "before")}
                style={{ flex: 1 }}
              />
              <Button
                leftSection={<IconCamera size={16} />}
                onClick={() => {
                  setCameraType("before")
                  setShowCamera(true)
                }}
              >
                Camera
              </Button>
            </Group>

            {photosBeforePreviews.length > 0 && (
              <SimpleGrid cols={isMobile ? 2 : 3} spacing="sm">
                {photosBeforePreviews.map((preview, index) => (
                  <div key={index} style={{ position: "relative" }}>
                    <Image
                      src={preview || "/placeholder.svg"}
                      alt={`Before Preview ${index + 1}`}
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
                      onClick={() => handleRemovePhoto(index, "before")}
                      loading={deletingPhoto}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </div>
                ))}
              </SimpleGrid>
            )}
          </Box>

          <Title order={4} mt="md">After Implementation</Title>

          <Textarea
            label="After Description"
            placeholder="Describe the situation after implementation"
            minRows={3}
            required
            value={formData.after_description}
            onChange={(e) => setFormData({ ...formData, after_description: e.target.value })}
          />

          {/* After Photos Section */}
          <Box mt="xs">
            <Text fw={500} mb="xs">
              After Photos
            </Text>
            <Group mb="md">
              <FileInput
                placeholder="Upload after photos"
                accept="image/*"
                multiple
                icon={<IconUpload size={16} />}
                onChange={(files) => handlePhotosChange(files, "after")}
                style={{ flex: 1 }}
              />
              <Button
                leftSection={<IconCamera size={16} />}
                onClick={() => {
                  setCameraType("after")
                  setShowCamera(true)
                }}
              >
                Camera
              </Button>
            </Group>

            {photosAfterPreviews.length > 0 && (
              <SimpleGrid cols={isMobile ? 2 : 3} spacing="sm">
                {photosAfterPreviews.map((preview, index) => (
                  <div key={index} style={{ position: "relative" }}>
                    <Image
                      src={preview || "/placeholder.svg"}
                      alt={`After Preview ${index + 1}`}
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
                      onClick={() => handleRemovePhoto(index, "after")}
                      loading={deletingPhoto}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </div>
                ))}
              </SimpleGrid>
            )}
          </Box>

          <Title order={4} mt="md">Approval Signature</Title>
          <Text size="sm" c="dimmed" mb="xs">
            Proposer Signature
          </Text>
          {renderSignatureCard("Proposer", "proposers")}

          <Button
            type="submit"
            loading={loading}
            size="lg"
            fullWidth
            mt="xl"
            color="green"
            leftSection={<IconClipboardCheck size={20} />}
          >
            {isEditing ? "Update Kaizen Submission" : "Submit Kaizen"}
          </Button>
        </Stack>
      </Paper>
    )
  }

  return (
    <Container size="md" py={isMobile ? "xs" : "xl"}>
      <Card shadow="sm" padding={isMobile ? "sm" : "lg"} radius="md" withBorder>
        <LoadingOverlay visible={loading || deletingPhoto} overlayBlur={2} />

        <Title order={2} ta="center" mb="md">
          {isEditing ? "Edit Kaizen Submission" : "Kaizen Submission Form"}
        </Title>

        {isEditing && (
          <Badge size="lg" color="blue" fullWidth mb="md" p="xs">
            Ticket: {ticket}
          </Badge>
        )}

        <form onSubmit={handleSubmit}>
          {/* Main content */}
          {renderFormContent()}
        </form>

        <Modal
          opened={showCamera}
          onClose={() => setShowCamera(false)}
          title={`Take ${cameraType === "before" ? "Before" : "After"} Photo`}
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
              Take Photo
            </Button>
          </Stack>
        </Modal>

        <SignatureModal
          opened={signatureModal.opened}
          onClose={() => setSignatureModal({ opened: false, type: null })}
          title={`${signatureModal.type
            ?.split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")} Signature`}
          onSave={(signatureData) => {
            setSignatures({ ...signatures, [signatureModal.type]: signatureData })
          }}
        />
      </Card>
    </Container>
  )
}
