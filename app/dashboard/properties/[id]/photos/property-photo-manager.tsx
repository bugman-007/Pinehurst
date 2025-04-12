"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Upload, Trash, ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { DateFormatter } from "@/components/date-formatter"
import Image from "next/image"

interface Photo {
  id: string
  file_url: string
  file_name: string
  uploaded_at: string
}

interface PropertyPhotoManagerProps {
  propertyId: string
  photos: Photo[]
}

export function PropertyPhotoManager({ propertyId, photos: initialPhotos }: PropertyPhotoManagerProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size exceeds 5MB limit",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`/api/properties/${propertyId}/photos`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to upload photo")
      }

      const result = await response.json()

      // Add the new photo to the list
      setPhotos([
        {
          id: result.id || Date.now().toString(), // Use the returned ID or fallback
          file_url: result.fileUrl,
          file_name: result.fileName,
          uploaded_at: new Date().toISOString(),
        },
        ...photos,
      ])

      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      })

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload photo",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (confirm("Are you sure you want to delete this photo?")) {
      setIsDeleting(photoId)

      try {
        const response = await fetch(`/api/properties/${propertyId}/photos?photoId=${photoId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || "Failed to delete photo")
        }

        // Remove the photo from the list
        setPhotos(photos.filter((photo) => photo.id !== photoId))

        toast({
          title: "Success",
          description: "Photo deleted successfully",
        })

        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete photo",
          variant: "destructive",
        })
      } finally {
        setIsDeleting(null)
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Photo</CardTitle>
          <CardDescription>Upload a new photo for this property</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="photo-upload"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? "Uploading..." : "Select Photo"}
            </Button>
            <p className="text-sm text-muted-foreground">Supported formats: JPG, PNG, GIF (Max 5MB)</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Property Photos</CardTitle>
          <CardDescription>Manage photos for this property</CardDescription>
        </CardHeader>
        <CardContent>
          {photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No photos yet</h3>
              <p className="text-sm text-muted-foreground">Upload photos to showcase this property</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo) => (
                <div key={photo.id} className="group relative overflow-hidden rounded-lg border">
                  <div className="aspect-video w-full overflow-hidden">
                    <Image
                      src={photo.file_url || "/placeholder.svg"}
                      alt={photo.file_name}
                      width={400}
                      height={300}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePhoto(photo.id)}
                      disabled={isDeleting === photo.id}
                      className="flex items-center gap-2"
                    >
                      <Trash className="h-4 w-4" />
                      {isDeleting === photo.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                  <div className="p-2">
                    <p className="truncate text-sm font-medium">{photo.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      <DateFormatter date={photo.uploaded_at} />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
