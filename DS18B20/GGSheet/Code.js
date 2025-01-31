function doGet(e) {
  const sheet = SpreadsheetApp.openById("1A-r9pZpYXEDMJSq6U9hrw2WMtN8cf-LBLW3_tHi5A7o").getSheetByName('Bana1');
  const timestamp = new Date();
  const temperature = e.parameter.temp;
  
  // เพิ่มข้อมูลลง Google Sheet
  sheet.appendRow([timestamp, temperature]);
  
  return ContentService.createTextOutput("Success");
}
