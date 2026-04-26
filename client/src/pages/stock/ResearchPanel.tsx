import { Card, Space, Tabs, Table } from 'antd'
import { FileTextOutlined } from '@ant-design/icons'
import type { ResearchReportItem, StockNoticeItem } from '../../types/api'

export default function ResearchPanel({
  reports,
  notices,
}: {
  reports: ResearchReportItem[]
  notices: StockNoticeItem[]
}) {
  return (
    <Card
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}
      title={
        <Space>
          <FileTextOutlined style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 600 }}>研报与公告</span>
        </Space>
      }
    >
      <Tabs
        items={[
          {
            key: 'reports',
            label: '研报',
            children: (
              <Table
                dataSource={reports}
                rowKey="id"
                pagination={false}
                locale={{ emptyText: '暂无研报数据' }}
                columns={[
                  { title: '标题', dataIndex: 'title', key: 'title' },
                  { title: '来源', dataIndex: 'source', key: 'source' },
                  { title: '评级', dataIndex: 'rating', key: 'rating' },
                  {
                    title: '目标价',
                    dataIndex: 'targetPrice',
                    key: 'targetPrice',
                    render: (v: number) => v || '-',
                  },
                  { title: '日期', dataIndex: 'publishDate', key: 'publishDate' },
                ]}
              />
            ),
          },
          {
            key: 'notices',
            label: '公告',
            children: (
              <Table
                dataSource={notices}
                rowKey="id"
                pagination={false}
                locale={{ emptyText: '暂无公告数据' }}
                columns={[
                  { title: '标题', dataIndex: 'title', key: 'title' },
                  { title: '分类', dataIndex: 'category', key: 'category' },
                  { title: '来源', dataIndex: 'source', key: 'source' },
                  { title: '日期', dataIndex: 'publishDate', key: 'publishDate' },
                ]}
              />
            ),
          },
        ]}
      />
    </Card>
  )
}
