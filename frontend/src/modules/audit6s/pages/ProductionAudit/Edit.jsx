"use client"

import { useState, useEffect } from "react"
import {
  Card,
  Title,
  Text,
  Stack,
  Group,
  NumberInput,
  Textarea,
  Button,
  FileInput,
  Image,
  SimpleGrid,
  ActionIcon,
} from "@mantine/core"
import { useNavigate, useParams } from "react-router-dom"
import { notifications } from "@mantine/notifications"
import { IconTrash } from "@tabler/icons-react"
import api from "../../services/api"

const calculateAverage = (scores) => {
  const validScores = scores.filter((score) => score !== null)
  return validScores.length ? validScores.reduce((a, b) => a + b) / validScores.length : 0
}

export default function ProductionAuditQuickEdit() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [audit, setAudit] = useState(null)
  const [scores, setScores] = useState({
    sort: 0,
    setInOrder: 0,
    shine: 0,
    standardize: 0,
    sustain: 0,
    safety: 0,
  })
  const [currentFindings, setCurrentFindings] = useState("")
  const [photos, setPhotos] = useState([])
  const [newPhotos, setNewPhotos] = useState([])

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

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const response = await api.get(`/production-audits/${id}`)
        setAudit(response.data)
        setScores({
          sort: response.data.sort_score,
          setInOrder: response.data.set_in_order_score,
          shine: response.data.shine_score,
          standardize: response.data.standardize_score,
          sustain: response.data.sustain_score,
          safety: response.data.safety_score,
        })
        setCurrentFindings(response.data.current_findings)

        // Parse photo URLs safely
        try {
          const photoUrls =
            typeof response.data.photo_url === "string"
              ? JSON.parse(response.data.photo_url || "[]")
              : response.data.photo_url || []
          console.log("Parsed photo URLs:", photoUrls)
          setPhotos(photoUrls)
        } catch (error) {
          console.error("Error parsing photo URLs:", error)
          setPhotos([])
        }
      } catch (error) {
        console.error("Error fetching audit:", error)
        notifications.show({
          title: "Error",
          message: "Failed to fetch audit data",
          color: "red",
        })
      }
    }
    fetchAudit()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append("sort_score", scores.sort)
    formData.append("set_in_order_score", scores.setInOrder)
    formData.append("shine_score", scores.shine)
    formData.append("standardize_score", scores.standardize)
    formData.append("sustain_score", scores.sustain)
    formData.append("safety_score", scores.safety)
    formData.append("current_findings", currentFindings)
    formData.append("existing_photos", JSON.stringify(photos))

    newPhotos.forEach((photo) => {
      formData.append("photos", photo)
    })

    try {
      await api.post(`/production-audits/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      notifications.show({
        title: "Success",
        message: "Audit updated successfully",
        color: "green",
      })
      navigate("/6S/production-audit")
    } catch (error) {
      console.error("Error updating audit:", error)
      notifications.show({
        title: "Error",
        message: "Failed to update audit",
        color: "red",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = (files) => {
    setNewPhotos([...newPhotos, ...files])
  }

  const handleRemovePhoto = (index, isExisting) => {
    if (isExisting) {
      setPhotos(photos.filter((_, i) => i !== index))
    } else {
      setNewPhotos(newPhotos.filter((_, i) => i !== index))
    }
  }

  if (!audit) return <Text>Loading...</Text>

  return (
    <form onSubmit={handleSubmit}>
      <Card shadow="sm" padding="lg">
        <Title order={2} mb="md">
          Quick Edit Production Audit
        </Title>
        <Stack spacing="md">
          {Object.entries(scores).map(([key, value]) => (
            <NumberInput
              key={key}
              label={key.charAt(0).toUpperCase() + key.slice(1) + " Score"}
              value={value}
              onChange={(val) => setScores({ ...scores, [key]: val })}
              min={0}
              max={4}
              precision={2}
              step={0.1}
            />
          ))}
          <Textarea
            label="Current Findings"
            value={currentFindings}
            onChange={(e) => setCurrentFindings(e.target.value)}
            minRows={3}
          />
          <FileInput
            label="Add New Photos"
            placeholder="Upload new photos"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
          />
          <SimpleGrid cols={3} spacing="sm">
            {photos.map((photo, index) => (
              <div key={`existing-${index}`} style={{ position: "relative" }}>
                <Image
                  src={getPhotoUrl(photo)}
                  alt={`Audit photo ${index + 1}`}
                  style={{ width: "100%", height: "auto" }}
                  onError={(e) => {
                    console.error(`Failed to load image: ${getPhotoUrl(photo)}`)
                  }}
                />
                <ActionIcon
                  style={{ position: "absolute", top: 5, right: 5 }}
                  color="red"
                  onClick={() => handleRemovePhoto(index, true)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </div>
            ))}
            {newPhotos.map((photo, index) => (
              <div key={`new-${index}`} style={{ position: "relative" }}>
                <Image
                  src={URL.createObjectURL(photo) || "/placeholder.svg"}
                  alt={`New photo ${index + 1}`}
                  style={{ width: "100%", height: "auto" }}
                />
                <ActionIcon
                  style={{ position: "absolute", top: 5, right: 5 }}
                  color="red"
                  onClick={() => handleRemovePhoto(index, false)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </div>
            ))}
          </SimpleGrid>
          <Group position="right" mt="md">
            <Button type="submit" loading={loading}>
              Update Audit
            </Button>
          </Group>
        </Stack>
      </Card>
    </form>
  )
}
