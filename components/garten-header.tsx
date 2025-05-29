import Image from "next/image"
import Link from "next/link"
import { Clock } from "lucide-react"

export function GartenHeader() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/garten-logo.png" alt="Garten Logo" width={40} height={40} className="h-10 w-auto" />
            <span className="font-bold text-[#00A651] text-xl">TESTE WHITEKON</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span className="text-sm" id="current-time">
              {new Date().toLocaleString("pt-BR")}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
