"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Share2, Star, Check } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

const products = [
  {
    name: "Organic Micro Complex",
    description:
      "Natural power to soil with a perfect blend of organic nutrients. Contains Humic Acid (12%), Fulvic Acid (8%), Seaweed Extract (7%), and Amino Acid (5%).",
    price: "₹1450",
    image: "/micro-complex.jpeg?height=300&width=300",
    weight: "25 kg",
    crops:
      "Complete nutrition for all types of vegetables, fruits, and grains. Enhances soil fertility and crop yield.",
    features: ["100% Natural Products", "Organic Matter: 62%", "Protein: 5%", "Agricultural Grade"],
    rating: 4.8,
    reviews: 124,
    bestseller: true,
  },
  {
    name: "Farming Vita",
    description:
      "Organic fertilizer that provides essential nutrients for healthy crop growth. ISO 9001:2008 certified product.",
    price: "₹1450",
    image: "/farming-vita.jpeg?height=300&width=300",
    weight: "25 kg",
    crops: "Suitable for all agricultural crops, especially effective during peanut stage.",
    features: ["100% Guaranteed Quality", "Organic Manure", "Best Quality"],
    rating: 4.5,
    reviews: 86,
    bestseller: false,
  },
]

const ProductCatalog = () => {
  const handleBuy = (productName: string) => {
    window.location.href = `tel:9679670701`
  }

  const handleShare = (productName: string) => {
    if (navigator.share) {
      navigator
        .share({
          title: productName,
          text: `Check out ${productName} from Kaustubh Agri!`,
        })
        .catch((err) => {
          console.error("Error sharing:", err)
        })
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {products.map((product, index) => (
        <Card
          key={index}
          className="flex flex-col h-full transition duration-300 ease-in-out hover:shadow-lg border-green-200"
        >
          <CardHeader className="relative pb-0">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-semibold text-green-700">{product.name}</CardTitle>
                <div className="flex items-center mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">({product.reviews} reviews)</span>
                </div>
              </div>
              {product.bestseller && <Badge className="bg-yellow-500 hover:bg-yellow-600">Bestseller</Badge>}
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col gap-4 p-6">
            <div className="relative h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="transition-transform duration-300 hover:scale-105 object-contain"
              />
            </div>
            <div className="space-y-4">
              <p className="text-gray-600 text-base">{product.description}</p>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Key Features:</h4>
                <ul className="space-y-1 text-gray-600">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-4 h-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-green-800 mb-1">Suitable Crops:</h4>
                <p className="text-gray-600 text-base">{product.crops}</p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-auto border-t">
                <div>
                  <p className="text-2xl font-bold text-green-600">{product.price}</p>
                  <p className="text-sm text-gray-500">Net Weight: {product.weight}</p>
                </div>
                <div className="flex space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleShare(product.name)}
                          aria-label="Share product"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share product</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button onClick={() => handleBuy(product.name)} className="bg-green-600 hover:bg-green-700">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact to Buy
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default ProductCatalog

