import { useState } from 'react'
import { Modal, Input, Form, message } from 'antd'
import { stockApi } from '../../services/api'

export default function AddStockModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!code.trim()) {
      message.warning('请输入股票代码')
      return
    }
    setLoading(true)
    try {
      const res = await stockApi.addStock(code.trim())
      if (res.data?.code === 0) {
        message.success('添加成功')
        setCode('')
        onSuccess()
        onClose()
      } else {
        message.error(res.data?.message || '添加失败')
      }
    } catch {
      message.error('添加失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="添加股票"
      open={open}
      onOk={handleAdd}
      onCancel={() => {
        setCode('')
        onClose()
      }}
      confirmLoading={loading}
      okText="添加"
      width={420}
    >
      <Form layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item label="股票代码" required>
          <Input
            placeholder="如: 600519.SH"
            value={code}
            onChange={e => setCode(e.target.value)}
            onPressEnter={handleAdd}
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
