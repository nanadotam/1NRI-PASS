"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, QrCode, Users, CheckCircle, Clock, Filter } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface AttendeeData {
  id: string
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
}

export function AdminDashboard() {
  const router = useRouter()
  const [attendees, setAttendees] = useState<AttendeeData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSource, setFilterSource] = useState("all")

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const response = await fetch("/api/attendees")
        const result = await response.json()
        if (result.success) {
          setAttendees(result.data)
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
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSource = filterSource === "all" || attendee.heard_about === filterSource

    return matchesSearch && matchesSource
  })

  const stats = {
    total: attendees.length,
    verified: attendees.length, // All registered attendees are considered verified
    pending: 0,
  }

  const exportData = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "Source", "Theme", "Registration Time", "Verse", "Message"].join(","),
      ...filteredAttendees.map((attendee) =>
        [
          `${attendee.first_name} ${attendee.last_name}`,
          attendee.email,
          attendee.phone_number,
          attendee.heard_about,
          attendee.theme,
          new Date(attendee.created_at).toLocaleString(),
          attendee.verse_reference,
          attendee.message_text,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `kairos-attendees-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

      const uniqueSources = Array.from(new Set(attendees.map((a) => a.heard_about)))

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
        <div className="grid md:grid-cols-3 gap-6">
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
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="w-full md:w-48">
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

              <Button onClick={exportData} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>

            {/* Attendees Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Theme</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Loading attendees...
                      </TableCell>
                    </TableRow>
                  ) : filteredAttendees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No attendees found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAttendees.map((attendee) => (
                      <TableRow key={attendee.id}>
                        <TableCell className="font-medium">{`${attendee.first_name} ${attendee.last_name}`}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm">{attendee.email}</p>
                            <p className="text-xs text-muted-foreground">{attendee.phone_number}</p>
                          </div>
                        </TableCell>
                        <TableCell>{attendee.heard_about}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                          >
                            {attendee.theme}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(attendee.created_at).toLocaleDateString()}
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
    </div>
  )
}
