// "use client"
// import HomeHeader from '@/app/(Home)/Components/HomeHeader'
// import Filters from '@/app/jobs/components/Filters'
// import EnhancedSearch from '@/components/EnhancedSearch'
// import { useCompanyJobs } from '@/hooks/companies/useApplication'
// import { useSession } from 'next-auth/react'
// import React from 'react'

// export default function page() {
//     const {data:session} = useSession()
//     // console.log(useJobApplications())
//     const {data, isLoading, isError} = useCompanyJobs(session?.user?.companyId as string)
//     console.log(useCompanyJobs(session?.user?.companyId as string))
//          return (
//       <div className="min-h-screen bg-white">
//       <div className='bg-blue-950'>
//         <div className=" px-4">
//           <div className="">
//             <div className="flex flex-col items-center justify-center py-24 relative">
//               <div className="text-center text-white">
//                 <h3 className="text-3xl  md:text-5xl dm-serif tracking-wider">
//                   Find Your Dream Job
//                 </h3>
//                 <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto my-10">
//                   Browse thousands of job listings
//                 </p>
//               </div>
//                <EnhancedSearch 
//                  className="mt-6" 
                
//                />
//             </div>
//           </div>
//         </div>
//       </div>

//       <main className="max-w-[1400px] mx-auto px-6 md:px-4 py-12 mt-4 md:mt-18">
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 md:gap-54 items-start">
//           <div className=" lg:col-span-1">
//             <Filters  />
//           </div>

//         </div>
//       </main>
//     </div>
//   )
// }

import React from 'react'

export default function page() {
  return (
    <div>page</div>
  )
}

