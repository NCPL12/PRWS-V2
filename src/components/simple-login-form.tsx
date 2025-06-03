"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SimpleLoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/bms-reports/v1" // adjust as needed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")

    const loginUrl = `${apiBaseUrl}/login`
    const payload = { username, password }

    try {
      const res = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error("Invalid credentials")

      const userDTO = await res.json()

      localStorage.setItem("username", userDTO.username)
      localStorage.setItem("role", userDTO.role)

      // Log login and audit in parallel
      const logPayload = { username: userDTO.username }

      await Promise.all([
        fetch(`${apiBaseUrl}/log-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(logPayload)
        }),
        fetch(`${apiBaseUrl}/audit-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(logPayload)
        })
      ])

      // Redirect based on role
      if (userDTO.role === "admin") router.push("/main/dashboard")
      else if (userDTO.role === "supervisor") router.push("/reports")
      else if (userDTO.role === "operator") router.push("/export")
      else router.push("/dashboard")
    } catch (err) {
      setErrorMessage("Invalid username or password")
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
        <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        {/* <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a href="#" className="text-primary hover:underline">
            Sign up
          </a>
        </p> */}
      </CardFooter>
    </Card>
  )
}
