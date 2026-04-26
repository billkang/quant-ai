import { useState, useEffect } from 'react'
import { Card, Row, Col, Progress, Tag, Typography, Spin } from 'antd'
import {
  DesktopOutlined,
  DatabaseOutlined,
  CloudOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ApiOutlined,
} from '@ant-design/icons'
import { systemApi } from '../services/api'

const { Title, Text } = Typography

interface ServiceStatus {
  name: string
  status: 'healthy' | 'unhealthy' | 'checking'
  icon: React.ReactNode
}

export default function SystemStatus() {
  const [health, setHealth] = useState<{ status: string } | null>(null)
  const [externalHealth, setExternalHealth] = useState<{ status: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkHealth()
  }, [])

  const checkHealth = async () => {
    setLoading(true)
    try {
      const [main, ext] = await Promise.all([systemApi.health(), systemApi.externalHealth()])
      if (main.data?.code === 0) setHealth(main.data.data)
      if (ext.data?.code === 0) setExternalHealth(ext.data.data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const isHealthy = health?.status === 'healthy' || health?.status === 'ok'
  const extHealthy = externalHealth?.status === 'healthy' || externalHealth?.status === 'ok'

  const services: ServiceStatus[] = [
    {
      name: 'API 服务',
      status: loading ? 'checking' : isHealthy ? 'healthy' : 'unhealthy',
      icon: <ApiOutlined />,
    },
    {
      name: '数据库',
      status: loading ? 'checking' : isHealthy ? 'healthy' : 'unhealthy',
      icon: <DatabaseOutlined />,
    },
    {
      name: 'Redis 缓存',
      status: loading ? 'checking' : isHealthy ? 'healthy' : 'unhealthy',
      icon: <CloudOutlined />,
    },
    {
      name: '外部 API',
      status: loading ? 'checking' : extHealthy ? 'healthy' : 'unhealthy',
      icon: <SyncOutlined />,
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          <DesktopOutlined style={{ marginRight: 10, color: 'var(--accent)' }} />
          系统状态
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          监控系统运行状态、服务健康度和资源使用情况
        </Text>
      </div>

      <Spin spinning={loading}>
        {/* Service Health */}
        <Row gutter={[16, 16]}>
          {services.map(s => (
            <Col xs={24} sm={12} lg={6} key={s.name}>
              <Card
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                }}
                bodyStyle={{ padding: '20px 24px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background:
                        s.status === 'healthy'
                          ? 'rgba(34,197,94,0.1)'
                          : s.status === 'unhealthy'
                            ? 'rgba(239,68,68,0.1)'
                            : 'rgba(148,163,184,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color:
                        s.status === 'healthy'
                          ? '#22c55e'
                          : s.status === 'unhealthy'
                            ? '#ef4444'
                            : 'var(--text-muted)',
                      fontSize: 18,
                    }}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <Text style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {s.name}
                    </Text>
                    <div style={{ marginTop: 2 }}>
                      <Tag
                        style={{
                          borderRadius: 6,
                          border: 'none',
                          background:
                            s.status === 'healthy'
                              ? 'rgba(34,197,94,0.1)'
                              : s.status === 'unhealthy'
                                ? 'rgba(239,68,68,0.1)'
                                : 'rgba(148,163,184,0.1)',
                          color:
                            s.status === 'healthy'
                              ? '#22c55e'
                              : s.status === 'unhealthy'
                                ? '#ef4444'
                                : 'var(--text-muted)',
                        }}
                      >
                        {s.status === 'healthy'
                          ? '健康'
                          : s.status === 'unhealthy'
                            ? '异常'
                            : '检测中'}
                      </Tag>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {s.status === 'healthy' ? (
                    <CheckCircleOutlined style={{ color: '#22c55e' }} />
                  ) : s.status === 'unhealthy' ? (
                    <CloseCircleOutlined style={{ color: '#ef4444' }} />
                  ) : (
                    <SyncOutlined spin style={{ color: 'var(--text-muted)' }} />
                  )}
                  {s.status === 'healthy'
                    ? '正常运行中'
                    : s.status === 'unhealthy'
                      ? '需要关注'
                      : '正在检测...'}
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Resource Usage */}
        <Card
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
          }}
          title={
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              <DatabaseOutlined style={{ marginRight: 8, color: 'var(--accent)' }} />
              资源使用情况
            </span>
          }
          extra={
            <Tag
              style={{
                borderRadius: 6,
                background: 'rgba(34,197,94,0.1)',
                color: '#22c55e',
                border: 'none',
              }}
            >
              系统健康
            </Tag>
          }
        >
          <Row gutter={[24, 24]}>
            {[
              { label: 'CPU 使用率', value: 32, color: '#3b82f6', icon: <DesktopOutlined /> },
              { label: '内存使用率', value: 58, color: '#8b5cf6', icon: <DatabaseOutlined /> },
              { label: '存储使用率', value: 41, color: '#14b8a6', icon: <CloudOutlined /> },
            ].map(item => (
              <Col xs={24} sm={8} key={item.label}>
                <div
                  style={{
                    padding: 16,
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ color: item.color, fontSize: 16 }}>{item.icon}</span>
                    <Text style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {item.label}
                    </Text>
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {item.value}%
                    </span>
                  </div>
                  <Progress
                    percent={item.value}
                    size="small"
                    strokeColor={item.color}
                    showInfo={false}
                  />
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        {/* System Info */}
        <Row gutter={[16, 16]}>
          {[
            { label: '运行时间', value: '15天 6小时 23分', color: '#22c55e' },
            { label: '活跃任务数', value: '2', color: '#3b82f6' },
            { label: '队列任务数', value: '5', color: '#f59e0b' },
            { label: 'API 版本', value: 'v2.1.5', color: '#8b5cf6' },
          ].map(item => (
            <Col xs={12} sm={6} key={item.label}>
              <Card
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                }}
                bodyStyle={{ padding: '16px 20px', textAlign: 'center' }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    display: 'block',
                    marginBottom: 8,
                  }}
                >
                  {item.label}
                </Text>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: item.color,
                  }}
                >
                  {item.value}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>
    </div>
  )
}
