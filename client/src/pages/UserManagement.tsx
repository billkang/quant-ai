import { Card, Typography, Empty } from 'antd'
import { TeamOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function UserManagement() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          <TeamOutlined style={{ marginRight: 10, color: 'var(--accent)' }} />
          用户管理
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          管理系统用户、权限和角色配置
        </Text>
      </div>
      <Card
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <Empty description="用户管理功能开发中" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    </div>
  )
}
