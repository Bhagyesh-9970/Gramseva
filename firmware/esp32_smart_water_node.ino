/*
 * Smart Water, Stronger Villages — ESP32 Field IoT Node Firmware
 * Target MCU: ESP32-WROOM-32
 * 
 * Hardware Sensors Connected:
 * 1. JSN-SR04T Waterproof Ultrasonic Distance Sensor (Water Level %)
 *    - Trigger Pin: GPIO 5
 *    - Echo Pin: GPIO 18
 * 2. SCT-013-030 Non-Invasive Split-Core AC Current Transformer (Pump Current A)
 *    - ADC Pin: GPIO 34 (ADC1_CH6)
 * 3. YF-DN50 Flanged Hall-Effect Pulse Flow Meter (Flow Rate L/min)
 *    - Pulse Input Pin: GPIO 19 (Hardware Interrupt)
 * 4. Relay Control (Pump Remote Start/Stop): GPIO 23
 * 
 * Protocol: MQTT over Wi-Fi (JSON Telemetry Payload)
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// Wi-Fi & MQTT Credentials
const char* ssid = "GRAM_PANCHAYAT_IOT";
const char* password = "PanchayatSecretPassword";
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;

// Device & Topic Identifiers
const char* DEVICE_ID = "ESP32-NODE-01-SHIVA";
const char* TELEMETRY_TOPIC = "smartpanchayat/v1/shiva/node1/telemetry";
const char* COMMAND_TOPIC = "smartpanchayat/v1/shiva/node1/command";

// Pin Definitions
#define TRIG_PIN 5
#define ECHO_PIN 18
#define CT_PIN 34
#define FLOW_PIN 19
#define PUMP_RELAY_PIN 23

// Calibration Constants
const float TANK_TOTAL_HEIGHT_CM = 500.0; // 5 meters depth
const float SENSOR_OFFSET_CM = 20.0;     // Sensor mounted 20cm above max water level
volatile unsigned int pulseCount = 0;
float flowRateLPM = 0.0;
unsigned long lastFlowSampleTime = 0;

WiFiClient espClient;
PubSubClient client(espClient);

void IRAM_ATTR pulseCounter() {
  pulseCount++;
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(FLOW_PIN, INPUT_PULLUP);
  pinMode(PUMP_RELAY_PIN, OUTPUT);
  digitalWrite(PUMP_RELAY_PIN, HIGH); // Default Relay Closed/Active

  attachInterrupt(digitalPinToInterrupt(FLOW_PIN), pulseCounter, FALLING);

  setupWiFi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback);
}

void setupWiFi() {
  delay(10);
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi connected. IP address: ");
  Serial.println(WiFi.localIP());
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.print("Command received [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);

  // Parse pump toggle command: {"pump_state": true}
  StaticJsonDocument<200> doc;
  deserializeJson(doc, message);
  if (doc.containsKey("pump_state")) {
    bool state = doc["pump_state"];
    digitalWrite(PUMP_RELAY_PIN, state ? HIGH : LOW);
    Serial.println(state ? "Pump Relay Activated (ON)" : "Pump Relay Deactivated (OFF)");
  }
}

void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection to ");
    Serial.println(mqtt_server);
    if (client.connect(DEVICE_ID)) {
      Serial.println("MQTT Broker Connected!");
      client.subscribe(COMMAND_TOPIC);
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" - Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

// 1. Ultrasonic Distance to Water Percentage
float readWaterLevelPct() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  if (duration == 0) return -1.0; // Echo timeout

  float distanceCm = (duration * 0.0343) / 2.0;
  float waterDepthCm = TANK_TOTAL_HEIGHT_CM - (distanceCm - SENSOR_OFFSET_CM);
  float pct = (waterDepthCm / TANK_TOTAL_HEIGHT_CM) * 100.0;
  return constrain(pct, 0.0, 100.0);
}

// 2. CT AC Current (Amperes) Sampling
float readPumpCurrentAmperes() {
  unsigned long startMillis = millis();
  float peakCurrent = 0.0;

  // Sample for 200ms (10 complete 50Hz AC cycles)
  while (millis() - startMillis < 200) {
    int raw = analogRead(CT_PIN);
    float voltage = (raw / 4095.0) * 3.3;
    float current = (voltage - 1.65) * 30.0; // SCT-013-030 calibration
    if (current > peakCurrent) peakCurrent = current;
  }

  float rmsCurrent = peakCurrent * 0.7071; // RMS from peak
  return (rmsCurrent < 0.3) ? 0.0 : rmsCurrent;
}

// 3. Pulse Flow Rate (L/min)
float calculateFlowRate() {
  unsigned long currentMillis = millis();
  unsigned long elapsed = currentMillis - lastFlowSampleTime;
  if (elapsed >= 1000) {
    // Pulse frequency (Hz) to L/min conversion for YF-DN50: F = 0.2 * Q
    flowRateLPM = (pulseCount * 1000.0 / elapsed) / 0.2;
    pulseCount = 0;
    lastFlowSampleTime = currentMillis;
  }
  return flowRateLPM;
}

unsigned long lastTelemetryPublish = 0;

void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();

  calculateFlowRate();

  // Publish telemetry every 3 seconds
  if (millis() - lastTelemetryPublish >= 3000) {
    lastTelemetryPublish = millis();

    float waterLevel = readWaterLevelPct();
    float currentAmperes = readPumpCurrentAmperes();

    StaticJsonDocument<512> doc;
    doc["device_uid"] = DEVICE_ID;
    doc["ip"] = WiFi.localIP().toString();
    doc["rssi"] = WiFi.RSSI();
    doc["timestamp"] = millis();

    JsonObject waterObj = doc.createNestedObject("water");
    waterObj["tank_id"] = "tank-01";
    waterObj["level_pct"] = waterLevel;

    JsonObject pumpObj = doc.createNestedObject("pump");
    pumpObj["pump_id"] = "pump-01";
    pumpObj["current_amperes"] = currentAmperes;
    pumpObj["is_running"] = (currentAmperes > 0.5);

    JsonObject flowObj = doc.createNestedObject("flow");
    flowObj["flow_rate_lpm"] = flowRateLPM;

    char buffer[512];
    serializeJson(doc, buffer);

    Serial.print("Publishing MQTT payload: ");
    Serial.println(buffer);
    client.publish(TELEMETRY_TOPIC, buffer);
  }
}
