import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative h-[600px] sm:h-[500px] md:h-[600px]">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-banner.jpg" // Fixed path to match actual file location
            alt="Brazilian artisanal tote bag London"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-black/20" />
        </div>
        <div className="relative h-full flex flex-col justify-center px-4 sm:px-8 md:px-16 max-w-screen-xl mx-auto">
          <div className="max-w-xl md:ml-0 text-center md:text-left">
            <select 
              className="absolute top-4 right-4 bg-white rounded p-2 text-black"
              aria-label="Select language"
            >
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
            <h1 className="text-white font-playfair text-h1 md:text-display mb-4">
              Artisanal Brazilian Bags in London
            </h1>
            <p className="text-white text-body-large font-opensans mb-6">
              Unique handcrafted pieces with authentic Brazilian craftsmanship
            </p>
            <button 
              className="bg-brazilian-green hover:bg-brazilian-green-dark text-white px-6 py-3 rounded-button font-medium transition-colors"
              aria-label="Shop collection"
            >
              <Link href="/products">Shop Collection</Link>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 px-4 sm:px-8 md:px-16 max-w-screen-xl mx-auto">
        <h2 className="text-center md:text-left font-playfair text-h2 md:text-h1 text-rich-black mb-8">
          Explore Our Collections
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Link href="/produtos?categoria=tote-bags" className="block group">
            <div className="relative h-72 overflow-hidden rounded-card shadow-card">
              <Image
                src="/images/categories/tote-bags.jpg" // Fixed path to match actual file location
                alt="Brazilian artisanal tote bags London"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-white font-playfair text-h3">Tote Bags</h3>
              </div>
            </div>
          </Link>
          <Link href="/produtos?categoria=clutches" className="block group">
            <div className="relative h-72 overflow-hidden rounded-card shadow-card">
              <Image
                src="/images/categories/clutches.jpg" // Fixed path to match actual file location
                alt="Brazilian artisanal clutches London"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-white font-playfair text-h3">Clutches & Evening Bags</h3>
              </div>
            </div>
          </Link>
          <Link href="/produtos?categoria=backpacks" className="block group">
            <div className="relative h-72 overflow-hidden rounded-card shadow-card">
              <Image
                src="/images/categories/backpacks.jpg" // Fixed path to match actual file location
                alt="Brazilian artisanal backpacks London"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-white font-playfair text-h3">Backpacks & Travel</h3>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-16 px-4 sm:px-8 md:px-16 max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-playfair text-h2 md:text-h1 text-rich-black">Our Bestsellers</h2>
          <Link href="/produtos" className="text-brazilian-green font-opensans font-semibold hover:underline">
            View All Products
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-card shadow-card hover:shadow-card-hover transition-shadow">
            <Link href="/produtos/1" className="block">
              <div className="relative pt-[100%]">
                <Image
                  src="/images/products/bahia-leather-tote.jpg" // Fixed path to match actual file location
                  alt="Brazilian artisanal Bahia Leather Tote London"
                  fill
                  className="object-cover rounded-t-card"
                />
                <div className="absolute top-2 right-2 bg-artisanal-amber text-rich-black text-xs font-semibold px-2 py-1 rounded-full">
                  Artisanal
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-playfair text-lg mb-1">Bahia Leather Tote</h3>
                <p className="font-opensans font-semibold mb-2">£165</p>
                <div className="mb-4">
                  <p className="text-sm text-dark-grey italic">“Beautiful craftsmanship, highly recommend!” - Jane D.</p>
                  <div className="flex text-artisanal-amber" aria-label="Rating: 5 stars">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                </div>
                <button 
                  className="w-full bg-white border-2 border-artisanal-amber text-artisanal-amber hover:bg-artisanal-amber/10 px-4 py-2 rounded-button font-medium transition-colors"
                  aria-label="Add Bahia Leather Tote to cart"
                >
                  Add to Cart
                </button>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Artisan Story */}
      <section className="py-16 bg-off-white">
        <div className="px-4 sm:px-8 md:px-16 max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="relative h-80 md:h-96 rounded-lg overflow-hidden">
              <Image
                src="/images/artisan-story.jpg" 
                alt="Brazilian artisan crafting a bag sustainably in London"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="font-playfair text-h2 md:text-h1 text-rich-black mb-4">The Hands Behind Our Bags</h2>
              <p className="font-opensans text-body-large text-dark-grey mb-6">
                Each bag tells a story of Brazilian tradition and craftsmanship. Our artisans combine generations of expertise with sustainable materials to create pieces that are both beautiful and ethical.
              </p>
              <button 
                className="bg-white border-2 border-artisanal-amber text-artisanal-amber hover:bg-artisanal-amber/10 px-6 py-3 rounded-button font-medium transition-colors"
                aria-label="Learn more about our artisans"
              >
                <Link href="/our-artisans">Meet Our Artisans</Link>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-8 md:px-16 max-w-screen-xl mx-auto">
        <h2 className="font-playfair text-h2 md:text-h1 text-rich-black text-center mb-10" aria-label="Customer testimonials">What Our Customers Say</h2>
        <div className="relative max-w-3xl mx-auto">
          <div className="bg-white rounded-card shadow-card px-8 py-10 md:px-10 md:py-12">
            <div className="text-artisanal-amber text-4xl font-playfair">&ldquo;</div>
            <blockquote className="text-center mb-6">
              <p className="font-opensans text-body-large text-dark-grey italic mb-4">
                My Bahia tote is not just a bag, it&apos;s a piece of art. The craftsmanship is impeccable, and I love knowing the story behind who made it.
              </p>
              <footer className="font-opensans font-semibold text-rich-black">Sarah Wilson</footer>
            </blockquote>
            <div className="flex justify-center">
              <div className="flex text-artisanal-amber" aria-label="Rating: 5 stars">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <span className="w-2 h-2 mx-1 rounded-full bg-artisanal-amber"></span>
            <span className="w-2 h-2 mx-1 rounded-full bg-medium-grey"></span>
            <span className="w-2 h-2 mx-1 rounded-full bg-medium-grey"></span>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-brazilian-green text-white">
        <div className="px-4 sm:px-8 md:px-16 max-w-screen-xl mx-auto text-center">
          <h2 className="font-playfair text-h2 md:text-h1 text-white mb-4">Join Our Community</h2>
          <p className="font-opensans text-body max-w-xl mx-auto mb-8">
            Subscribe for exclusive offers, artisan stories, and new arrivals
          </p>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Your email address"
              aria-label="Email address for newsletter subscription"
              className="flex-1 px-4 py-3 rounded-input text-rich-black w-full focus:outline-none focus:ring-2 focus:ring-artisanal-amber"
              required
            />
            <button 
              type="submit" 
              className="bg-artisanal-amber hover:bg-artisanal-amber-dark text-rich-black font-semibold px-6 py-3 rounded-button transition-colors sm:w-auto w-full"
              aria-label="Subscribe to newsletter"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-4 text-sm">By subscribing, you agree to our <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-rich-black text-white px-4 sm:px-8 md:px-16">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2025 Martha Campos. All rights reserved. Prices include VAT.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/privacy-policy" className="underline">Privacy Policy</Link>
            <Link href="/terms-of-service" className="underline">Terms of Service</Link>
            <Link href="/cookie-policy" className="underline">Cookie Policy</Link>
            <Link href="/store-locator" className="underline">Find Our London Store</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}