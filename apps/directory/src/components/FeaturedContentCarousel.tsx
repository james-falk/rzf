'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'

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

      <div className="featured-carousel-wrap -mx-2 px-2 md:mx-0 md:px-0">
        <Swiper
          modules={[Autoplay]}
          centeredSlides
          slidesPerView={1.15}
          spaceBetween={16}
          loop={canLoop}
          speed={600}
          autoplay={
            reduceMotion
              ? false
              : {
                  delay: 10_000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
          }
          breakpoints={{
            640: { slidesPerView: 1.35, spaceBetween: 20 },
            1024: { slidesPerView: 1.5, spaceBetween: 24 },
          }}
          className="featured-swiper pb-2"
        >
          {slides.map((s) => (
            <SwiperSlide key={s.id} className="!h-auto">
              <a
                href={s.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="featured-slide-card group relative block overflow-hidden rounded-2xl border-2 transition-[transform,opacity,border-color] duration-300"
                style={{
                  borderColor: 'rgb(38,38,38)',
                  background: 'rgb(14,14,14)',
                }}
              >
                <div className="relative aspect-[16/10] w-full bg-zinc-900">
                  {s.thumbnailUrl ? (
                    <Image
                      src={s.thumbnailUrl}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 85vw, 520px"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
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
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"
                    aria-hidden
                  />
                  <span
                    className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                    style={{ background: 'rgb(234,179,8)', color: 'rgb(10,10,10)' }}
                  >
                    Featured
                  </span>
                  <span
                    className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                    style={{ background: 'rgba(22,163,74,0.95)', color: 'white' }}
                  >
                    {typePillLabel(s.contentType)}
                  </span>
                  <div className="absolute bottom-0 left-0 right-0 p-4 pt-10">
                    {s.sourceName && (
                      <p className="mb-1 text-[11px] font-medium uppercase tracking-wider" style={{ color: 'rgb(234,179,8)' }}>
                        {s.sourceName}
                      </p>
                    )}
                    <h3 className="line-clamp-2 text-lg font-bold leading-snug text-white md:text-xl">{s.title}</h3>
                    {s.summary && (
                      <p className="mt-2 line-clamp-2 text-sm" style={{ color: 'rgb(163,163,163)' }}>
                        {s.summary}
                      </p>
                    )}
                  </div>
                </div>
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
