'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export interface FeaturedCarouselSlide {
  id: string
  title: string
  summary: string | null
  thumbnailUrl: string | null
  sourceUrl: string
  contentType: string
  sourceName: string | null
}

function typePillLabel(contentType: string): string {
  if (contentType === 'video' || contentType === 'vlog') return 'VIDEO'
  if (contentType === 'podcast_episode') return 'PODCAST'
  return 'NEWS'
}

export function FeaturedContentCarousel({ slides }: { slides: FeaturedCarouselSlide[] }) {
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  if (slides.length === 0) return null

  const canLoop = slides.length >= 3

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
      <div className="mb-8 text-center">
        <h2
          className="text-sm font-extrabold uppercase tracking-[0.2em] md:text-base"
          style={{ color: 'rgb(234,179,8)' }}
        >
          Featured content
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm md:text-base" style={{ color: 'rgb(212,212,212)' }}>
          Hand-picked fantasy football insights and analysis
        </p>
      </div>

      <div className="featured-carousel-wrap relative -mx-2 px-2 md:mx-0 md:px-0">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          slidesPerView="auto"
          centeredSlides
          centerInsufficientSlides
          spaceBetween={20}
          loop={canLoop}
          speed={600}
          navigation
          pagination={{ clickable: true, dynamicBullets: slides.length > 6 }}
          autoplay={
            reduceMotion
              ? false
              : {
                  delay: 10_000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
          }
          className="featured-swiper pb-10!"
        >
          {slides.map((s) => (
            <SwiperSlide key={s.id}>
              <a
                href={s.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="featured-slide-card group flex h-full flex-col overflow-hidden rounded-xl border transition-[transform,opacity,border-color] duration-300 hover:border-red-800/40 hover:shadow-lg"
                style={{
                  borderColor: 'rgb(38,38,38)',
                  background: 'rgb(18,18,18)',
                }}
              >
                <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-zinc-900">
                  {s.thumbnailUrl ? (
                    <Image
                      src={s.thumbnailUrl}
                      alt={s.title}
                      fill
                      sizes="(max-width: 640px) min(calc(100vw - 3rem), 22.5rem), 384px"
                      className="object-cover transition duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        background:
                          'linear-gradient(135deg, rgb(30,30,30) 0%, rgb(60,20,20) 50%, rgb(20,20,30) 100%)',
                      }}
                    />
                  )}
                  <span
                    className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{ background: 'rgb(234,179,8)', color: 'rgb(10,10,10)' }}
                  >
                    Featured
                  </span>
                  <span
                    className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{ background: 'rgba(22,163,74,0.95)', color: 'white' }}
                  >
                    {typePillLabel(s.contentType)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-2 flex min-h-5 items-center gap-2">
                    <span className="truncate text-xs font-medium" style={{ color: 'rgb(163,163,163)' }}>
                      {s.sourceName ?? 'Partner'}
                    </span>
                  </div>
                  <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors group-hover:text-red-400">
                    {s.title}
                  </h3>
                  {s.summary && (
                    <p className="line-clamp-2 text-xs leading-relaxed" style={{ color: 'rgb(115,115,115)' }}>
                      {s.summary}
                    </p>
                  )}
                </div>
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
