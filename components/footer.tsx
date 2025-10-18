import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#1B1A17] border-t border-[#F0A500]/20">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About */}
          <div>
            <h3 className="font-serif text-xl text-[#F0A500] mb-4">MIKENOVA GROUP</h3>
            <p className="text-sm text-[#A8A6A1] leading-relaxed">
              {"A distinctive portfolio of businesses that set a global benchmark for quality and excellence."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium text-[#F0A500] mb-4 tracking-wider">QUICK LINKS</h4>
            <ul className="space-y-2">
              {["Home", "About", "Services", "Products", "Goddess Glow", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    href={item === "Home" ? "/" : `/${item.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm text-[#A8A6A1] hover:text-[#F0A500] transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-medium text-[#F0A500] mb-4 tracking-wider">DIVISIONS</h4>
            <ul className="space-y-2 text-sm text-[#A8A6A1]">
              <li>Beauty & Cosmetics</li>
              <li>Fashion & Accessories</li>
              <li>Home Furniture</li>
              <li>Pharmacy Services</li>
              <li>Real Estate</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium text-[#F0A500] mb-4 tracking-wider">CONTACT</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-[#A8A6A1]">
                <MapPin className="h-4 w-4 text-[#F0A500] mt-0.5 flex-shrink-0" />
                <span>P.O BOX 20950, DAR ES SALAAM, Tanzania</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-[#A8A6A1]">
                <Mail className="h-4 w-4 text-[#F0A500] flex-shrink-0" />
                <span>info@mikenovagroup.co.tz</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-[#A8A6A1]">
                <Mail className="h-4 w-4 text-[#F0A500] flex-shrink-0" />
                <span>mikenovagrouptz@gmail.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-[#A8A6A1]">
                <Phone className="h-4 w-4 text-[#F0A500] flex-shrink-0" />
                <span>+255 675 622 238</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-[#A8A6A1]">
                <Phone className="h-4 w-4 text-[#F0A500] flex-shrink-0" />
                <a
                  href="https://wa.me/255623821175"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F0A500] transition-colors"
                >
                  WhatsApp: +255 623 821 175
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#3A3835] text-center">
          <p className="text-sm text-[#6B6A67]">© {new Date().getFullYear()} MIKENOVA GROUP. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
