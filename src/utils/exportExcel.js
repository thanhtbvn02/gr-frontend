import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportToExcel(data, fileName, sheetName = "Sheet1") {
  if (!data || data.length === 0) {
    alert("Không có dữ liệu để xuất!");
    return;
  }
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, fileName.endsWith(".xlsx") ? fileName : fileName + ".xlsx");
}
