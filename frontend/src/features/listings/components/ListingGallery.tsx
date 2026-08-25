import { useState } from 'react'
import type { Listing } from '@/types/domain'

const fallbackImage = '/listing-placeholder.svg'

export function ListingGallery({ listing }: { listing: Listing }) {
  const images = listing.images.length > 0 ? listing.images : [fallbackImage]
  const [active, setActive] = useState(0)
  return (
    <section aria-label="Thư viện ảnh bất động sản">
      <img src={images[active]} alt={`Ảnh ${active + 1} của ${listing.title}`} className="aspect-[16/10] w-full rounded-xl object-cover" width="1200" height="750" onError={(event) => { event.currentTarget.src = fallbackImage }} />
      {images.length > 1 && <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">{images.map((image, index) => <button type="button" key={`${image}-${index}`} aria-label={`Xem ảnh ${index + 1}`} aria-current={active === index} onClick={() => setActive(index)} className={`overflow-hidden rounded-lg border-2 ${active === index ? 'border-brand-600' : 'border-transparent'}`}><img src={image} alt="" loading="lazy" className="aspect-square w-full object-cover" /></button>)}</div>}
    </section>
  )
}
