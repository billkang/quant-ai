import { Card, Progress } from 'antd'
import { DesktopOutlined, DatabaseOutlined, CloudOutlined } from '@ant-design/icons'

export default function SystemStatusPanel() {
  return (
    <Card
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        height: '100%',
      }}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>系统状态</span>
          <span
            style={{
              fontSize: 12,
              color: '#22c55e',
              background: 'rgba(34,197,94,0.1)',
              padding: '2px 8px',
              borderRadius: 10,
            }}
          >
            健康
          </span>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <DesktopOutlined style={{ color: 'var(--text-muted)', fontSize: 14 }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>CPU 使用率</span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              32%
            </span>
          </div>
          <Progress percent={32} size="small" strokeColor="#3b82f6" showInfo={false} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <DatabaseOutlined style={{ color: 'var(--text-muted)', fontSize: 14 }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>内存使用率</span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              58%
            </span>
          </div>
          <Progress percent={58} size="small" strokeColor="#8b5cf6" showInfo={false} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <CloudOutlined style={{ color: 'var(--text-muted)', fontSize: 14 }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>存储使用率</span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              41%
            </span>
          </div>
          <Progress percent={41} size="small" strokeColor="#14b8a6" showInfo={false} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
          <div
            style={{
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-sm)',
              padding: 12,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
              运行任务数
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>2</div>
          </div>
          <div
            style={{
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-sm)',
              padding: 12,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
              队列任务数
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>5</div>
          </div>
        </div>
        <div
          style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4 }}
        >
          系统运行时间: 15天 6小时 23分
        </div>
      </div>
    </Card>
  )
}
