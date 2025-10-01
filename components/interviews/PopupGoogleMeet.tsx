"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PopupGoogleMeetProps {
  meetingLink: string;
  interviewTitle: string;
  onClose?: () => void;
}

const PopupGoogleMeet: React.FC<PopupGoogleMeetProps> = ({
  meetingLink,
  interviewTitle,
  onClose
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Extract meeting ID from Google Meet URL
  const getMeetingId = (url: string) => {
    const match = url.match(/meet\.google\.com\/([a-z0-9-]+)/i);
    return match ? match[1] : null;
  };

  const meetingId = getMeetingId(meetingLink);

  const handleOpenMeeting = () => {
    if (!meetingId) {
      // Fallback to external link
      window.open(meetingLink, '_blank');
      return;
    }

    setIsConnecting(true);
    
    // Open Google Meet in a popup window
    const popup = window.open(
      meetingLink,
      'google-meet',
      'width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
    );

    if (popup) {
      setPopupWindow(popup);
      setIsPopupOpen(true);
      
      // Focus the popup
      popup.focus();
      
      // Check if popup is closed
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          setIsPopupOpen(false);
          setPopupWindow(null);
          clearInterval(checkClosed);
        }
      }, 1000);
    } else {
      // Popup blocked, fallback to new tab
      window.open(meetingLink, '_blank');
    }
    
    setIsConnecting(false);
  };

  const handleClosePopup = () => {
    if (popupWindow && !popupWindow.closed) {
      popupWindow.close();
    }
    setIsPopupOpen(false);
    setPopupWindow(null);
    if (onClose) {
      onClose();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingLink);
  };

  const handleOpenExternal = () => {
    window.open(meetingLink, '_blank');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (popupWindow && !popupWindow.closed) {
        popupWindow.close();
      }
    };
  }, [popupWindow]);

  if (!meetingId) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Icon icon="solar:danger-triangle-bold" className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Meeting Link</h3>
          <p className="text-gray-600 mb-4">The Google Meet link appears to be invalid.</p>
          <Button onClick={handleOpenExternal} variant="outline">
            <Icon icon="solar:external-link-bold" className="w-4 h-4 mr-2" />
            Open in Google Meet
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon icon="logos:google-meet" className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{interviewTitle}</h3>
          <p className="text-sm text-gray-600">Google Meet Session</p>
        </div>
      </div>

      {/* Meeting Status */}
      <div className="mb-6">
        {isConnecting ? (
          <div className="flex items-center justify-center py-8 bg-blue-50 rounded-lg">
            <div className="text-center">
              <Icon icon="eos-icons:loading" className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-blue-800 font-medium">Opening Google Meet...</p>
              <p className="text-blue-600 text-sm">Please allow popup windows if prompted</p>
            </div>
          </div>
        ) : isPopupOpen ? (
          <div className="flex items-center justify-center py-8 bg-green-50 rounded-lg">
            <div className="text-center">
              <Icon icon="solar:check-circle-bold" className="w-8 h-8 text-green-600 mx-auto mb-4" />
              <p className="text-green-800 font-medium">Meeting Window Open</p>
              <p className="text-green-600 text-sm">Google Meet is running in a separate window</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Icon icon="solar:play-circle-bold" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Ready to join the meeting</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {!isPopupOpen ? (
          <Button
            onClick={handleOpenMeeting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Icon icon="eos-icons:loading" className="w-4 h-4 mr-2 animate-spin" />
                Opening Meeting...
              </>
            ) : (
              <>
                <Icon icon="solar:play-circle-bold" className="w-4 h-4 mr-2" />
                Join Meeting
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-2">
            <Button
              onClick={handleOpenMeeting}
              variant="outline"
              className="w-full"
            >
              <Icon icon="solar:refresh-bold" className="w-4 h-4 mr-2" />
              Reopen Meeting Window
            </Button>
            <Button
              onClick={handleClosePopup}
              variant="outline"
              className="w-full"
            >
              <Icon icon="solar:close-circle-bold" className="w-4 h-4 mr-2" />
              Close Meeting Window
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleOpenExternal}
            variant="outline"
            className="flex-1"
          >
            <Icon icon="solar:external-link-bold" className="w-4 h-4 mr-2" />
            Open in Tab
          </Button>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="flex-1"
          >
            <Icon icon="solar:copy-bold" className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
        </div>
      </div>

      {/* Meeting Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Icon icon="solar:info-circle-bold" className="w-4 h-4" />
            <span>Meeting ID: {meetingId}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon="solar:shield-check-bold" className="w-4 h-4" />
            <span>Secure Meeting</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Meeting Instructions:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Allow popup windows when prompted</li>
          <li>• Ensure your camera and microphone are working</li>
          <li>• Join 5 minutes early to test your setup</li>
          <li>• Use headphones for better audio quality</li>
        </ul>
      </div>
    </Card>
  );
};

export default PopupGoogleMeet;