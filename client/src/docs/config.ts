export interface DocSection {
  key: string
  title: string
  file: string
}

export interface DocCategory {
  key: string
  title: string
  sections: DocSection[]
}

export const docCategories: DocCategory[] = [
  {
    key: 'intro',
    title: '入门指南',
    sections: [
      { key: 'overview', title: '产品概览', file: 'overview.md' },
      { key: 'dashboard', title: '仪表盘', file: 'dashboard.md' },
    ],
  },
  {
    key: 'market',
    title: '行情与研究',
    sections: [
      { key: 'market-analysis', title: '行情分析', file: 'market-analysis.md' },
      { key: 'screener', title: '股票筛选器', file: 'screener.md' },
      { key: 'events', title: '事件查询', file: 'events.md' },
    ],
  },
  {
    key: 'strategy',
    title: '策略与回测',
    sections: [
      { key: 'strategy-management', title: '策略管理', file: 'strategy-management.md' },
      { key: 'backtest', title: '回测报告', file: 'backtest.md' },
    ],
  },
  {
    key: 'portfolio',
    title: '交易与组合',
    sections: [
      { key: 'portfolio', title: '资产组合', file: 'portfolio.md' },
      { key: 'paper-trading', title: '虚拟盘', file: 'paper-trading.md' },
    ],
  },
  {
    key: 'system',
    title: '系统与告警',
    sections: [
      { key: 'alerts', title: '告警与规则', file: 'alerts.md' },
      { key: 'data-management', title: '数据管理', file: 'data-management.md' },
      { key: 'settings', title: '系统设置', file: 'settings.md' },
    ],
  },
]

const allSections = docCategories.flatMap(c => c.sections)

export function findSection(key: string): DocSection | undefined {
  return allSections.find(s => s.key === key)
}
