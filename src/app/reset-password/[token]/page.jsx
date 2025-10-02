'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '../../../../components/Navbar'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const savedEmail = localStorage.getItem('resetEmail')
    if (savedEmail) {
      setEmail(savedEmail)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'เกิดข้อผิดพลาด')
      } else {
        localStorage.setItem('resetPassword', password)
        router.push('/login')
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
      <div className="bg-gradient-to-b bg-[#2e003e] flex items-center justify-center px-4 py-52">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">ตั้งรหัสผ่านใหม่</h2>
          <form onSubmit={handleSubmit}>
            {email && (
              <input
                type="email"
                value={email}
                readOnly
                className="w-full mb-4 px-4 py-3 text-sm border border-gray-200 bg-gray-100 rounded-lg"
              />
            )}

            <input
              type="password"
              placeholder="รหัสผ่านใหม่"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full mb-4 px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900"
            />
            <input
              type="password"
              placeholder="ยืนยันรหัสผ่านใหม่"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full mb-4 px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900"
            />
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r bg-[#2e003ee3] hover:bg-[#552c62] text-white rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? 'กำลังบันทึก...' : 'ตั้งรหัสผ่านใหม่'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
