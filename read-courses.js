const XLSX = require('xlsx');
const fs = require('fs');

console.log('Reading RevoQuest Course Files...\n');

// Read the first Excel file
try {
  const workbook1 = XLSX.readFile('List of Courses/REVO ACCREDITATION LIST.xlsx');
  const sheetName1 = workbook1.SheetNames[0];
  const worksheet1 = workbook1.Sheets[sheetName1];
  const data1 = XLSX.utils.sheet_to_json(worksheet1, { header: 1 });
  
  console.log('=== REVO ACCREDITATION LIST ===');
  console.log('Sheet:', sheetName1);
  console.log('Total rows:', data1.length);
  console.log('\nHeaders:', data1[0]);
  console.log('\nFirst 15 rows:');
  data1.slice(0, 15).forEach((row, index) => {
    console.log(`Row ${index}:`, row);
  });
  console.log('\n' + '='*60 + '\n');
} catch (error) {
  console.log('Error reading REVO ACCREDITATION LIST.xlsx:', error.message);
}

// Read the second Excel file
try {
  const workbook2 = XLSX.readFile('List of Courses/List of RevoQuest Assessment centre accreditaions .xlsx');
  const sheetName2 = workbook2.SheetNames[0];
  const worksheet2 = workbook2.Sheets[sheetName2];
  const data2 = XLSX.utils.sheet_to_json(worksheet2, { header: 1 });
  
  console.log('=== REVOQUEST ASSESSMENT CENTRE ACCREDITATIONS ===');
  console.log('Sheet:', sheetName2);
  console.log('Total rows:', data2.length);
  console.log('\nHeaders:', data2[0]);
  console.log('\nFirst 15 rows:');
  data2.slice(0, 15).forEach((row, index) => {
    console.log(`Row ${index}:`, row);
  });
} catch (error) {
  console.log('Error reading List of RevoQuest Assessment centre accreditaions .xlsx:', error.message);
}
