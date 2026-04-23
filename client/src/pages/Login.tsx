import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Form, Input, Button, Tabs, Typography, message } from 'antd'
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  BarChartOutlined,
  RobotOutlined,
  SafetyOutlined,
} from '@ant-design/icons'
import axios from 'axios'

const { Title, Text } = Typography

async function fetchUserInfo(token: string) {
  try {
    const res = await axios.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.data?.code === 0 && res.data.data?.username) {
      localStorage.setItem('username', res.data.data.username)
    }
  } catch {
    // ignore
  }
}

export default function Login() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('login')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      navigate('/')
    }
  }, [navigate])

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', values)
      if (res.data?.code === 0) {
        const { access_token } = res.data.data
        localStorage.setItem('token', access_token)
        await fetchUserInfo(access_token)
        message.success('登录成功')
        navigate('/')
      } else {
        message.error(res.data?.message || '登录失败')
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      message.error(err.response?.data?.detail || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (values: { username: string; email: string; password: string }) => {
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/register', values)
      if (res.data?.code === 0) {
        const { access_token } = res.data.data
        localStorage.setItem('token', access_token)
        await fetchUserInfo(access_token)
        message.success('注册成功')
        navigate('/')
      } else {
        message.error(res.data?.message || '注册失败')
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      message.error(err.response?.data?.detail || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  const tabItems = [
    {
      key: 'login',
      label: '登录',
      children: (
        <Form onFinish={handleLogin} layout="vertical">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input
              prefix={<UserOutlined style={{ color: 'var(--text-muted)' }} />}
              placeholder="用户名"
              size="large"
              data-testid="login-username"
              style={{
                background: 'var(--bg-elevated)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--text-muted)' }} />}
              placeholder="密码"
              size="large"
              data-testid="login-password"
              style={{
                background: 'var(--bg-elevated)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              data-testid="login-submit"
              style={{ borderRadius: 'var(--radius-sm)', height: 44 }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'register',
      label: '注册',
      children: (
        <Form onFinish={handleRegister} layout="vertical">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input
              prefix={<UserOutlined style={{ color: 'var(--text-muted)' }} />}
              placeholder="用户名"
              size="large"
              data-testid="register-username"
              style={{
                background: 'var(--bg-elevated)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: 'var(--text-muted)' }} />}
              placeholder="邮箱"
              size="large"
              data-testid="register-email"
              style={{
                background: 'var(--bg-elevated)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--text-muted)' }} />}
              placeholder="密码"
              size="large"
              data-testid="register-password"
              style={{
                background: 'var(--bg-elevated)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              data-testid="register-submit"
              style={{ borderRadius: 'var(--radius-sm)', height: 44 }}
            >
              注册
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ]

  const features = [
    { icon: BarChartOutlined, label: '专业级量化回测', desc: '支持 Tick 级与多因子优化' },
    { icon: RobotOutlined, label: 'AI 策略生成', desc: '自然语言驱动，一键生成代码' },
    { icon: SafetyOutlined, label: '数据安全同步', desc: 'A股 / 港股 / 美股全覆盖' },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: 'var(--bg-body)',
      }}
    >
      {/* 左侧品牌区 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px',
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 装饰性背景圆 */}
        <div
          style={{
            position: 'absolute',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            top: -200,
            right: -200,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            bottom: -100,
            left: -100,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 420, textAlign: 'center' }}>
          {/* Logo */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 'var(--radius)',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 32px',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <BarChartOutlined style={{ fontSize: 36, color: '#ffffff' }} />
          </div>

          <Title
            level={2}
            style={{ margin: '0 0 12px', color: '#ffffff', fontWeight: 700, fontSize: 32 }}
          >
            QuantMaster
          </Title>
          <Text
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: 16,
              display: 'block',
              marginBottom: 48,
            }}
          >
            量化策略研究与回测平台
          </Text>

          {/* 特性列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, textAlign: 'left' }}>
            {features.map(f => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <f.icon style={{ fontSize: 18, color: '#ffffff' }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{f.label}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部版权 */}
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            fontSize: 12,
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          © 2025 QuantMaster. All rights reserved.
        </div>
      </div>

      {/* 右侧登录区 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
          background: 'var(--bg-body)',
        }}
      >
        <Card
          style={{
            width: 420,
            maxWidth: '100%',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
          }}
          bodyStyle={{ padding: '40px 36px' }}
        >
          <div style={{ marginBottom: 32 }}>
            <Title
              level={3}
              style={{
                margin: '0 0 8px',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: 24,
              }}
            >
              欢迎回来
            </Title>
            <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              登录您的账户以继续量化研究
            </Text>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            data-testid="auth-tabs"
            style={{ color: 'var(--text-secondary)' }}
          />
        </Card>
      </div>
    </div>
  )
}
