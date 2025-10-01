"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmbeddedGoogleMeetProps {
  meetingLink: string;
  interviewTitle: string;
  onClose?: () => void;
}

const EmbeddedGoogleMeet: React.FC<EmbeddedGoogleMeetProps> = ({
  meetingLink,
  interviewTitle,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Extract meeting ID from Google Meet URL
  const getMeetingId = (url: string) => {
    const match = url.match(/meet\.google\.com\/([a-z0-9-]+)/i);
    return match ? match[1] : null;
  };

  const meetingId = getMeetingId(meetingLink);

  useEffect(() => {
    // Set loading to false after a short delay to allow iframe to load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleIframeError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleOpenExternal = () => {
    window.open(meetingLink, '_blank');
  };

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

  if (hasError) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Icon icon="solar:danger-triangle-bold" className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Meeting</h3>
          <p className="text-gray-600 mb-4">There was an issue loading the Google Meet session.</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleOpenExternal}>
              <Icon icon="logos:google-meet" className="w-4 h-4 mr-2" />
              Open in Google Meet
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              <Icon icon="solar:refresh-bold" className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Icon icon="logos:google-meet" className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-900">{interviewTitle}</h3>
            <p className="text-sm text-gray-600">Google Meet Session</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleFullscreen}
            variant="outline"
            size="sm"
          >
            <Icon icon={isFullscreen ? "solar:minimize-square-bold" : "solar:maximize-square-bold"} className="w-4 h-4 mr-2" />
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
          <Button
            onClick={handleOpenExternal}
            variant="outline"
            size="sm"
          >
            <Icon icon="solar:external-link-bold" className="w-4 h-4 mr-2" />
            Open External
          </Button>
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
            >
              <Icon icon="solar:close-circle-bold" className="w-4 h-4 mr-2" />
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Meeting Container */}
      <div className={`relative ${isFullscreen ? 'h-screen' : 'h-[600px]'}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <Icon icon="eos-icons:loading" className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading Google Meet...</p>
            </div>
          </div>
        )}

        <iframe
          src={`https://meet.google.com/${meetingId}`}
          className="w-full h-full border-0"
          allow="camera; microphone; fullscreen; display-capture"
          onError={handleIframeError}
          onLoad={() => setIsLoading(false)}
          title={`Google Meet - ${interviewTitle}`}
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Icon icon="solar:info-circle-bold" className="w-4 h-4" />
            <span>Meeting hosted on Google Meet</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Meeting ID: {meetingId}</span>
            <Button
              onClick={() => navigator.clipboard.writeText(meetingLink)}
              variant="ghost"
              size="sm"
            >
              <Icon icon="solar:copy-bold" className="w-4 h-4 mr-1" />
              Copy Link
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbeddedGoogleMeet;