import { Card, Table, Progress } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'

const topFeatures = [
  { name: 'MA5', ic: 0.082, return: '5.21%', score: 0.86 },
  { name: 'Sentiment_3d', ic: 0.063, return: '4.32%', score: 0.78 },
  { name: 'Macro_Rate', ic: 0.052, return: '3.15%', score: 0.65 },
  { name: 'Volatility_5d', ic: 0.041, return: '2.45%', score: 0.52 },
  { name: 'RSL_14', ic: 0.035, return: '1.89%', score: 0.48 },
]

const weakFeatures = [
  { name: 'RSL_7', ic: 0.005, score: 0.02 },
  { name: 'Volume_Change', ic: 0.003, score: 0.08 },
  { name: 'High_Low_Range', ic: -0.001, score: 0.05 },
  { name: 'Turnover_Rate', ic: -0.004, score: 0.02 },
  { name: 'MACD_Signal', ic: -0.006, score: 0.01 },
]

const redundantGroups = [
  { group: 'MA5 ↔ MA10', corr: 0.91 },
  { group: 'MA20 ↔ MA30', corr: 0.89 },
  { group: 'RSL_14 ↔ RSL_7', corr: 0.88 },
  { group: 'Sentiment_1d ↔ Sentiment_2d', corr: 0.87 },
  { group: 'Vol_5d ↔ Vol_10d', corr: 0.86 },
]

const topColumns = [
  { title: '特征名称', dataIndex: 'name', key: 'name', width: 120 },
  { title: 'IC 均值', dataIndex: 'ic', key: 'ic', width: 100, render: (v: number) => v.toFixed(3) },
  { title: '分层收益差', dataIndex: 'return', key: 'return', width: 110 },
  {
    title: '综合得分',
    dataIndex: 'score',
    key: 'score',
    render: (v: number) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Progress
          percent={v * 100}
          size="small"
          showInfo={false}
          strokeColor="#22c55e"
          style={{ width: 80 }}
        />
        <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>{v.toFixed(2)}</span>
      </div>
    ),
  },
]

const weakColumns = [
  { title: '特征名称', dataIndex: 'name', key: 'name', width: 140 },
  { title: 'IC 均值', dataIndex: 'ic', key: 'ic', width: 100, render: (v: number) => v.toFixed(3) },
  {
    title: '综合得分',
    dataIndex: 'score',
    key: 'score',
    render: (v: number) => (
      <span style={{ color: '#ef4444', fontWeight: 600, fontSize: 12 }}>{v.toFixed(2)}</span>
    ),
  },
]

const redundantColumns = [
  { title: '特征组', dataIndex: 'group', key: 'group', width: 200 },
  {
    title: '相关系数',
    dataIndex: 'corr',
    key: 'corr',
    render: (v: number) => (
      <span style={{ color: '#ef4444', fontWeight: 600 }}>{v.toFixed(2)}</span>
    ),
  },
]

export default function FeatureInsights() {
  return (
    <Card
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>特征洞察</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>(Feature Insights)</span>
          <InfoCircleOutlined style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 12,
            }}
          >
            Top 特征（按综合得分）
          </div>
          <Table
            columns={topColumns}
            dataSource={topFeatures}
            rowKey="name"
            pagination={false}
            size="small"
            style={{ background: 'transparent' }}
          />
          <div style={{ textAlign: 'right', marginTop: 8 }}>
            <a style={{ fontSize: 12, color: 'var(--accent)' }}>查看全部 →</a>
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 12,
            }}
          >
            弱/无效特征
          </div>
          <Table
            columns={weakColumns}
            dataSource={weakFeatures}
            rowKey="name"
            pagination={false}
            size="small"
          />
          <div style={{ textAlign: 'right', marginTop: 8 }}>
            <a style={{ fontSize: 12, color: 'var(--accent)' }}>查看全部 →</a>
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 12,
            }}
          >
            冗余特征组（相关性 &gt; 0.8）
          </div>
          <Table
            columns={redundantColumns}
            dataSource={redundantGroups}
            rowKey="group"
            pagination={false}
            size="small"
          />
          <div style={{ textAlign: 'right', marginTop: 8 }}>
            <a style={{ fontSize: 12, color: 'var(--accent)' }}>查看全部 →</a>
          </div>
        </div>
      </div>
    </Card>
  )
}
