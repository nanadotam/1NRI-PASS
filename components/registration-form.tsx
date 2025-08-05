"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useTicketing } from "@/contexts/ticketing-context"
import { ArrowLeft, Loader2, Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"

const passColorOptions = ["dark-green", "dark-purple", "midnight-blue", "deep-burgundy"] as const

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  hearAbout: z.string().min(1, "Please select how you heard about Kairos"),
  // passColor is not included in the form fields anymore
})

type FormData = z.infer<typeof formSchema>

const hearAboutOptions = [
  "Instagram",
  "TikTok",
  "Twitter/X",
  "A Friend",
  "I was in the area",
  "I just knew ✨",
]

const generateKairosId = (): string => {
  // Generate a 4-digit random number
  const randomNumber = Math.floor(1000 + Math.random() * 9000)
  return `KAIROS-${randomNumber}`
}

function getRandomPassColor(): typeof passColorOptions[number] {
  const idx = Math.floor(Math.random() * passColorOptions.length)
  return passColorOptions[idx]
}

export function RegistrationForm() {
  const router = useRouter()
  const { dispatch, submitToBackend } = useTicketing()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      hearAbout: "",
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    // Randomize pass color
    const passColor = getRandomPassColor()

    // Create attendee data
    const attendeeData = {
      id: generateKairosId(),
      ...data,
      passColor,
      fullName: `${data.firstName} ${data.lastName}`, // For backward compatibility with context
      timestamp: new Date().toISOString(),
    }

    try {
      // Submit to backend
      await submitToBackend(attendeeData)

      // Store in context for pass generation
      dispatch({ type: "SET_CURRENT_ATTENDEE", payload: attendeeData })

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsSubmitting(false)
      router.push("/pass")
    } catch (error) {
      console.error("Error submitting form:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Button variant="ghost" onClick={() => router.push("/")} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <ThemeToggle />
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Image
                src="/images/1NRI Logo - Fixed - Transparent (1).png"
                alt="1NRI Logo"
                width={50}
                height={50}
                className="object-contain"
              />
              <h1 className="text-3xl font-bold">Join Kairos</h1>
            </div>
            <p className="text-muted-foreground">Join the Kairos experience. Get your personalized pass & step into divine alignment.</p>
          </div>

          <Card className="border-2 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Registration</CardTitle>
              <CardDescription>Complete your registration to receive your custom pass with QR code</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hearAbout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How did you hear about Kairos?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {hearAboutOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Pass color selection removed and randomized in submission */}

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Your Pass...
                      </>
                    ) : (
                      "Generate My Pass"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
