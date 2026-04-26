import { Row, Col } from 'antd'
import ResearchOverview from './dashboard/ResearchOverview'
import FeatureInsights from './dashboard/FeatureInsights'
import ActiveBacktestTasks from './dashboard/ActiveBacktestTasks'
import LatestResearch from './dashboard/LatestResearch'
import SystemStatusPanel from './dashboard/SystemStatusPanel'

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            Dashboard
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>研究控制台</p>
        </div>
      </div>

      {/* Research Overview Stats */}
      <ResearchOverview />

      {/* Feature Insights */}
      <FeatureInsights />

      {/* Active Backtests + Latest Research + System Status */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <LatestResearch />
        </Col>
        <Col xs={24} lg={6}>
          <ActiveBacktestTasks />
        </Col>
        <Col xs={24} lg={4}>
          <SystemStatusPanel />
        </Col>
      </Row>
    </div>
  )
}
