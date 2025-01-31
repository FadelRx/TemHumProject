#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <AutoConnect.h>

// กำหนดพินสำหรับ DS18B20
#define ONE_WIRE_BUS 15

// สร้างออบเจ็กต์ OneWire และ DallasTemperature
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// กำหนด Address I2C ของจอ LCD (ปกติคือ 0x27)
LiquidCrystal_I2C lcd(0x27, 16, 2);

// กำหนด URL สำหรับ Google Apps Script Web App
const char* serverName = "https://script.google.com/macros/s/AKfycbzRYqUaaGzypK9E1-YF46y9eZIrDGgAXJhOkiCooxQ6u9n94nzbkrRybbqmaUQzAHi9/exec";

// สร้างตัวแปร AutoConnect
AutoConnect portal;
AutoConnectConfig config;

// ตัวแปรเก็บเวลาสำหรับการบันทึกและอัปเดตข้อมูล
unsigned long previousLogMillis = 0;
unsigned long previousUpdateMillis = 0;
const long logInterval = 60000;  // 1 นาที (60000 มิลลิวินาที)
const long updateInterval = 10000; // 10 วินาที (10000 มิลลิวินาที)

void setup() {
  Serial.begin(115200);

  // ตั้งค่า AutoConnect
  config.autoReconnect = true;
  portal.config(config);

  // เริ่มต้นการทำงานของ LCD
  lcd.begin();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("PCU REFRIG 1");

  // เริ่มต้นการทำงานของ DS18B20
  sensors.begin();

  // เริ่ม AutoConnect Captive Portal
  if (portal.begin()) {
    Serial.println("WiFi connected: " + WiFi.SSID());
    lcd.setCursor(0, 1);
    lcd.print("WiFi connected!");
  } else {
    Serial.println("WiFi connection failed!");
    lcd.setCursor(0, 1);
    lcd.print("WiFi failed!");
  }
}

void loop() {
  // ตรวจสอบการเชื่อมต่อ Wi-Fi ด้วย AutoConnect
  portal.handleClient();

  // อ่านค่าอุณหภูมิจาก DS18B20
  sensors.requestTemperatures();
  float temperature = sensors.getTempCByIndex(0);

  // อัปเดตหน้าจอ LCD ทุก 10 วินาที
  unsigned long currentMillis = millis();
  if (currentMillis - previousUpdateMillis >= updateInterval) {
    previousUpdateMillis = currentMillis;

    lcd.setCursor(0, 1);
    lcd.print("Temp: ");
    lcd.print(temperature);
    lcd.print(" C   ");
    Serial.print("Updated LCD: Temp = ");
    Serial.println(temperature);
  }

  // ส่งข้อมูลไปยัง Google Sheets ทุก 1 นาที
  if (currentMillis - previousLogMillis >= logInterval) {
    previousLogMillis = currentMillis;

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      String serverPath = String(serverName) + "?temp=" + String(temperature);

      http.begin(serverPath.c_str());
      int httpResponseCode = http.GET();

      if (httpResponseCode > 0) {
        Serial.print("HTTP Response code: ");
        Serial.println(httpResponseCode);
        String response = http.getString();
        Serial.println("Response: " + response);
      } else {
        Serial.print("Error code: ");
        Serial.println(httpResponseCode);
      }
      http.end();
    } else {
      Serial.println("WiFi not connected!");
    }
  }
}
