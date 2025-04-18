"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Analytics } from "@vercel/analytics/react"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Upload, Search, Info, Facebook, Twitter, Instagram, Share2, Phone, Mail, MapPin, CheckCircle, Link, ChevronRight, ChevronLeft } from "lucide-react"
import ProductCatalog from "@/components/product-catalog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  const [image, setImage] = useState<File | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [language, setLanguage] = useState("english")

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
        `You are a knowledgeable agricultural consultant with expertise in plant diseases and organic
         farming solutions. Your experience spans over 15 years, focusing on providing comprehensive information
        about various diseases, their stages, and prevention methods, particularly in the context of organic practices.
         Your task is to provide detailed information about a specific plant disease, including its name, stage, prevention 
         methods, and both chemical and organic solutions. The branding of Kaustubh Agri Organic should be seamlessly integrated
          into your response, emphasizing its products and solutions. `,
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

        Format the output as a simple list of questions, one per line.
        ${language !== "english" ? `Respond in ${language} language.` : ""}`,
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

  const shareResult = () => {
    if (navigator.share && result) {
      navigator
        .share({
          title: "Kaustubh Agri Crop Disease Analysis",
          text: result,
        })
        .catch((err) => {
          console.error("Error sharing:", err)
        })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Sticky Navigation Bar */}
      <header className="bg-gradient-to-r from-emerald-800 to-emerald-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white p-1.5 rounded-full mr-3">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Kaustubh Agri</h1>
            </div>
            <nav className="hidden md:block">
              <ul className="flex space-x-8">
                <li>
                  <a
                    href="#"
                    className="hover:text-white hover:bg-emerald-700/50 px-3 py-2 rounded-md transition duration-200 ease-in-out text-base font-medium"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="hover:text-white hover:bg-emerald-700/50 px-3 py-2 rounded-md transition duration-200 ease-in-out text-base font-medium"
                  >
                    Services
                  </a>
                </li>
                <li>
                  <a
                    href="#product-catalog"
                    className="hover:text-white hover:bg-emerald-700/50 px-3 py-2 rounded-md transition duration-200 ease-in-out text-base font-medium"
                  >
                    Products
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="hover:text-white hover:bg-emerald-700/50 px-3 py-2 rounded-md transition duration-200 ease-in-out text-base font-medium"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </nav>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-emerald-700 to-emerald-600 text-white shadow-lg">
          <nav className="px-4 py-3">
            <ul className="space-y-1">
              <li>
                <a
                  href="#"
                  className="block py-2.5 px-3 rounded-md hover:bg-emerald-700/50 transition duration-200 ease-in-out text-base font-medium"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="block py-2.5 px-3 rounded-md hover:bg-emerald-700/50 transition duration-200 ease-in-out text-base font-medium"
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#product-catalog"
                  className="block py-2.5 px-3 rounded-md hover:bg-emerald-700/50 transition duration-200 ease-in-out text-base font-medium"
                >
                  Products
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="block py-2.5 px-3 rounded-md hover:bg-emerald-700/50 transition duration-200 ease-in-out text-base font-medium"
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-emerald-800 via-emerald-700 to-emerald-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                Protect Your Crops with <span className="text-emerald-200">AI-Powered</span> Disease Detection
              </h1>
              <p className="text-xl mb-8 text-emerald-50 max-w-xl">
                Upload a photo of your crop and get instant disease identification and treatment recommendations.
              </p>
              <Button
  size="lg"
  className="bg-white text-emerald-800 hover:bg-emerald-50 font-medium px-8 py-6 h-auto text-lg shadow-lg transition-all duration-300 hover:shadow-xl mr-4" // Added mr-4 for right margin
  onClick={() => document.getElementById("disease-detection")?.scrollIntoView({ behavior: "smooth" })}
>
  Get Started
</Button>

<a
  href="https://whatsapp.com/channel/0029VbAMsWv7DAWwU1wdRi17"
  className="inline-block bg-white text-emerald-800 hover:bg-emerald-50 font-medium px-8 py-6 h-auto text-lg shadow-lg transition-all duration-300 hover:shadow-xl ml-4" // Added ml-4 for left margin (alternative)
>
  Whatsapp channel
</a>
            </div>
            <div className="relative h-[300px] md:h-[400px]">
              <div className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl border-2 border-emerald-400/20">
                <Image
                  src="/header.jpeg?height=400&width=600"
                  alt="Healthy crops in a field"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Disease Detection Section */}
        <section id="disease-detection" className="mb-16 scroll-mt-20">
          <Card className="mb-8 shadow-xl border-emerald-200 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-t-lg border-b border-emerald-200">
              <CardTitle className="text-3xl font-extrabold text-emerald-800 text-center">
                Identify Crop Diseases
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-8">
                <label htmlFor="image-upload" className="block text-lg font-medium text-gray-700 mb-2">
                  Upload an image of your crop
                </label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-base p-2 h-auto"
                  aria-label="Upload crop image"
                />
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
              <Button
                onClick={() => identifyDisease()}
                disabled={!image || loading}
                className="w-full text-lg py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                aria-label="Identify disease"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    Analyzing...
                  </span>
                ) : (
                  "Identify Disease"
                )}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <Card className="mb-8 shadow-lg border-green-200">
              <CardHeader className="bg-green-100 rounded-t-lg flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-bold text-green-800">Disease Information:</CardTitle>
                <Button variant="outline" size="sm" onClick={shareResult} aria-label="Share results">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </CardHeader>
              <CardContent className="p-6">
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
                        <li key={index} className="ml-4 mb-2 text-gray-700 text-base">
                          {line}
                        </li>
                      )
                    } else if (line.trim() !== "") {
                      return (
                        <p key={index} className="mb-2 text-gray-800 text-base">
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
                            className="text-left w-full justify-start text-base"
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
        </section>

        {/* Farmer Testimonials */}
        <section className="mt-16 mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-emerald-800">What Farmers Are Saying</h2>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-2">
              <Card className="min-w-[20rem] flex-shrink-0 shadow-md bg-white border-emerald-100 border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6 text-sm text-gray-700 italic">
                  “Agri Raksha helped me save my tomato crop.”
                  <div className="mt-2 text-right font-semibold">– Ramesh, Maharashtra</div>
                </CardContent>
              </Card>

              <Card className="min-w-[20rem] flex-shrink-0 shadow-md bg-white border-emerald-100 border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6 text-sm text-gray-700 italic">
                  “I now use only organic methods shared on WhatsApp.”
                  <div className="mt-2 text-right font-semibold">– Kavita, Madhya Pradesh</div>
                </CardContent>
              </Card>

              <Card className="min-w-[20rem] flex-shrink-0 shadow-md bg-white border-emerald-100 border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6 text-sm text-gray-700 italic">
                  “Thanks to Agri Raksha, I've seen a significant improvement in my yield!”
                  <div className="mt-2 text-right font-semibold">– Suresh, Tamil Nadu</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-4 pb-2">
              <Card className="min-w-[20rem] flex-shrink-0 shadow-md bg-white border-emerald-100 border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6 text-sm text-gray-700 italic">
                  “The organic pesticide solutions have been a game-changer for my farm.”
                  <div className="mt-2 text-right font-semibold">– Raghav, Uttar Pradesh</div>
                </CardContent>
              </Card>

              <Card className="min-w-[20rem] flex-shrink-0 shadow-md bg-white border-emerald-100 border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6 text-sm text-gray-700 italic">
                  “I’ve saved costs and increased my income by switching to organic farming.”
                  <div className="mt-2 text-right font-semibold">– Manju, Rajasthan</div>
                </CardContent>
              </Card>

              <Card className="min-w-[20rem] flex-shrink-0 shadow-md bg-white border-emerald-100 border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6 text-sm text-gray-700 italic">
                  “Agri Raksha’s WhatsApp group is a wealth of knowledge. Highly recommend it!”
                  <div className="mt-2 text-right font-semibold">– Arvind, Gujarat</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="mb-16 scroll-mt-20">
          <h2 className="text-3xl font-extrabold text-emerald-800 mb-8 text-center relative">
            <span className="relative inline-block">
              Our Services
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-emerald-500 rounded-full"></span>
            </span>
          </h2>

          <Tabs defaultValue="disease-detection" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-emerald-50 rounded-lg">
              <TabsTrigger
                value="disease-detection"
                className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-md rounded-md py-3 text-base font-medium"
              >
                Disease Detection
              </TabsTrigger>
              <TabsTrigger
                value="treatment-solutions"
                className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-md rounded-md py-3 text-base font-medium"
              >
                Treatment Solutions
              </TabsTrigger>
            </TabsList>
            <TabsContent value="disease-detection" className="border rounded-lg p-6 bg-white shadow-md">
              <h3 className="text-2xl font-bold text-green-700 mb-4">AI-Powered Crop Disease Detection</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Step 1: Upload a Clear Image",
                    description:
                      "Take a photo of the affected crop using your smartphone or upload an existing image. Ensure good lighting for the best results.",
                    icon: Upload,
                  },
                  {
                    title: "Step 2: AI Analysis",
                    description:
                      "Our advanced AI scans your image, detects potential diseases, and compares them with a vast agricultural database for accurate identification.",
                    icon: Search,
                  },
                  {
                    title: "Step 3: Get Instant Results",
                    description:
                      "Receive a detailed report with disease identification, severity analysis, and expert-recommended treatment options.",
                    icon: Info,
                  },
                ].map((step, index) => (
                  <Card key={index} className="transition duration-300 ease-in-out transform hover:scale-105">
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-green-600 mb-4">{index + 1}</div>
                      <step.icon className="w-12 h-12 text-green-600 mb-4" aria-hidden="true" />
                      <h3 className="text-xl font-semibold mb-2 text-gray-800">{step.title}</h3>
                      <p className="text-gray-600 text-base">{step.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="treatment-solutions" className="border rounded-lg p-6 bg-white shadow-md">
              <h3 className="text-2xl font-bold text-green-700 mb-4">Customized Treatment Solutions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold mb-3 text-green-800">Organic Solutions</h4>
                  <ul className="space-y-2 text-base">
                    <li className="flex items-start">
                      <span className="bg-green-200 text-green-800 rounded-full p-1 mr-2 mt-1">✓</span>
                      <span>Natural pest control methods using beneficial insects</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-green-200 text-green-800 rounded-full p-1 mr-2 mt-1">✓</span>
                      <span>Plant-based extracts and oils for disease management</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-green-200 text-green-800 rounded-full p-1 mr-2 mt-1">✓</span>
                      <span>Soil health improvement recommendations</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold mb-3 text-green-800">Chemical Solutions</h4>
                  <ul className="space-y-2 text-base">
                    <li className="flex items-start">
                      <span className="bg-green-200 text-green-800 rounded-full p-1 mr-2 mt-1">✓</span>
                      <span>Targeted fungicides for specific crop diseases</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-green-200 text-green-800 rounded-full p-1 mr-2 mt-1">✓</span>
                      <span>Insecticides for pest management with safety guidelines</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-green-200 text-green-800 rounded-full p-1 mr-2 mt-1">✓</span>
                      <span>Balanced fertilizer recommendations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Product Catalog Section */}
        <section id="product-catalog" className="mb-16 scroll-mt-20">
          <h2 className="text-3xl font-extrabold text-emerald-800 mb-8 text-center relative">
            <span className="relative inline-block">
              Kaustubh Agro Product Catalog
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-emerald-500 rounded-full"></span>
            </span>
          </h2>
          <ProductCatalog />
        </section>

        {/* Contact Section */}
        <section id="contact" className="mb-16 scroll-mt-20">
          <Card className="shadow-xl border-emerald-200 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-t-lg border-b border-emerald-200">
              <CardTitle className="text-3xl font-extrabold text-emerald-800 text-center">Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-green-700">Get In Touch</h3>
                  <p className="mb-4 text-base">
                    Have questions about our products or services? Contact our team for assistance.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 mr-3 text-green-600" aria-hidden="true" />
                      <a href="tel:9679670701" className="text-base hover:text-green-600">
                        +91 9679670701
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 mr-3 text-green-600" aria-hidden="true" />
                      <a href="mailto:info@Kaustubhagri.com" className="text-base hover:text-green-600">
                        info@KaustubhAgri.com
                      </a>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-3 text-green-600" aria-hidden="true" />
                      <span className="text-base">123 Farming Road, Agricultural District</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2 text-green-700">Follow Us</h4>
                    <div className="flex space-x-4">
                      <a href="#" aria-label="Facebook" className="bg-green-100 p-2 rounded-full hover:bg-green-200">
                        <Facebook className="w-5 h-5 text-green-700" />
                      </a>
                      <a href="#" aria-label="Twitter" className="bg-green-100 p-2 rounded-full hover:bg-green-200">
                        <Twitter className="w-5 h-5 text-green-700" />
                      </a>
                      <a href="#" aria-label="Instagram" className="bg-green-100 p-2 rounded-full hover:bg-green-200">
                        <Instagram className="w-5 h-5 text-green-700" />
                      </a>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-green-700">Send Us a Message</h3>
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <Input id="name" placeholder="Your name" className="text-base" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <Input id="email" type="email" placeholder="Your email" className="text-base" />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        placeholder="Your message"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-base"
                      ></textarea>
                    </div>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-all duration-300 shadow-md hover:shadow-lg py-6 h-auto">
                      Send Message
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Kaustubh Agri</h3>
              <p className="text-sm text-green-200">
                Protecting crops with advanced AI technology and sustainable agricultural solutions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-green-200">
                <li>
                  <a href="#" className="hover:text-white">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-white">
                    Services
                  </a>
                </li>
                <li>
                  <a href="#product-catalog" className="hover:text-white">
                    Products
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-sm text-green-200 mb-2">Subscribe for farming tips and updates</p>
              <div className="flex">
                <Input
                  placeholder="Your email"
                  className="rounded-r-none text-black border-emerald-300 focus-visible:ring-emerald-500"
                />
                <Button className="rounded-l-none bg-emerald-500 hover:bg-emerald-600">Subscribe</Button>
              </div>
            </div>
          </div>
          <div className="border-t border-emerald-700/50 mt-8 pt-6 text-center text-sm text-emerald-200">
            <p>&copy; {new Date().getFullYear()} Kaustubh Agri. All rights reserved.</p>
            <div className="flex justify-center space-x-4 mt-4">
              <a href="#" className="text-emerald-300 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-emerald-300 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-emerald-300 hover:text-white transition-colors">
                FAQ
              </a>
            </div>
          </div>
        </div>
      </footer>
      <Analytics />
    </div>
  )
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

