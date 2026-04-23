const WS_URL = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/ws/market`

class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private messageHandlers: Array<(data: unknown) => void> = []
  private subscribedCodes: string[] = []

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return

    try {
      this.ws = new WebSocket(WS_URL)

      this.ws.onopen = () => {
        console.log('[WS] Connected')
        if (this.subscribedCodes.length > 0) {
          this.subscribe(this.subscribedCodes)
        }
      }

      this.ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data)
          this.messageHandlers.forEach(handler => handler(data))
        } catch (e) {
          console.error('[WS] Parse error:', e)
        }
      }

      this.ws.onclose = () => {
        console.log('[WS] Disconnected, reconnecting in 5s...')
        this.reconnectTimer = setTimeout(() => this.connect(), 5000)
      }

      this.ws.onerror = err => {
        console.error('[WS] Error:', err)
      }
    } catch (e) {
      console.error('[WS] Connection failed:', e)
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  subscribe(codes: string[]) {
    this.subscribedCodes = [...new Set([...this.subscribedCodes, ...codes])]
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'subscribe', codes }))
    }
  }

  unsubscribe(codes: string[]) {
    this.subscribedCodes = this.subscribedCodes.filter(c => !codes.includes(c))
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'unsubscribe', codes }))
    }
  }

  onMessage(handler: (data: unknown) => void) {
    this.messageHandlers.push(handler)
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler)
    }
  }
}

export const wsClient = new WebSocketClient()
