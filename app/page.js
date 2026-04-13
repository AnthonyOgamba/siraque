"use client";

export default function HomePage() {
  return (
    <main className="bg-[#f9f9fb] text-[#2d3338] min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl">
        <nav className="max-w-screen-2xl mx-auto px-10 flex justify-between items-center h-20">
          <div className="flex items-center gap-12">
            <a href="#" className="text-2xl font-bold tracking-tighter text-slate-900">
              Siraque
            </a>

            <div className="hidden md:flex items-center gap-8 tracking-tight">
              <a href="#" className="text-slate-600 hover:text-orange-600 transition-all duration-300">
                Products
              </a>
              <a href="#" className="text-slate-600 hover:text-orange-600 transition-all duration-300">
                Services
              </a>
              <a href="#" className="text-slate-600 hover:text-orange-600 transition-all duration-300">
                Rentals
              </a>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              <span className="mr-2 text-slate-500"></span>
              <input
                type="text"
                placeholder="Find anything..."
                className="bg-transparent border-none outline-none text-sm w-48"
              />
            </div>

            <div className="flex items-center gap-4">
              <button className="text-slate-600 hover:text-orange-600 transition-colors duration-300">
                ✉️
              </button>
              <button className="text-slate-600 hover:text-orange-600 transition-colors duration-300">
                🛒
              </button>
              <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 hover:border-orange-600 transition-all cursor-pointer">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEksb-bc8PqnKCwYIuCp5Wy95NPV7rDp1bLwfzg-1iekYB_9omIS9W-Ota_OuhYiQxqC1NYnRKqoTCiUGkwegrq74f4WJGoiNNN_JtH-GtT70hXnrdRiD0jJyiz946pANAKUfHYhIFUH_cRlaYkwp1sXiyLZ3PCAWsx2SoyxUjVDZT9SnAUW9qza5M55c-LgVYLnni3NybDONX5i6xpaWY7ItPRJUY_O0qse194wsp69cGiPKtEHWPuZetaUWiM2p4q6S49nGBYbJk"
                  alt="User profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </nav>
      </header>

      <section className="relative min-h-screen flex items-center overflow-hidden pt-20 bg-[#f9f9fb]">
        <div className="max-w-screen-2xl mx-auto px-10 w-full grid grid-cols-12 gap-10 z-10">
          <div className="col-span-12 lg:col-span-7 flex flex-col justify-center">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-600 mb-6">
              Discover the Extraordinary
            </span>

            <h1 className="text-[3.5rem] font-bold leading-tight tracking-[-0.04em] text-slate-900 mb-8">
              The Hub for Everything <br />
              You <span className="text-orange-600 italic">Need.</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-lg mb-12 leading-relaxed">
              Curating the world&apos;s finest products, elite professional services,
              and premium rentals into one seamless destination.
            </p>

            <div className="bg-white p-2 rounded-[1.5rem] shadow-[0_12px_40px_rgba(230,81,0,0.05)] border border-slate-200 flex items-center max-w-2xl">
              <div className="flex-1 flex items-center px-6">
                <span className="text-orange-600 mr-3"></span>
                <input
                  type="text"
                  placeholder="Search products, services, or rentals..."
                  className="w-full border-none outline-none text-slate-900 text-lg py-3 bg-transparent"
                />
              </div>

              <button className="bg-orange-600 text-white px-8 py-4 rounded-[1rem] font-semibold hover:bg-orange-700 transition-all duration-300">
                Discover
              </button>
            </div>

            <div className="flex gap-8 mt-12 items-center">
              <div className="flex -space-x-3">
                <img
                  className="w-10 h-10 rounded-full border-2 border-white"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-9_s2IwwI1_LatEY6gZ_zCGjIdR3He8SOafuAsSzClDoNnzwuBeP-GxIXdlkv0g6-C35w3XQfyLxr8kLrZr50NddH0m7jHUWE0aADxNjWZVnzQtDEwsmnWPFwL6G3sUimn0TfD_uzpwfNvhLwvrABb7DDFXh8UHC6jAvw3ytPLRZb7KPXeVGTwXg75-ZYJJ8R9NksFDxgkDMQdOJTJCsWwpENfHELB_dj8_ZnCRBOyIdWeh5ceWUlXvg0NqNiE8uY0LhozV8ZC-Pe"
                  alt="User 1"
                />
                <img
                  className="w-10 h-10 rounded-full border-2 border-white"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuArYs70FpB1sHwaUhQqiAgEDmI8xgXbUcaE2rVtd5hxXokpg0G8ZYXh4CxlXG0yTLoQyDI-L8b9wiSXnfozt6XjFeEaqEPf6wX_R8bnM1oavc6MHP4-N8wnP1Ytdz53GY2WZ0nM0IPTykjxULMauYkgcVQgdHgDGPD2qzQFwzBiUC4XJMQkZB3aI6-d1i2Das33pVf_RjMa9_a-G6z-BcBu4Uxek8k8x3r5lDNV4Pm9nILsrhzKM4KRw8ILJY9ozXbQdeyNUGvqhlBM"
                  alt="User 2"
                />
                <img
                  className="w-10 h-10 rounded-full border-2 border-white"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDV7mmNgXEa4pYRzWPf2oALf8jZR5BSB_yYA0pr5_hFVk4A0bfO_banlNskDa8sKzxKD5Hxvx-qD-c98Ip9AsAaDD_1O4IDsDNgCthWiY7oY9YfJQb3Ulmz4lWLv1Memgkgu-wiwoOwhoOBHtIUt1LbZQtdVX5RNvtnxL2N_9bNdCxuKzEoUiDT5RYqgC1BskpEXKpw5p-rz3T86lr7mScRUVebrUa0ZVg-g3ezmMFApHpH2WnYg7bIQzBJZH8ApbgL81IfgxfCMV8n"
                  alt="User 3"
                />
              </div>

              <p className="text-sm text-slate-600 font-medium">
                Joined by 10k+ active users globally
              </p>
            </div>
          </div>

          <div className="hidden lg:block col-span-5 relative">
            <div className="absolute inset-0 bg-orange-600/5 rounded-[2rem] -rotate-3 scale-105"></div>

            <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-2xl">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-oqnnUPs6IWdLHthrEqUbjUGd2409L0AlWZgYF-6mtOYr7CrgInNmTTqseSB02gCIs8-nGXr9IND5IF3_2cxHBJsxPfx2qTXdqNFDHz0zXA4oPnuAa-VmRYeOk3fBhoJ5cBbZHjVAIzNgUYsmvJKQIiUFydl4POm8N8NSD_zuDVHF2bqNDdFD3azSbJnwq6vW55ndmkmQ9xqjObU9FKXrmNqh5noLzvWz9TAgCZNrmphK9MNCOs2EwW8dJSssBaZeVO4BycPp7HcV"
                alt="Featured product"
                className="h-full w-full object-cover"
              />

              <div className="absolute bottom-8 left-8 right-8 bg-white/80 backdrop-blur-md p-6 rounded-xl border border-white/20">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-1">
                      Featured Product
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      Chronos Elite Series
                    </p>
                  </div>
                  <span className="text-orange-600 text-xl">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-[#f9f9fb]">
        <div className="max-w-screen-2xl mx-auto px-10">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-orange-600 mb-4 block">
                Curated Collection
              </span>
              <h2 className="text-[2.5rem] font-bold tracking-tight text-slate-900">
                Featured Products
              </h2>
            </div>

            <a href="#" className="text-orange-600 font-semibold flex items-center gap-2 hover:gap-4 transition-all duration-300">
              View All Marketplace <span>→</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "SonicFlow Studio Gen 3",
                description:
                  "Immersive sound technology with active noise cancellation and 40-hour battery life.",
                price: "$299.00",
                image:
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuCfnjbS9C5otfHCuJADyA7KwHogB4Ff709H0rVy2-ZbpkIkJm50_PJQNxF5iG8GsS2z-Ty8mqb-GyeUz5i-OxufExVicmEeN3JqjjPrSNP5usgoqRo5gkgibIt8uL8yNN8LsUT6Doi9wAbm4iq0ZFhR9QYOmGfdDLZAFRqeGMCJldBmhQfZIloAhBlYFduJy2EEQfl7ZSy3igA_Pq0ntOA-BNT2_3Po-K1K702cy_38KvFPGrTZHUYXw9npJWmZwxFUGJNf-Qq6t_pA",
              },
              {
                title: "AeroPace Running Pro",
                description:
                  "Lightweight breathable mesh design with responsive cushioning for elite athletes.",
                price: "$145.00",
                image:
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuAwvSHsCmIPaDCa2Ur4sV0KzEDF5ApWj7cdRjKxcjznY1EKF2YhtlsEAX6RLgyApIhzU_A6mQCLF0SWoMmgl7RF6UU9FxXqL_8Sk5WWPcKpiGMpakpLRS5AX0ac-TQU0VIrQ8RiaPQNvAW0QQGg9QcTmLBAlwUDVjLkwYLS8eza_uU7vOScXlfMfECzIYvaU8_qjGZQvRpXk-rZdilEfP7aOuXh-pkFKdzpVHgDtG8Q5AyxLWg4wMRe0jKBJ8iwo29t3HU9SXuGHvIC",
              },
              {
                title: "Vintage Frame Camera",
                description:
                  "Analog aesthetics with digital precision. Captured memories in high fidelity.",
                price: "$890.00",
                image:
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuDlBQ4VBZIfXD3Sta7rYpYo9-fidKjQ3H0oRfyIfMwWOMuN3N1gCqZ5HJPCgEMnOIUa8vXzMWyK7YXS3k38W9Ihq0wEUHAVdvqMvGgtrZgdeZqh3p_ooiWHhlpn8LL0tGuIt_yVD7dGmdf1EQpZqlM7bLIxUNCtN2xXgiHcdgJdJOl25zL8ecHB4iFLaiu3JNqTf0xb0drtztHrbwLz1Z51ZdCnUth9_i_cc-IooK4TL3j8hmqN8ZY-lIIEOX3zsLp82O2m2n8-LI8Q",
              },
              {
                title: "Nordic Amber Candle",
                description:
                  "Soy-based luxury candle with notes of sandalwood, cedar, and spiced citrus.",
                price: "$32.00",
                image:
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuD15p0CLc4p9tYsDyaPx-9CozS21svmFBVyCGt3x72WRncHhq3Sx1DPD4EWsqXl7FNYhU2K96tYfbm4vCvKuQbBBv6cD7FavEpErNA_LLbIPXaOXY7MKh6hMGirVb4jzYz6EfPs4JHj6Ow0vbDS92TlUsr0I-b3Mf1ZMNJWSPnkNVYKLQnhjS4cAkNwa0RyuRBMoqU7gfp1bJY9bPqaPhHCyr9WIo_RM-RqA3S_2NbSzxxeRUcF2Z2MPPYuLYop0eeULOxnaI6ONYib",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(12,14,16,0.03)] border border-slate-200 hover:shadow-[0_12px_40px_rgba(230,81,0,0.08)] transition-all duration-300"
              >
                <div className="aspect-square relative overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm">
                    <span className="text-slate-400 group-hover:text-orange-600 transition-colors">♥</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 mb-6 line-clamp-2">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-slate-900">{item.price}</span>
                    <button className="text-orange-600 font-bold text-sm hover:opacity-80">
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-screen-2xl mx-auto px-10">
          <div className="bg-orange-100 rounded-[3rem] p-16 md:p-24 overflow-hidden relative">
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-[3rem] font-bold tracking-tight text-[#5D1A06] mb-6 leading-tight">
                Elevate Your Everyday.
              </h2>
              <p className="text-[#5D1A06]/80 text-lg mb-12">
                Join our exclusive community to receive early access to new product
                drops, elite professional connections, and luxury rental listings.
              </p>

              <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-white border-none px-6 py-4 rounded-2xl outline-none text-slate-900"
                />
                <button className="bg-orange-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all">
                  Join Siraque
                </button>
              </form>

              <p className="mt-6 text-sm text-[#5D1A06]/60">
                No spam. Only the finest curation once a week.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full pt-20 pb-10 bg-slate-50">
        <div className="max-w-screen-2xl mx-auto px-10 grid grid-cols-4 gap-10">
          <div className="col-span-4 lg:col-span-1">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Siraque</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              A premium unified discovery hub curating the best in physical goods,
              professional talent, and high-end rentals.
            </p>
            <div className="flex gap-4 text-slate-400">
              <span className="hover:text-orange-600 cursor-pointer">🌐</span>
              <span className="hover:text-orange-600 cursor-pointer">🔗</span>
              <span className="hover:text-orange-600 cursor-pointer">✉️</span>
            </div>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h4 className="font-bold text-slate-900 mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-slate-500 hover:text-orange-600">About Us</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-orange-600">Careers</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-orange-600">Trust & Safety</a></li>
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h4 className="font-bold text-slate-900 mb-6">Support</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-slate-500 hover:text-orange-600">Help Center</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-orange-600">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-orange-600">Terms of Service</a></li>
            </ul>
          </div>

          <div className="col-span-4 lg:col-span-1">
            <h4 className="font-bold text-slate-900 mb-6">Language</h4>
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg flex justify-between items-center cursor-pointer hover:border-orange-600 transition-colors">
              <span className="text-sm text-slate-600">English (US)</span>
              <span className="text-slate-400 text-sm">⌄</span>
            </div>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-10 mt-20 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© 2024 Siraque. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="text-xs text-slate-400 hover:text-orange-600">Instagram</a>
            <a href="#" className="text-xs text-slate-400 hover:text-orange-600">LinkedIn</a>
            <a href="#" className="text-xs text-slate-400 hover:text-orange-600">Twitter</a>
          </div>
        </div>
      </footer>
    </main>
  );
}