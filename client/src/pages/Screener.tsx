import { useState } from 'react'
import {
  Card,
  Select,
  InputNumber,
  Button,
  Table,
  Space,
  Typography,
  message,
  Modal,
  Input,
} from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  SaveOutlined,
  DeleteOutlined,
  FilterOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import api from '../services/api'

const { Title, Text } = Typography

interface Condition {
  field: string
  operator: string
  value: number
}

interface ScreenerResult {
  code: string
  name: string
  price: number
  pe_ttm?: number
  pb?: number
  roe?: number
  rsi6?: number
}

const FIELD_OPTIONS = [
  { value: 'pe_ttm', label: 'PE(TTM)' },
  { value: 'pb', label: 'PB' },
  { value: 'roe', label: 'ROE(%)' },
  { value: 'rsi6', label: 'RSI6' },
  { value: 'rsi12', label: 'RSI12' },
  { value: 'rsi24', label: 'RSI24' },
  { value: 'debt_ratio', label: '负债率(%)' },
  { value: 'revenue_growth', label: '营收增长(%)' },
  { value: 'profit_growth', label: '利润增长(%)' },
]

const OPERATOR_OPTIONS = [
  { value: '<', label: '<' },
  { value: '>', label: '>' },
  { value: '<=', label: '<=' },
  { value: '>=', label: '>=' },
  { value: '==', label: '=' },
]

export default function Screener() {
  const [conditions, setConditions] = useState<Condition[]>([
    { field: 'pe_ttm', operator: '<', value: 30 },
  ])
  const [results, setResults] = useState<ScreenerResult[]>([])
  const [loading, setLoading] = useState(false)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [templates, setTemplates] = useState<
    { id: number; name: string; conditions: Condition[] }[]
  >([])

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/screener/templates')
      if (res.data?.code === 0) {
        setTemplates(res.data.data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const addCondition = () => {
    setConditions([...conditions, { field: 'pe_ttm', operator: '<', value: 30 }])
  }

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  const updateCondition = (index: number, key: keyof Condition, val: string | number) => {
    const updated = [...conditions]
    updated[index] = { ...updated[index], [key]: val }
    setConditions(updated)
  }

  const handleRun = async () => {
    setLoading(true)
    try {
      const res = await api.post('/screener/run', {
        conditions,
        sort_by: 'pe_ttm',
        sort_order: 'asc',
        limit: 50,
      })
      if (res.data?.code === 0) {
        setResults(res.data.data.stocks)
        message.success(`筛选完成，找到 ${res.data.data.count} 只股票`)
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } }
      message.error(err.response?.data?.detail || '筛选失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTemplate = async () => {
    if (!templateName) {
      message.error('请输入模板名称')
      return
    }
    try {
      await api.post('/screener/templates', {
        name: templateName,
        conditions,
      })
      message.success('模板保存成功')
      setSaveModalOpen(false)
      setTemplateName('')
      fetchTemplates()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } }
      message.error(err.response?.data?.detail || '保存失败')
    }
  }

  const loadTemplate = (template: { conditions: Condition[] }) => {
    setConditions(template.conditions)
  }

  const deleteTemplate = async (id: number) => {
    try {
      await api.delete(`/screener/templates/${id}`)
      message.success('删除成功')
      fetchTemplates()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } }
      message.error(err.response?.data?.detail || '删除失败')
    }
  }

  const addToWatchlist = async (code: string) => {
    try {
      await api.post('/stocks/watchlist', { stock_code: code })
      message.success('已添加到自选股')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } }
      message.error(err.response?.data?.detail || '添加失败')
    }
  }

  const columns = [
    { title: '代码', dataIndex: 'code', key: 'code' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '价格', dataIndex: 'price', key: 'price' },
    { title: 'PE', dataIndex: 'pe_ttm', key: 'pe_ttm' },
    { title: 'PB', dataIndex: 'pb', key: 'pb' },
    { title: 'ROE', dataIndex: 'roe', key: 'roe' },
    { title: 'RSI6', dataIndex: 'rsi6', key: 'rsi6' },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: ScreenerResult) => (
        <Button size="small" icon={<PlusOutlined />} onClick={() => addToWatchlist(record.code)}>
          加自选
        </Button>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Title level={3} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
          智能选股
        </Title>
        <Text style={{ color: 'var(--text-muted)', fontSize: 14 }}>多条件筛选与模板管理</Text>
      </div>

      <Card
        title={
          <Space>
            <FilterOutlined style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>筛选条件</span>
          </Space>
        }
        bodyStyle={{ padding: 20 }}
        data-testid="screener-filters"
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {conditions.map((cond, idx) => (
            <Space key={idx} size="middle">
              <Select
                value={cond.field}
                options={FIELD_OPTIONS}
                style={{ width: 140 }}
                onChange={val => updateCondition(idx, 'field', val)}
              />
              <Select
                value={cond.operator}
                options={OPERATOR_OPTIONS}
                style={{ width: 80 }}
                onChange={val => updateCondition(idx, 'operator', val)}
              />
              <InputNumber
                value={cond.value}
                style={{ width: 120 }}
                onChange={val => updateCondition(idx, 'value', val)}
              />
              {conditions.length > 1 && (
                <Button danger size="small" onClick={() => removeCondition(idx)}>
                  删除
                </Button>
              )}
            </Space>
          ))}
          <Space>
            <Button icon={<PlusOutlined />} onClick={addCondition}>
              添加条件
            </Button>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleRun}
              loading={loading}
              data-testid="screener-search-btn"
            >
              开始筛选
            </Button>
            <Button icon={<SaveOutlined />} onClick={() => setSaveModalOpen(true)}>
              保存模板
            </Button>
          </Space>
        </Space>
      </Card>

      {templates.length > 0 && (
        <Card
          title={
            <Space>
              <FileTextOutlined style={{ color: 'var(--accent)' }} />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>我的模板</span>
            </Space>
          }
          size="small"
        >
          <Space wrap>
            {templates.map(t => (
              <Button key={t.id} size="small" onClick={() => loadTemplate(t)}>
                {t.name}
                <DeleteOutlined
                  style={{ marginLeft: 4, color: '#ef4444' }}
                  onClick={e => {
                    e.stopPropagation()
                    deleteTemplate(t.id)
                  }}
                />
              </Button>
            ))}
          </Space>
        </Card>
      )}

      <Card
        title={
          <Space>
            <UnorderedListOutlined style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              筛选结果 ({results.length})
            </span>
          </Space>
        }
        data-testid="screener-results"
      >
        <Table
          dataSource={results}
          columns={columns}
          rowKey="code"
          size="small"
          pagination={{ pageSize: 20 }}
          data-testid="screener-results-table"
        />
      </Card>

      <Modal
        title="保存筛选模板"
        open={saveModalOpen}
        onOk={handleSaveTemplate}
        onCancel={() => setSaveModalOpen(false)}
      >
        <Input
          placeholder="模板名称"
          value={templateName}
          onChange={e => setTemplateName(e.target.value)}
        />
      </Modal>
    </div>
  )
}
