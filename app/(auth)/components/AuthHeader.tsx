import Link from "next/link"

function AuthHeader() {
  return (
    <Link href={`/`} className='max-w-5xl w-full mx-auto md:-translate-y-40 p-4 my-4'>
     <div className="flex">
        <h1 className='text-brand text-xl md:text-2xl'>Umemployed</h1>
     <img src="/logo/png/logo-color.png" className="h-14 w-14" alt="" />
     </div>
    </Link>
  )
}

export default AuthHeader