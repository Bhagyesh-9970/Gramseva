import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

interface TelemetryContextType {
  isConnected: boolean;
  mode: 'SIMULATION' | 'LIVE_HARDWARE';
  isSimRunning: boolean;
  simSpeed: number;
  activeScenario: string;
  hardwarePanel: any;
  liveTanks: any[];
  livePumps: any[];
  liveSensors: any[];
  lastUpdate: string;
  triggerScenario: (scenario: string) => Promise<void>;
  controlSim: (action: 'START' | 'PAUSE' | 'RESET', speed?: number) => Promise<void>;
  manualAdjust: (sensorType: string, assetId: string, value: number) => Promise<void>;
  toggleMode: (newMode: 'SIMULATION' | 'LIVE_HARDWARE') => Promise<void>;
}

const TelemetryContext = createContext<TelemetryContextType>({
  isConnected: false,
  mode: 'SIMULATION',
  isSimRunning: true,
  simSpeed: 1.0,
  activeScenario: 'NORMAL',
  hardwarePanel: null,
  liveTanks: [],
  livePumps: [],
  liveSensors: [],
  lastUpdate: '',
  triggerScenario: async () => {},
  controlSim: async () => {},
  manualAdjust: async () => {},
  toggleMode: async () => {},
});

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [mode, setMode] = useState<'SIMULATION' | 'LIVE_HARDWARE'>('SIMULATION');
  const [isSimRunning, setIsSimRunning] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1.0);
  const [activeScenario, setActiveScenario] = useState<string>('NORMAL');
  const [hardwarePanel, setHardwarePanel] = useState<any>(null);
  const [liveTanks, setLiveTanks] = useState<any[]>([]);
  const [livePumps, setLivePumps] = useState<any[]>([]);
  const [liveSensors, setLiveSensors] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const wsRef = useRef<WebSocket | null>(null);

  // Initial status fetch
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/simulation/status');
      if (res.ok) {
        const data = await res.json();
        setMode(data.mode);
        setIsSimRunning(data.is_running);
        setSimSpeed(data.speed);
        setActiveScenario(data.active_scenario);
        setHardwarePanel(data.hardware_panel);
      }
    } catch (e) {
      console.error('Error fetching sim status:', e);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Setup WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/telemetry`;

    const connectWs = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'TELEMETRY_UPDATE') {
              if (data.tanks) setLiveTanks(data.tanks);
              if (data.pumps) setLivePumps(data.pumps);
              if (data.sensors) setLiveSensors(data.sensors);
              if (data.active_scenario) setActiveScenario(data.active_scenario);
              if (data.mode) setMode(data.mode);
              setLastUpdate(new Date().toLocaleTimeString());
            }
          } catch (err) {
            console.error('Error parsing telemetry packet:', err);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Reconnect after 3 seconds
          setTimeout(connectWs, 3000);
        };

        ws.onerror = () => {
          setIsConnected(false);
        };
      } catch (e) {
        console.error('WebSocket connection error:', e);
      }
    };

    connectWs();

    // Fallback polling every 5s if ws disconnected
    const interval = setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        fetchStatus();
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const triggerScenario = async (scenario: string) => {
    try {
      const res = await fetch('/api/simulation/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      if (res.ok) {
        setActiveScenario(scenario);
      }
    } catch (e) {
      console.error('Failed to trigger scenario:', e);
    }
  };

  const controlSim = async (action: 'START' | 'PAUSE' | 'RESET', speed?: number) => {
    try {
      const res = await fetch('/api/simulation/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, speed })
      });
      if (res.ok) {
        const data = await res.json();
        setIsSimRunning(data.is_running);
        setSimSpeed(data.speed);
      }
    } catch (e) {
      console.error('Failed to control sim:', e);
    }
  };

  const manualAdjust = async (sensorType: string, assetId: string, value: number) => {
    try {
      await fetch('/api/simulation/sensor-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sensor_type: sensorType, asset_id: assetId, value })
      });
    } catch (e) {
      console.error('Failed to adjust sensor:', e);
    }
  };

  const toggleMode = async (newMode: 'SIMULATION' | 'LIVE_HARDWARE') => {
    try {
      const res = await fetch(`/api/simulation/mode?mode=${newMode}`, { method: 'POST' });
      if (res.ok) {
        setMode(newMode);
      }
    } catch (e) {
      console.error('Failed to toggle mode:', e);
    }
  };

  return (
    <TelemetryContext.Provider value={{
      isConnected,
      mode,
      isSimRunning,
      simSpeed,
      activeScenario,
      hardwarePanel,
      liveTanks,
      livePumps,
      liveSensors,
      lastUpdate,
      triggerScenario,
      controlSim,
      manualAdjust,
      toggleMode
    }}>
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => useContext(TelemetryContext);
