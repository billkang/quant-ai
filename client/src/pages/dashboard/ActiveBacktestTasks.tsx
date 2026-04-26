import { Card, Progress } from 'antd'
import { ExperimentOutlined, LineChartOutlined, ThunderboltOutlined } from '@ant-design/icons'

const tasks = [
  {
    name: '策略动量增强 v2.1',
    progress: 68,
    features: 'MA5, Sentiment_3d, Macro_Rate',
    remaining: '00:15:23',
    icon: <ExperimentOutlined />,
    color: '#3b82f6',
  },
  {
    name: '均值回归策略 v1.3',
    progress: 42,
    features: 'RSL_14, Volatility_5d',
    remaining: '00:28:10',
    icon: <LineChartOutlined />,
    color: '#8b5cf6',
  },
  {
    name: '事件驱动策略 v0.9',
    progress: 25,
    features: 'Event_Strength, Sentiment_3d',
    remaining: '00:32:45',
    icon: <ThunderboltOutlined />,
    color: '#f59e0b',
  },
]

export default function ActiveBacktestTasks() {
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
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>活跃回测任务</span>
          <a style={{ fontSize: 12, color: 'var(--accent)' }}>查看全部 →</a>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tasks.map((task, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: task.color, fontSize: 14 }}>{task.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {task.name}
                </span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                进度 {task.progress}%
              </span>
            </div>
            <Progress
              percent={task.progress}
              size="small"
              strokeColor={task.color}
              showInfo={false}
            />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingLeft: 22 }}>
              <span style={{ display: 'block' }}>特征: {task.features}</span>
              <span style={{ display: 'block', marginTop: 2 }}>预计剩余: {task.remaining}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
