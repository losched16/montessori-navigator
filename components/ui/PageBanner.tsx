import Image from 'next/image'

interface PageBannerProps {
  image: string
  title: string
  subtitle?: string
  /** Position the image focal point */
  objectPosition?: string
}

export default function PageBanner({ image, title, subtitle, objectPosition = 'center' }: PageBannerProps) {
  return (
    <div className="relative -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-6 overflow-hidden rounded-b-2xl sm:rounded-b-3xl">
      <div className="relative h-44 sm:h-56">
        <Image
          src={image}
          alt=""
          fill
          className="object-cover"
          style={{ objectPosition }}
          priority
        />
        {/* Light veil keeps image visible up top, strong darken at bottom for text */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-[#fafaf8]/30" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-4" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)' }}>
        <h1 className="text-2xl font-bold text-white drop-shadow-md">{title}</h1>
        {subtitle && (
          <p className="text-white/80 mt-0.5 text-sm drop-shadow-sm">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
