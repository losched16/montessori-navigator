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
      <div className="relative h-36 sm:h-44">
        <Image
          src={image}
          alt=""
          fill
          className="object-cover"
          style={{ objectPosition }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-800/40 via-navy-800/30 to-[#fafaf8]" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-800/20 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-4">
        <h1 className="text-2xl font-bold text-navy-700">{title}</h1>
        {subtitle && (
          <p className="text-navy-600/60 mt-0.5 text-sm">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
