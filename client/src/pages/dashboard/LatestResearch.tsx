import { Card, Table, Tag } from 'antd'
import { AreaChartOutlined } from '@ant-design/icons'

const researchData = [
  {
    name: '趋势增强策略 v3.2',
    time: '2024-06-11 14:32',
    return: '+18.72%',
    up: true,
    chart: 'up',
    sharpe: 1.85,
    drawdown: '-8.21%',
    features: ['MA5', 'Sentiment_3d', 'Macro_Rate'],
  },
  {
    name: '多因子选股 v1.7',
    time: '2024-06-11 11:15',
    return: '+12.34%',
    up: true,
    chart: 'up',
    sharpe: 1.42,
    drawdown: '-6.34%',
    features: ['Volatility_5d', 'RSL_14', 'Turnover_Rate'],
  },
  {
    name: '均值回归策略 v1.2',
    time: '2024-06-10 16:45',
    return: '-3.21%',
    up: false,
    chart: 'down',
    sharpe: -0.32,
    drawdown: '-12.45%',
    features: ['RSL_7', 'High_Low_Range'],
  },
  {
    name: '事件驱动策略 v0.8',
    time: '2024-06-10 09:30',
    return: '+7.85%',
    up: true,
    chart: 'up',
    sharpe: 0.98,
    drawdown: '-7.12%',
    features: ['Event_Strength', 'Sentiment_3d'],
  },
  {
    name: '低波动策略 v2.0',
    time: '2024-06-09 15:20',
    return: '+9.12%',
    up: true,
    chart: 'up',
    sharpe: 1.23,
    drawdown: '-5.98%',
    features: ['Volatility_5d', 'Beta'],
  },
]

const columns = [
  { title: '策略名称', dataIndex: 'name', key: 'name', width: 160 },
  { title: '回测时间', dataIndex: 'time', key: 'time', width: 150 },
  {
    title: '累计收益',
    dataIndex: 'return',
    key: 'return',
    width: 100,
    render: (v: string, record: { up: boolean }) => (
      <span style={{ color: record.up ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{v}</span>
    ),
  },
  {
    title: '',
    key: 'chart',
    width: 80,
    render: (_: unknown, record: { up: boolean }) => (
      <AreaChartOutlined style={{ color: record.up ? '#22c55e' : '#ef4444' }} />
    ),
  },
  { title: '夏普比率', dataIndex: 'sharpe', key: 'sharpe', width: 90 },
  {
    title: '最大回撤',
    dataIndex: 'drawdown',
    key: 'drawdown',
    width: 100,
    render: (v: string) => <span style={{ color: '#ef4444' }}>{v}</span>,
  },
  {
    title: '核心特征',
    dataIndex: 'features',
    key: 'features',
    render: (features: string[]) => (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {features.map(f => (
          <Tag
            key={f}
            style={{
              fontSize: 11,
              borderRadius: 4,
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
              border: 'none',
            }}
          >
            {f}
          </Tag>
        ))}
      </div>
    ),
  },
  {
    title: '操作',
    key: 'action',
    width: 60,
    render: () => <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>→</span>,
  },
]

export default function LatestResearch() {
  return (
    <Card
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}
      title={<span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>最新研究发现</span>}
    >
      <Table
        columns={columns}
        dataSource={researchData}
        rowKey="name"
        pagination={false}
        size="small"
      />
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <a style={{ fontSize: 13, color: 'var(--accent)' }}>查看全部研究结果 →</a>
      </div>
    </Card>
  )
}
