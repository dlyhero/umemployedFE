"use client"

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'

interface SubscriptionModalProps {
  showSubscriptionModal: boolean
  onClose: () => void
}

export default function SubscriptionModal({ showSubscriptionModal, onClose }: SubscriptionModalProps) {
  const router = useRouter()

  return (
    <Dialog open={showSubscriptionModal} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] border-0 shadow-2xl rounded-2xl overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-6 -m-6 mb-4">
          <DialogHeader className="text-white">
            <div className="flex items-center justify-center mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Icon 
                  icon="solar:crown-bold" 
                  className="h-8 w-8 text-yellow-300" 
                />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl font-bold">
              Unlock Premium Features
            </DialogTitle>
            <DialogDescription className="text-center text-blue-100 mt-2">
              Supercharge your job search with AI-powered tools
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-6 px-2">
          {/* Feature highlight */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="bg-gradient-to-r from-orange-100 to-red-100 p-4 rounded-2xl">
              <Icon 
                icon="solar:shield-warning-bold" 
                className="h-12 w-12 text-orange-500 mx-auto" 
              />
            </div>
            <p className="text-gray-700 leading-relaxed">
              This premium feature is designed to give you a competitive edge in today's job market.
            </p>
          </div>

          {/* Premium benefits with modern styling */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Icon 
                icon="solar:star-bold" 
                className="h-5 w-5 text-yellow-500" 
              />
              <h4 className="font-semibold text-gray-800">Premium Benefits</h4>
            </div>
            
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-white/50">
                <div className="bg-green-100 rounded-full p-1">
                  <Icon 
                    icon="solar:magic-stick-3-bold" 
                    className="h-4 w-4 text-green-600" 
                  />
                </div>
                <span className="text-sm text-gray-700 font-medium">
                  AI-powered resume enhancement
                </span>
              </div>
              
              <div className="flex items-center gap-3 p-2 rounded-lg bg-white/50">
                <div className="bg-blue-100 rounded-full p-1">
                  <Icon 
                    icon="solar:infinity-bold" 
                    className="h-4 w-4 text-blue-600" 
                  />
                </div>
                <span className="text-sm text-gray-700 font-medium">
                  Unlimited job applications
                </span>
              </div>
              
              <div className="flex items-center gap-3 p-2 rounded-lg bg-white/50">
                <div className="bg-purple-100 rounded-full p-1">
                  <Icon 
                    icon="solar:rocket-2-bold" 
                    className="h-4 w-4 text-purple-600" 
                  />
                </div>
                <span className="text-sm text-gray-700 font-medium">
                  Priority application review
                </span>
              </div>
              
              <div className="flex items-center gap-3 p-2 rounded-lg bg-white/50">
                <div className="bg-indigo-100 rounded-full p-1">
                  <Icon 
                    icon="solar:chart-bold" 
                    className="h-4 w-4 text-indigo-600" 
                  />
                </div>
                <span className="text-sm text-gray-700 font-medium">
                  Advanced analytics & insights
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-3 pt-6">
          <Button
            onClick={() => router.push('/applicant/pricing')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            <Icon 
              icon="solar:crown-bold" 
              className="h-4 w-4 mr-2" 
            />
            Explore Premium Plans
          </Button>
          
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded-xl transition-all duration-200"
          >
            <Icon 
              icon="solar:arrow-left-bold" 
              className="h-4 w-4 mr-2" 
            />
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}