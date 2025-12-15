'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Send, MessageCircle, CheckCircle2 } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'
import { api } from '@/lib/api'
import { io, Socket } from 'socket.io-client'

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  sender?: {
    id: string
    name: string
  }
  receiver?: {
    id: string
    name: string
  }
  createdAt: string
  isRead: boolean
}

interface MessageModalProps {
  isOpen: boolean
  onClose: () => void
  rideId: string
  otherUserId: string
  otherUserName: string
  currentUserId: string
}

export function MessageModal({
  isOpen,
  onClose,
  rideId,
  otherUserId,
  otherUserName,
  currentUserId,
}: MessageModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [sendingMessages, setSendingMessages] = useState<Map<string, string>>(new Map()) // content -> tempId
  const [pendingMessages, setPendingMessages] = useState<Map<string, Message>>(new Map()) // tempId -> message
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Initialize Socket.io connection
  useEffect(() => {
    if (!isOpen) return

    const token = localStorage.getItem('token')
    if (!token) return

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'
    const newSocket = io(`${socketUrl}/messages`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    newSocket.on('connect', () => {
      console.log('Connected to messaging server')
      // Join ride room
      newSocket.emit('join_ride_room', { rideId })
    })

    newSocket.on('new_message', (message: Message) => {
      setMessages((prev) => [...prev, message])
      scrollToBottom()
    })

    newSocket.on('message_sent', (message: Message) => {
      // Find and remove pending message
      setPendingMessages((prev) => {
        const newMap = new Map(prev)
        // Find the pending message with matching content
        for (const [tempId, pendingMsg] of newMap.entries()) {
          if (pendingMsg.content === message.content && pendingMsg.senderId === message.senderId) {
            newMap.delete(tempId)
            break
          }
        }
        return newMap
      })
      
      setSendingMessages((prev) => {
        const newMap = new Map(prev)
        // Remove from sending set
        for (const [content, tempId] of newMap.entries()) {
          if (content === message.content) {
            newMap.delete(content)
            break
          }
        }
        return newMap
      })
      
      setMessages((prev) => {
        // Replace temporary message with real one, or add if new
        const tempIndex = prev.findIndex((m) => m.id.startsWith('temp-') && m.content === message.content && m.senderId === message.senderId)
        if (tempIndex !== -1) {
          const updated = [...prev]
          updated[tempIndex] = message
          return updated
        }
        // Check if message already exists
        if (prev.some((m) => m.id === message.id)) {
          return prev.map((m) => (m.id === message.id ? message : m))
        }
        return [...prev, message]
      })
      scrollToBottom()
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from messaging server')
    })

    setSocket(newSocket)

    return () => {
      if (newSocket) {
        newSocket.emit('leave_ride_room', { rideId })
        newSocket.disconnect()
      }
    }
  }, [isOpen, rideId])

  // Load messages
  useEffect(() => {
    if (isOpen && rideId && otherUserId) {
      loadMessages()
    }
  }, [isOpen, rideId, otherUserId])

  const loadMessages = async () => {
    try {
      setIsLoading(true)
      const response = await api.getMessages(otherUserId, rideId)
      if (response) {
        setMessages(response)
        setTimeout(() => scrollToBottom(), 100)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket) return

    const messageContent = newMessage.trim()
    const tempId = `temp-${Date.now()}-${Math.random()}`
    
    // Create temporary message to show immediately
    const tempMessage: Message = {
      id: tempId,
      content: messageContent,
      senderId: currentUserId,
      receiverId: otherUserId,
      createdAt: new Date().toISOString(),
      isRead: false,
    }
    
    // Add to pending and sending
    setPendingMessages((prev) => new Map(prev).set(tempId, tempMessage))
    setSendingMessages((prev) => new Map(prev).set(messageContent, tempId))
    
    // Add to messages list immediately for instant feedback
    setMessages((prev) => [...prev, tempMessage])
    setNewMessage('')
    scrollToBottom()

    try {
      const messageData = {
        receiverId: otherUserId,
        content: messageContent,
        rideId,
      }

      socket.emit('send_message', messageData, (response: any) => {
        if (response.error) {
          alert(response.error)
          // Remove from pending and messages
          setPendingMessages((prev) => {
            const newMap = new Map(prev)
            newMap.delete(tempId)
            return newMap
          })
          setSendingMessages((prev) => {
            const newMap = new Map(prev)
            newMap.delete(messageContent)
            return newMap
          })
          setMessages((prev) => prev.filter((m) => m.id !== tempId))
        }
        // If successful, message_sent event will handle the update
      })
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
      // Remove from pending and messages
      setPendingMessages((prev) => {
        const newMap = new Map(prev)
        newMap.delete(tempId)
        return newMap
      })
      setSendingMessages((prev) => {
        const newMap = new Map(prev)
        newMap.delete(messageContent)
        return newMap
      })
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{otherUserName}</h3>
              <p className="text-sm text-gray-500">Ride Messages</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.senderId === currentUserId
              const isPending = pendingMessages.has(message.id)
              const isSending = isPending || (sendingMessages.has(message.content) && isOwnMessage && message.id.startsWith('temp-'))
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isOwnMessage
                        ? 'bg-primary-500 text-gray-900'
                        : 'bg-white text-gray-900 border border-gray-200'
                    } ${isSending ? 'opacity-70' : ''}`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words font-medium">{message.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      {!isSending && (
                        <p
                          className={`text-xs ${
                            isOwnMessage ? 'text-gray-700' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      )}
                      {isOwnMessage && (
                        <div className="flex items-center">
                          {isSending ? (
                            <span className="text-xs text-gray-700 ml-1">Sending...</span>
                          ) : (
                            <div className="ml-1 flex items-center">
                              {message.isRead ? (
                                <div className="flex items-center -space-x-1">
                                  <CheckCircle2 className="w-3 h-3 text-gray-700" title="Read" />
                                  <CheckCircle2 className="w-3 h-3 text-gray-700" title="Read" />
                                </div>
                              ) : (
                                <CheckCircle2 className="w-3 h-3 text-gray-700" title="Sent" />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              disabled={!socket}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!newMessage.trim() || !socket}
              className="px-6"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {!socket && (
            <p className="text-xs text-gray-500 mt-2">Connecting to messaging service...</p>
          )}
        </form>
      </div>
    </div>
  )
}


