"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Upload, Search, Info, Menu } from "lucide-react"
import ProductCatalog from "./product-catalog"

export default function Home() {
  const [image, setImage] = useState<File | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  const identifyDisease = async (additionalPrompt = "") => {
    if (!image) return

    setLoading(true)
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    try {
      const imageParts = await fileToGenerativePart(image)
      const result = await model.generateContent([
        `Identify any crop diseases in this image and provide important information including symptoms, causes, and solutions.
        ${additionalPrompt}`,
        imageParts,
      ])
      const response = await result.response
      const text = response
        .text()
        .trim()
        .replace(/```/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/-\s*/g, "")
        .replace(/\n\s*\n/g, "\n")
      setResult(text)
      generateKeywords(text)
      await generateRelatedQuestions(text)
    } catch (error) {
      console.error("Error identifying crop disease:", error)
      if (error instanceof Error) {
        setResult(`Error identifying crop disease: ${error.message}`)
      } else {
        setResult("An unknown error occurred while identifying the crop disease.")
      }
    } finally {
      setLoading(false)
    }
  }

  const generateKeywords = (text: string) => {
    const words = text.split(/\s+/)
    const keywordSet = new Set<string>()
    words.forEach((word) => {
      if (word.length > 4 && !["this", "that", "with", "from", "have"].includes(word.toLowerCase())) {
        keywordSet.add(word)
      }
    })
  }

  const generateRelatedQuestions = async (text: string) => {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    try {
      const result = await model.generateContent([
        `Based on the following information about a crop disease, generate 5 related questions that a farmer might ask to learn more about the disease or its treatment:

        ${text}

        Format the output as a simple list of questions, one per line.`,
      ])
      const response = await result.response
      const questions = response.text().trim().split("\n")
      setRelatedQuestions(questions)
    } catch (error) {
      console.error("Error generating related questions:", error)
      setRelatedQuestions([])
    }
  }

  const askRelatedQuestion = (question: string) => {
    identifyDisease(`Answer the following question about the crop disease: "${question}"`)
  }

  async function fileToGenerativePart(file: File): Promise<{
    inlineData: { data: string; mimeType: string }
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64data = reader.result as string
        const base64Content = base64data.split(",")[1]
        resolve({
          inlineData: {
            data: base64Content,
            mimeType: file.type,
          },
        })
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="min-h-screen bg-green-50">
      <header className="bg-green-800 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Leaf className="w-8 h-8 mr-3" />
              <h1 className="text-2xl font-bold">AgriRaksha</h1>
            </div>
            <nav className="hidden md:block">
              <ul className="flex space-x-4">
                <li>
                  <a href="#" className="hover:text-green-200 transition duration-150 ease-in-out">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-green-200 transition duration-150 ease-in-out">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#product-catalog" className="hover:text-green-200 transition duration-150 ease-in-out">
                    Product Catalog
                  </a>
                </li>
              </ul>
            </nav>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="md:hidden bg-green-700 text-white">
          <nav className="px-4 py-2">
            <ul className="space-y-2">
              <li>
                <a href="#" className="block py-2 hover:text-green-200 transition duration-150 ease-in-out">
                  Home
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="block py-2 hover:text-green-200 transition duration-150 ease-in-out">
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#product-catalog"
                  className="block py-2 hover:text-green-200 transition duration-150 ease-in-out"
                >
                  Product Catalog
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-extrabold text-green-800 text-center">Identify Crop Diseases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-8">
              <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Upload an image of your crop
              </label>
              <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} />
            </div>
            {image && (
              <div className="mb-8 flex justify-center">
                <Image
                  src={URL.createObjectURL(image) || "/placeholder.svg"}
                  alt="Uploaded crop image"
                  width={300}
                  height={300}
                  className="rounded-lg shadow-md"
                />
              </div>
            )}
            <Button onClick={() => identifyDisease()} disabled={!image || loading} className="w-full">
              {loading ? "Analyzing..." : "Identify Disease"}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-green-800">Disease Information:</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-green max-w-none">
                {result.split("\n").map((line, index) => {
                  if (line.startsWith("Symptoms:") || line.startsWith("Causes:") || line.startsWith("Solutions:")) {
                    return (
                      <h4 key={index} className="text-xl font-semibold mt-4 mb-2 text-green-700">
                        {line}
                      </h4>
                    )
                  } else if (line.match(/^\d+\./) || line.startsWith("-")) {
                    return (
                      <li key={index} className="ml-4 mb-2 text-gray-700">
                        {line}
                      </li>
                    )
                  } else if (line.trim() !== "") {
                    return (
                      <p key={index} className="mb-2 text-gray-800">
                        {line}
                      </p>
                    )
                  }
                  return null
                })}
              </div>

              {relatedQuestions.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-2 text-green-700">Related Questions:</h4>
                  <ul className="space-y-2">
                    {relatedQuestions.map((question, index) => (
                      <li key={index}>
                        <Button
                          variant="outline"
                          onClick={() => askRelatedQuestion(question)}
                          className="text-left w-full justify-start"
                        >
                          {question}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <section id="how-it-works" className="mb-16">
          <h2 className="text-3xl font-extrabold text-green-800 mb-8 text-center">
            How Our AI-Powered Crop Disease Detection Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Step 1: Upload a Clear Image of Your Crop",
                description:
                  "Take a photo of the affected crop using your smartphone or upload an existing image. Ensure good lighting for the best results.",
                icon: Upload,
              },
              {
                title: "Step 2: AI-Powered Image Analysis",
                description:
                  "Our advanced AI scans your image, detects potential diseases, and compares them with a vast agricultural database for accurate identification.",
                icon: Search,
              },
              {
                title: "Step 3: Get Instant Results & Treatment Recommendations",
                description:
                  "Receive a detailed report with disease identification, severity analysis, and expert-recommended treatment options, including organic and chemical solutions.",
                icon: Info,
              },
            ].map((step, index) => (
              <Card key={index} className="transition duration-300 ease-in-out transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-green-600 mb-4">{index + 1}</div>
                  <step.icon className="w-12 h-12 text-green-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="product-catalog" className="mb-16">
          <h2 className="text-3xl font-extrabold text-green-800 mb-8 text-center">Kaustubh Agro Product Catalog</h2>
          <ProductCatalog />
        </section>
      </main>

      <footer className="bg-green-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 CropCare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

