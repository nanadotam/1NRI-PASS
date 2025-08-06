"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, QrCode, Users, CheckCircle, Clock, Filter, Eye, ExternalLink, Image as ImageIcon } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"

interface AttendeeData {
  id: string
  pass_id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  heard_about: string
  verse_reference: string
  verse_text: string
  message_text: string
  theme: string
  created_at: string
  photos: Array<{
    name: string
    url: string
    created_at: string
  }>
  latestPhoto: {
    name: string
    url: string
    created_at: string
  } | null
}

export function AdminDashboard() {
  const router = useRouter()
  const [attendees, setAttendees] = useState<AttendeeData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSource, setFilterSource] = useState("all")
  const [filterTheme, setFilterTheme] = useState("all")
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const response = await fetch("/api/attendees?all=true")
        const result = await response.json()
        if (result.success) {
          setAttendees(result.data)
        } else {
          console.error("Failed to fetch attendees:", result.error)
        }
      } catch (error) {
        console.error("Error fetching attendees:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendees()
  }, [])

  const filteredAttendees = attendees.filter((attendee) => {
    const fullName = `${attendee.first_name} ${attendee.last_name}`
    const searchLower = searchTerm.toLowerCase()
    
    const matchesSearch =
      fullName.toLowerCase().includes(searchLower) ||
      attendee.email.toLowerCase().includes(searchLower) ||
      attendee.phone_number?.toLowerCase().includes(searchLower) ||
      attendee.pass_id?.toLowerCase().includes(searchLower) ||
      attendee.heard_about?.toLowerCase().includes(searchLower) ||
      attendee.theme?.toLowerCase().includes(searchLower)

    const matchesSource = filterSource === "all" || attendee.heard_about === filterSource
    const matchesTheme = filterTheme === "all" || attendee.theme === filterTheme

    return matchesSearch && matchesSource && matchesTheme
  })

  const stats = {
    total: attendees.length,
    verified: attendees.length,
    pending: 0,
    withPhotos: attendees.filter(a => a.latestPhoto).length,
  }

  const uniqueSources = Array.from(new Set(attendees.map((a) => a.heard_about).filter(Boolean)))
  const uniqueThemes = Array.from(new Set(attendees.map((a) => a.theme).filter(Boolean)))

  const exportData = () => {
    const headers = [
      "Pass ID",
      "First Name",
      "Last Name", 
      "Email",
      "Phone Number",
      "How They Heard About Event",
      "Theme",
      "Registration Date",
      "Verse Reference",
      "Verse Text",
      "Message Text",
      "Photo URL"
    ]

    const csvContent = [
      headers.join(","),
      ...filteredAttendees.map((attendee) =>
        [
          `"${attendee.pass_id || ''}"`,
          `"${attendee.first_name}"`,
          `"${attendee.last_name}"`,
          `"${attendee.email}"`,
          `"${attendee.phone_number || ''}"`,
          `"${attendee.heard_about || ''}"`,
          `"${attendee.theme || ''}"`,
          `"${new Date(attendee.created_at).toLocaleString()}"`,
          `"${attendee.verse_reference || ''}"`,
          `"${(attendee.verse_text || '').replace(/"/g, '""')}"`,
          `"${(attendee.message_text || '').replace(/"/g, '""')}"`,
          `"${attendee.latestPhoto?.url || ''}"`
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `kairos-attendees-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Badge variant="secondary">Kairos Event</Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.push("/scanner")}>
            <QrCode className="mr-2 h-4 w-4" />
            Scanner
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All registered attendees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Photos</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.withPhotos}</div>
              <p className="text-xs text-muted-foreground">Uploaded selfies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Entries</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
              <p className="text-xs text-muted-foreground">Successfully checked in</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Check-in</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting entry verification</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Attendee Management</span>
            </CardTitle>
            <CardDescription>Search, filter, and manage event attendees</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, phone, pass ID, source, or theme..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {uniqueSources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterTheme} onValueChange={setFilterTheme}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Filter by theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Themes</SelectItem>
                  {uniqueThemes.map((theme) => (
                    <SelectItem key={theme} value={theme}>
                      {theme}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={exportData} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>

            {/* Attendees Table */}
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Photo</TableHead>
                    <TableHead>Pass ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Theme</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Loading attendees...
                      </TableCell>
                    </TableRow>
                  ) : filteredAttendees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No attendees found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAttendees.map((attendee) => (
                      <TableRow key={attendee.id}>
                        <TableCell>
                          {attendee.latestPhoto ? (
                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedPhoto(attendee.latestPhoto!.url)}
                                className="p-0 h-auto"
                              >
                                <div className="w-12 h-12 rounded-lg overflow-hidden border">
                                  <Image
                                    src={attendee.latestPhoto.url}
                                    alt="Attendee photo"
                                    width={48}
                                    height={48}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                              </Button>
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {attendee.pass_id}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {attendee.first_name} {attendee.last_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm">{attendee.email}</p>
                            {attendee.phone_number && (
                              <p className="text-xs text-muted-foreground">{attendee.phone_number}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {attendee.heard_about || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {attendee.theme || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(attendee.created_at).toLocaleDateString()}
                          <br />
                          <span className="text-xs">
                            {new Date(attendee.created_at).toLocaleTimeString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {attendee.latestPhoto && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(attendee.latestPhoto!.url, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/pass/${attendee.pass_id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Photo Preview</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPhoto(null)}
              >
                ×
              </Button>
            </div>
            <div className="relative">
              <Image
                src={selectedPhoto}
                alt="Attendee photo"
                width={600}
                height={600}
                className="object-contain w-full"
              />
            </div>
            <div className="mt-4 flex justify-between">
              <Button
                variant="outline"
                onClick={() => window.open(selectedPhoto, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Full Size
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedPhoto(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
