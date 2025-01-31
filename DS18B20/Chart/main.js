const sheetName = 'TemperatureData';
const sheet = SpreadsheetApp.openById("1A-r9pZpYXEDMJSq6U9hrw2WMtN8cf-LBLW3_tHi5A7o").getSheetByName('Bana1');

// ฟังก์ชัน doGet() สำหรับ Web App
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

// ฟังก์ชันเพื่อดึงข้อมูลทั้งหมดสำหรับสร้างกราฟ โดยกรองข้อมูลตามช่วงเวลา
function getTemperatureData(interval) {
  const data = sheet.getDataRange().getValues();
  const timestamps = [];
  const temperatures = [];
  const intervalInMinutes = {
    "10min": 10,
    "30min": 30,
    "1hr": 60,
    "1day": 1440
  };

  const filterMinutes = intervalInMinutes[interval];
  let lastTimestamp = null;

  for (let i = 1; i < data.length; i++) {
    const currentTimestamp = new Date(data[i][0]);
    const temperature = parseFloat(data[i][1]);

    if (lastTimestamp === null || (currentTimestamp - lastTimestamp) / (1000 * 60) >= filterMinutes) {
      timestamps.push(currentTimestamp.toLocaleString());
      temperatures.push(temperature);
      lastTimestamp = currentTimestamp;
    }
  }
  return { timestamps, temperatures };
}

// ฟังก์ชันเพื่อดึงอุณหภูมิล่าสุด
function getLatestTemperature() {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const lastRecord = sheet.getRange(lastRow, 2).getValue();
    return parseFloat(lastRecord);
  }
  return null;
}

function getTemperatureDataCSV(interval) {
  const data = sheet.getDataRange().getValues();
  const intervalInMinutes = {
    "10min": 10,
    "30min": 30,
    "1hr": 60,
    "1day": 1440
  };
  
  const filterMinutes = intervalInMinutes[interval];
  let lastTimestamp = null;
  const filteredData = [];

  filteredData.push(["Timestamp", "Temperature"]); // Header

  for (let i = 1; i < data.length; i++) {
    const currentTimestamp = new Date(data[i][0]);
    const temperature = parseFloat(data[i][1]);

    if (lastTimestamp === null || (currentTimestamp - lastTimestamp) / (1000 * 60) >= filterMinutes) {
      filteredData.push([currentTimestamp.toLocaleString(), temperature]);
      lastTimestamp = currentTimestamp;
    }
  }

  // แปลงข้อมูลเป็น CSV
  let csvContent = '';
  filteredData.forEach(row => {
    csvContent += row.join(",") + "\n";
  });
  
  return csvContent;
}

// ฟังก์ชันกรองข้อมูลตามวันที่
    function getTemperatureDataByDate(filterDate) {
      const data = sheet.getDataRange().getValues();
      const timestamps = [];
      const temperatures = [];
      
      const filterDateObj = new Date(filterDate);

      for (let i = 1; i < data.length; i++) {
        const currentTimestamp = new Date(data[i][0]);
        const temperature = parseFloat(data[i][1]);

        // ตรวจสอบว่าข้อมูลอยู่ในวันที่ที่เลือก
        if (
          currentTimestamp.getFullYear() === filterDateObj.getFullYear() &&
          currentTimestamp.getMonth() === filterDateObj.getMonth() &&
          currentTimestamp.getDate() === filterDateObj.getDate()
        ) {
          timestamps.push(currentTimestamp.toLocaleTimeString()); // เวลา
          temperatures.push(temperature); // อุณหภูมิ
        }
      }

      return { timestamps, temperatures };
    }

    function getTemperatureDataByDateAndInterval(filterDate, interval) {
      const data = sheet.getDataRange().getValues(); // ดึงข้อมูลทั้งหมดจากชีต
      const timestamps = [];
      const temperatures = [];

      const filterDateObj = new Date(filterDate); // แปลงวันที่จาก input
      const intervalInMinutes = {
        "10min": 10,
        "30min": 30,
        "1hr": 60,
        "1day": 1440,
      };

      const filterMinutes = intervalInMinutes[interval]; // แปลงช่วงเวลาเป็นนาที
      let lastTimestamp = null;

      for (let i = 1; i < data.length; i++) {
        const currentTimestamp = new Date(data[i][0]); // วันที่และเวลาในชีต
        const temperature = parseFloat(data[i][1]); // อุณหภูมิในชีต

        // ตรวจสอบว่าข้อมูลอยู่ในวันที่ที่เลือก
        if (
          currentTimestamp.getFullYear() === filterDateObj.getFullYear() &&
          currentTimestamp.getMonth() === filterDateObj.getMonth() &&
          currentTimestamp.getDate() === filterDateObj.getDate()
        ) {
          // กรองข้อมูลตามช่วงเวลา (Interval)
          if (
            lastTimestamp === null ||
            (currentTimestamp - lastTimestamp) / (1000 * 60) >= filterMinutes
          ) {
            timestamps.push(currentTimestamp.toLocaleTimeString()); // เวลา
            temperatures.push(temperature); // อุณหภูมิ
            lastTimestamp = currentTimestamp; // อัปเดตเวลาล่าสุด
          }
        }
      }

      return { timestamps, temperatures };
    }
