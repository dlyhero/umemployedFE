import Link from 'next/link'
import React from 'react'




type LogoProps = {
  isWhite?: boolean
}

const Logo: React.FC<LogoProps> = ({ isWhite = false }) => {
  return (
    <div className={`logo cursor-pointer ${isWhite ? 'text-white' : 'text-brand'}`}>
      {/* your logo content */}
      <Link href={`/`} className='dm-serif text-3xl lg:text-5xl'>UE</Link>
    </div>
  )
}

export default Logo