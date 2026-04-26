import { Card, Typography, Empty } from 'antd'
import { FileTextOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function BacktestReports() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          <FileTextOutlined style={{ marginRight: 10, color: 'var(--accent)' }} />
          回测报告
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          生成和查看回测报告，支持导出PDF和分享
        </Text>
      </div>
      <Card
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <Empty description="回测报告功能开发中" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    </div>
  )
}
