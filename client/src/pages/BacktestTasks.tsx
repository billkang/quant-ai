import { Card, Typography, Empty } from 'antd'
import { ScheduleOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function BacktestTasks() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          <ScheduleOutlined style={{ marginRight: 10, color: 'var(--accent)' }} />
          回测任务
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          管理回测任务队列，查看任务执行状态和进度
        </Text>
      </div>
      <Card
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <Empty description="回测任务功能开发中" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    </div>
  )
}
