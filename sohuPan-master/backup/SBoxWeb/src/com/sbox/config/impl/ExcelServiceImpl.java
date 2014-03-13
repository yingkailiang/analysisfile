package com.sbox.config.impl;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

import jxl.Workbook;
import jxl.write.WritableSheet;
import jxl.write.WritableWorkbook;
import com.sbox.config.IExcelService;

import java.util.Date;
import java.util.List;


import com.sbox.model.SboxLog;
import com.sbox.tools.AssistantUtil;

import jxl.write.Label;

public class ExcelServiceImpl implements IExcelService {

	public InputStream getExcelInputStream(List<SboxLog> sboxLog) {
		// 将OutputStream转化为InputStream
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		putDataOnOutputStream(out, sboxLog);
		return new ByteArrayInputStream(out.toByteArray());
	}

	private void putDataOnOutputStream(OutputStream os,List<SboxLog> sboxLog) {
		Label label;
		WritableWorkbook workbook;
		try {
			workbook = Workbook.createWorkbook(os);
			WritableSheet sheet = workbook.createSheet("Sheet1", 0);

			label = new Label(0, 0, "时间");
			sheet.addCell(label);
			label = new Label(1, 0, "操作者");
			sheet.addCell(label);
			label = new Label(2, 0, "操作");
			sheet.addCell(label);
			label = new Label(3, 0, "文件名");
			sheet.addCell(label);
			label = new Label(4, 0, "文件路径");
			sheet.addCell(label);
			for(int i=1;i<=sboxLog.size();i++){
				SboxLog oneItem = sboxLog.get(i-1);
//				JSONObject date = new JSONObject(oneItem.getOperationTime().toString());
//				Date sboxdate = new Date();
//				sboxdate = AssistantUtil.setJsonObjData(sboxdate, date,
//						null);
				label = new Label(0, i, AssistantUtil.changeToString(oneItem.getOperationTime()));
				sheet.addCell(label);
				label = new Label(1, i, oneItem.getOperatorName());
				sheet.addCell(label);
				label = new Label(2, i, oneItem.getOperation());
				sheet.addCell(label);
				label = new Label(3, i, oneItem.getFileName());
				sheet.addCell(label);
				label = new Label(4, i, oneItem.getFilePath());
				sheet.addCell(label);
			}
			workbook.write();
			workbook.close();
			
			StringBuffer osbuff = new StringBuffer();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
