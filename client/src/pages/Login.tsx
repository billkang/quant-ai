import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Form, Input, Button, Tabs, Typography, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
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
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
              data-testid="login-username"
            />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
              data-testid="login-password"
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
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
              data-testid="register-username"
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
              prefix={<MailOutlined />}
              placeholder="邮箱"
              size="large"
              data-testid="register-email"
            />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
              data-testid="register-password"
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
            >
              注册
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-body)',
      }}
    >
      <Card style={{ width: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, color: 'var(--accent)' }}>
            Quant AI
          </Title>
          <Text type="secondary">智能量化平台</Text>
        </div>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          centered
          data-testid="auth-tabs"
        />
      </Card>
    </div>
  )
}
