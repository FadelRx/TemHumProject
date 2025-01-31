function checkLatestTemperatureAndNotify() {
  const sheet = SpreadsheetApp.openById("1A-r9pZpYXEDMJSq6U9hrw2WMtN8cf-LBLW3_tHi5A7o").getSheetByName('Bana1');
  const data = sheet.getDataRange().getValues(); // ดึงข้อมูลทั้งหมด
  const threshold = 8; // เกณฑ์อุณหภูมิ

  if (data.length <= 1) return; // ไม่มีข้อมูลในชีต (นอกจาก header)

  const lastRow = data.length; // แถวล่าสุด
  const datetime = data[lastRow - 1][0]; // วันที่และเวลา
  const temp = parseFloat(data[lastRow - 1][1]); // อุณหภูมิ
  const checked = data[lastRow - 1][2]; // สถานะตรวจสอบ (ถ้ามีคอลัมน์ C)

  if (checked === "YES") return; // ถ้าข้อมูลนี้ตรวจสอบแล้ว ให้หยุดทำงาน

  if (!isNaN(temp) && temp > threshold) {
     sendDiscordNotification(datetime, temp); // แจ้งเตือนผ่าน Discord

    // อัปเดตสถานะในคอลัมน์ C
    sheet.getRange(lastRow, 3).setValue("YES");
  }
}

// ส่งข้อความแจ้งเตือนผ่าน Discord
function sendDiscordNotification(datetime, temp) {
  const webhookUrl = 'https://discord.com/api/webhooks/1331924595875381291/52WFtuJr6jlcNwZE25PMMxIz4zomKpw5EfnLYo8chsn3np5OdWzuuU66A2Ix-myOXkuv'; // ใส่ Webhook URL ของ Discord

  const message = `⚠️ **แจ้งเตือน: อุณหภูมิตู้เย็นเกินเกณฑ์!**\n` +
                  `🕒 **วันที่และเวลา:** ${datetime}\n` +
                  `🌡️ **อุณหภูมิ:** ${temp}°C\n` +
                  `--------------------`;

  const payload = {
    content: message // ข้อความที่ต้องการแจ้งเตือน
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };

  UrlFetchApp.fetch(webhookUrl, options);
}
