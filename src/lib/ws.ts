class GatewayClient {
  private socket: WebSocket | null = null;
  private heartbeatInterval: number | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  connect(token: string) {
    this.socket = new WebSocket("wss://gateway.discord.gg/?v=9&encoding=json");

    this.socket.onopen = () => {
      // Authentication logic here
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.op) {
        case 10: // Hello event
          this.setupHeartbeat(message.d.heartbeat_interval);
          break;
        // Handle other opcodes/events as needed
      }
    };

    this.socket.onerror = (error) => {
      // Error handling
    };

    this.socket.onclose = () => {
      // Handle disconnection
      this.clearHeartbeat();
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.clearHeartbeat();
    }
  }

  private setupHeartbeat(interval: number) {
    // Clear any existing heartbeat interval
    this.clearHeartbeat();

    // Calculate a jittered interval. The jitter will be a percentage of the interval, between 0 and the jitterFactor.
    const jitterFactor = 0.1; // 10% jitter
    const jitteredInterval = interval * (1 + Math.random() * jitterFactor);

    // Send the first heartbeat immediately
    this.sendHeartbeat();

    // Then continue sending heartbeats at the jittered interval
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, jitteredInterval);
  }

  private sendHeartbeat() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const heartbeat = { op: 1, d: null };
      this.socket.send(JSON.stringify(heartbeat));
    }
  }

  private clearHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

export default new GatewayClient();
