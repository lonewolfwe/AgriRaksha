import type React from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"

const products = [
  {
    name: "Organic Micro Complex",
    description:
      "Natural power to soil with a perfect blend of organic nutrients. Contains Humic Acid (12%), Fulvic Acid (8%), Seaweed Extract (7%), and Amino Acid (5%).",
    price: "₹1450",
    image: "/micro-complex.jpeg",
    weight: "25 kg",
    crops:
      "Complete nutrition for all types of vegetables, fruits, and grains. Enhances soil fertility and crop yield.",
    features: ["100% Natural Products", "Organic Matter: 62%", "Protein: 5%", "Agricultural Grade"],
  },
  {
    name: "Farming Vita",
    description:
      "Government approved organic fertilizer that provides essential nutrients for healthy crop growth. ISO 9001:2008 certified product.",
    price: "₹1450",
    image:
      "/farming-vita.jpeg",
    weight: "25 kg",
    crops: "Suitable for all agricultural crops, especially effective during peanut stage.",
    features: ["100% Guaranteed Quality", "Government Approved", "Organic Manure", "Best Quality Certification"],
  },
]

const ProductCatalog: React.FC = () => {
  const handleBuy = (productName: string) => {
    window.location.href = `tel:9679670701`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {products.map((product, index) => (
        <Card key={index} className="flex flex-col h-full transition duration-300 ease-in-out hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-green-700">{product.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col gap-4">
            <div className="relative h-[400px] w-full overflow-hidden rounded-lg">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                layout="fill"
                objectFit="contain"
                className="transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">{product.description}</p>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Key Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {product.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-green-800 mb-1">Suitable Crops:</h4>
                <p className="text-gray-600">{product.crops}</p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-auto border-t">
                <div>
                  <p className="text-2xl font-bold text-green-600">{product.price}</p>
                  <p className="text-sm text-gray-500">Net Weight: {product.weight}</p>
                </div>
                <Button onClick={() => handleBuy(product.name)} className="bg-green-600 hover:bg-green-700" size="lg">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact to Buy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default ProductCatalog

