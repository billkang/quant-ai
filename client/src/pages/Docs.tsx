import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Input, Typography, Collapse, Empty, Tag, Anchor, Spin } from 'antd'
import { SearchOutlined, BookOutlined } from '@ant-design/icons'
import { docCategories, findSection } from '../docs/config'

const { Title, Text } = Typography

function parseMarkdownSections(
  content: string
): Array<{ level: number; text: string; id: string }> {
  const lines = content.split('\n')
  const result: Array<{ level: number; text: string; id: string }> = []
  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      result.push({ level, text, id })
    }
  }
  return result
}

function renderMarkdown(content: string): JSX.Element {
  const lines = content.split('\n')
  const elements: JSX.Element[] = []
  let listItems: string[] = []
  let inCodeBlock = false
  let codeLines: string[] = []
  let tableHeaders: string[] = []
  let tableRows: string[][] = []
  let inTable = false

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={elements.length} style={{ paddingLeft: 20, margin: '8px 0', lineHeight: 1.8 }}>
          {listItems.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
          ))}
        </ul>
      )
      listItems = []
    }
  }

  const flushCode = () => {
    if (codeLines.length > 0) {
      elements.push(
        <pre
          key={elements.length}
          style={{
            background: 'var(--bg-elevated)',
            padding: 16,
            borderRadius: 8,
            overflowX: 'auto',
            fontSize: 13,
            lineHeight: 1.6,
            border: '1px solid var(--border)',
            margin: '12px 0',
          }}
        >
          <code>{codeLines.join('\n')}</code>
        </pre>
      )
      codeLines = []
    }
  }

  const flushTable = () => {
    if (inTable && tableRows.length > 0) {
      elements.push(
        <div key={elements.length} style={{ overflowX: 'auto', margin: '12px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                {tableHeaders.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      borderBottom: '2px solid var(--border)',
                      padding: '8px 12px',
                      textAlign: 'left',
                      fontWeight: 600,
                      background: 'var(--bg-elevated)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        padding: '8px 12px',
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      tableHeaders = []
      tableRows = []
      inTable = false
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        flushCode()
        inCodeBlock = false
      } else {
        flushList()
        flushTable()
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeLines.push(rawLine)
      continue
    }

    if (line.startsWith('|')) {
      const cells = line
        .split('|')
        .map(c => c.trim())
        .filter(c => c !== '')
      if (cells.every(c => c.match(/^:?-+:?$/))) {
        inTable = true
        continue
      }
      if (!inTable) {
        tableHeaders = cells
        inTable = true
      } else {
        tableRows.push(cells)
      }
      continue
    } else if (inTable) {
      flushTable()
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/)
    if (headingMatch) {
      flushList()
      const level = headingMatch[1].length
      const text = headingMatch[2].trim()
      const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      const Tag = `h${level}` as keyof JSX.IntrinsicElements
      elements.push(
        <Tag
          key={elements.length}
          id={id}
          style={{
            marginTop: level === 1 ? 0 : 24,
            marginBottom: 12,
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.4,
            fontSize: level === 1 ? 28 : level === 2 ? 22 : 18,
          }}
        >
          {text}
        </Tag>
      )
      continue
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      listItems.push(line.slice(2))
      continue
    }

    if (line === '') {
      flushList()
      continue
    }

    elements.push(
      <p
        key={elements.length}
        style={{ margin: '8px 0', lineHeight: 1.8, color: 'var(--text-secondary)' }}
        dangerouslySetInnerHTML={{ __html: inlineFormat(line) }}
      />
    )
  }

  flushList()
  flushCode()
  flushTable()

  return <>{elements}</>
}

function inlineFormat(text: string): string {
  let s = text
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  s = s.replace(
    /`(.+?)`/g,
    '<code style="background:var(--bg-elevated);padding:2px 4px;border-radius:4px;font-size:12px;">$1</code>'
  )
  s = s.replace(
    /\[(.+?)\]\((.+?)\)/g,
    '<a href="$2" style="color:var(--accent);text-decoration:none;">$1</a>'
  )
  return s
}

export default function Docs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialKey = searchParams.get('section') || 'overview'
  const [activeKey, setActiveKey] = useState(initialKey)
  const [searchText, setSearchText] = useState('')
  const [contentMap, setContentMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const key = searchParams.get('section') || 'overview'
    setActiveKey(key)
  }, [searchParams])

  const currentSection = useMemo(() => findSection(activeKey), [activeKey])

  const loadContent = useCallback(
    async (file: string) => {
      if (contentMap[file]) return
      setLoading(true)
      try {
        const res = await fetch(`/docs/${file}`)
        const text = await res.text()
        setContentMap(prev => ({ ...prev, [file]: text }))
      } catch {
        setContentMap(prev => ({ ...prev, [file]: '加载文档失败，请稍后重试。' }))
      } finally {
        setLoading(false)
      }
    },
    [contentMap]
  )

  useEffect(() => {
    if (currentSection) {
      loadContent(currentSection.file)
    }
  }, [currentSection, loadContent])

  const currentContent = useMemo(() => {
    if (!currentSection) return ''
    return contentMap[currentSection.file] || ''
  }, [currentSection, contentMap])

  const filteredCategories = useMemo(() => {
    if (!searchText.trim()) return docCategories
    const lower = searchText.toLowerCase()
    return docCategories
      .map(cat => ({
        ...cat,
        sections: cat.sections.filter(
          s => s.title.toLowerCase().includes(lower) || s.key.toLowerCase().includes(lower)
        ),
      }))
      .filter(cat => cat.sections.length > 0)
  }, [searchText])

  const anchorItems = useMemo(() => {
    if (!currentContent) return []
    return parseMarkdownSections(currentContent).map(h => ({
      key: h.id,
      href: `#${h.id}`,
      title: h.text,
    }))
  }, [currentContent])

  const handleSectionClick = (key: string) => {
    setSearchParams({ section: key })
    setActiveKey(key)
    if (contentRef.current && 'scrollTo' in contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 112px)', gap: 24 }}>
      {/* Left Sidebar */}
      <div
        style={{
          width: 280,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-surface)',
          borderRadius: 12,
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 16px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <BookOutlined style={{ fontSize: 18, color: 'var(--accent)' }} />
            <Title level={5} style={{ margin: 0, color: 'var(--text-primary)' }}>
              使用手册
            </Title>
          </div>
          <Input
            prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
            placeholder="搜索文档..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ borderRadius: 8 }}
            allowClear
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 16px' }}>
          {filteredCategories.length === 0 && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="未找到匹配内容"
              style={{ marginTop: 24 }}
            />
          )}
          <Collapse
            ghost
            defaultActiveKey={docCategories.map(c => c.key)}
            items={filteredCategories.map(cat => ({
              key: cat.key,
              label: (
                <Text strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>
                  {cat.title}
                </Text>
              ),
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {cat.sections.map(section => {
                    const isActive = section.key === activeKey
                    return (
                      <button
                        key={section.key}
                        onClick={() => handleSectionClick(section.key)}
                        style={{
                          textAlign: 'left',
                          padding: '8px 12px',
                          borderRadius: 6,
                          border: 'none',
                          background: isActive ? 'var(--accent-soft)' : 'transparent',
                          color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                          fontSize: 13,
                          cursor: 'pointer',
                          fontWeight: isActive ? 600 : 400,
                          transition: 'all 0.2s ease',
                          width: '100%',
                        }}
                        onMouseEnter={e => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'var(--bg-hover)'
                            e.currentTarget.style.color = 'var(--text-primary)'
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = 'var(--text-secondary)'
                          }
                        }}
                      >
                        {section.title}
                      </button>
                    )
                  })}
                </div>
              ),
            }))}
          />
        </div>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        style={{
          flex: 1,
          background: 'var(--bg-surface)',
          borderRadius: 12,
          border: '1px solid var(--border)',
          overflowY: 'auto',
          padding: '32px 40px',
        }}
      >
        {currentSection ? (
          <div>
            {searchText && (
              <Tag
                color="blue"
                style={{ marginBottom: 16, fontSize: 12 }}
                closable
                onClose={() => setSearchText('')}
              >
                搜索: {searchText}
              </Tag>
            )}
            <article style={{ maxWidth: 800 }}>
              {loading && !currentContent ? (
                <Spin style={{ marginTop: 120, display: 'block' }} />
              ) : (
                renderMarkdown(currentContent)
              )}
            </article>
          </div>
        ) : (
          <Empty description="请选择文档章节" style={{ marginTop: 120 }} />
        )}
      </div>

      {/* Right Anchor */}
      {anchorItems.length > 0 && (
        <div
          style={{
            width: 180,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'sticky',
              top: 24,
              background: 'var(--bg-surface)',
              borderRadius: 12,
              border: '1px solid var(--border)',
              padding: '16px 12px',
            }}
          >
            <Text
              strong
              style={{
                display: 'block',
                marginBottom: 12,
                fontSize: 13,
                color: 'var(--text-primary)',
              }}
            >
              本章目录
            </Text>
            <Anchor
              affix={false}
              items={anchorItems}
              style={{ background: 'transparent', fontSize: 12 }}
              onClick={(e: React.MouseEvent<HTMLElement>, link: { href: string }) => {
                e.preventDefault()
                const el = document.querySelector(link.href)
                if (el && contentRef.current) {
                  contentRef.current.scrollTo({
                    top: (el as HTMLElement).offsetTop - 24,
                    behavior: 'smooth',
                  })
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
