"use client"

import { useState } from "react"
import BottomSheet from "@/components/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Share2, Heart, MessageCircle, Bookmark } from "lucide-react"

export default function Home() {
  const [isOpen, setIsOpen] = useState(false)
  const [snapPoint, setSnapPoint] = useState<"closed" | "half" | "full">("closed")

  const handleSnapPointChange = (point: "closed" | "half" | "full") => {
    setSnapPoint(point)
    setIsOpen(point !== "closed")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Main Content */}
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Bottom Sheet Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Interact with the bottom sheet using the controls below or by dragging the handle.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => handleSnapPointChange("half")} className="w-full">
                Half Open
              </Button>
              <Button onClick={() => handleSnapPointChange("full")} className="w-full">
                Full Open
              </Button>
            </div>

            <Button variant="secondary" onClick={() => handleSnapPointChange("closed")} className="w-full">
              Close Sheet
            </Button>
          </CardContent>
        </Card>

        {/* Demo Content */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Features Implemented:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Custom spring animations
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Three snap points (Closed, Half, Full)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Drag gesture support
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Touch and mouse interactions
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Responsive design
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Keyboard navigation (ESC to close)
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={isOpen}
        snapPoint={snapPoint}
        onSnapPointChange={handleSnapPointChange}
        onClose={() => handleSnapPointChange("closed")}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">Share Options</h2>
            <p className="text-sm text-muted-foreground">Choose how you'd like to share this content</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: Share2, label: "Share", color: "bg-blue-100 text-blue-600" },
              { icon: Heart, label: "Like", color: "bg-red-100 text-red-600" },
              { icon: MessageCircle, label: "Comment", color: "bg-green-100 text-green-600" },
              { icon: Bookmark, label: "Save", color: "bg-yellow-100 text-yellow-600" },
            ].map((action, index) => (
              <button
                key={index}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`p-3 rounded-full ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Share via</h3>
            {[
              "Copy Link",
              "Send via Email",
              "Share to Twitter",
              "Share to Facebook",
              "Share to LinkedIn",
              "Send via WhatsApp",
            ].map((option, index) => (
              <button
                key={index}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <span className="text-sm font-medium">{option}</span>
              </button>
            ))}
          </div>

          {/* Settings */}
          <div className="pt-4 border-t">
            <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Settings className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium">Privacy Settings</span>
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
