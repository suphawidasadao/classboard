'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../../components/Navbar'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/forget-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'เกิดข้อผิดพลาด')
      } else {
        setMessage('✅ เราได้ส่งลิงก์เปลี่ยนรหัสไปที่อีเมลของคุณแล้ว')
        setEmail('')

        localStorage.setItem('resetEmail', email)

        if (data.resetUrl) {
          const token = data.resetUrl.split('/').pop()
          router.push(`/reset-password/${token}`)
        }
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen overflow-hidden">
      <Navbar />
      <div className="bg-gradient-to-b bg-[#2e003e] flex items-center justify-center px-4 py-80">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Email</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full mb-4 px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900"
            />
            {message && <p className="text-green-600 mb-2">{message}</p>}
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r bg-[#2e003ee3] hover:bg-[#552c62] text-white rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? 'กำลังส่ง...' : 'ต่อไป'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
