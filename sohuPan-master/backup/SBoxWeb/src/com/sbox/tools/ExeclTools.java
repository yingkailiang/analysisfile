package com.sbox.tools;

import info.monitorenter.cpdetector.io.ASCIIDetector;
import info.monitorenter.cpdetector.io.CodepageDetectorProxy;
import info.monitorenter.cpdetector.io.JChardetFacade;
import info.monitorenter.cpdetector.io.ParsingDetector;
import info.monitorenter.cpdetector.io.UnicodeDetector;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.LineNumberReader;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.Vector;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFDateUtil;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.sbox.action.Login;

public class ExeclTools {
	private static String[] javaname = null;
	private static final Logger logger = Logger.getLogger(Login.class);
	static {
		javaname = new String[11];
		javaname[0] = "GB2312";
		javaname[1] = "GBK";
		javaname[2] = "BIG5";
		javaname[3] = "UTF8";
		javaname[4] = "Unicode";
		javaname[5] = "EUC_KR";
		javaname[6] = "SJIS";
		javaname[7] = "EUC_JP";
		javaname[8] = "ASCII";
		javaname[9] = "ISO8859_1";
		javaname[10] = "ISO8859_1";
	}

	// private XSSFWorkbook workbook;

	public ExeclTools() {
	}

	public static XSSFWorkbook importExcel(String strfile) {
		try {
			// 获取工作薄workbook
			XSSFWorkbook workbook = new XSSFWorkbook(new FileInputStream(
					strfile));
			return workbook;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	/*
	 * 读取文件
	 */
	public static XSSFWorkbook importExcel(File file) {
		try {
			XSSFWorkbook workbook = new XSSFWorkbook(new FileInputStream(file));
			return workbook;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	/*
	 * 读取文件流
	 */
	public static XSSFWorkbook importExcel(InputStream filestream) {
		try {
			XSSFWorkbook workbook = new XSSFWorkbook(filestream);
			return workbook;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	/*
	 * 获取想要第几张工作表的数据importExcel导入
	 */
	public static List readSet(int sheetNumber, XSSFWorkbook workbook) {
		List<List> result = new ArrayList<List>();
		// 获得指定的sheet
		XSSFSheet sheet = workbook.getSheetAt(sheetNumber);
		// 获得sheet总行数
		int rowCount = sheet.getLastRowNum();
		if (rowCount < 1) {
			return result;
		}
		// HashMap<Integer, Object> map=new HashMap<Integer, Object>();
		// 遍历行row
		for (int rowIndex = 0; rowIndex <= rowCount; rowIndex++) {
			// 获得行对象
			XSSFRow row = sheet.getRow(rowIndex);
			if (null != row) {
				// List<Object> rowData = new ArrayList<Object>();
				Vector<Object> vector = new Vector<Object>();
				// 获得本行中单元格的个数
				int cellCount = row.getLastCellNum();
				// 遍历列cell
				for (short cellIndex = 0; cellIndex < cellCount; cellIndex++) {
					XSSFCell cell = row.getCell(cellIndex);
					// 获得指定单元格中的数据
					Object cellStr = ExeclTools.getCellString(cell);

					// map.put(arg0, arg1)
					vector.add(cellStr);
				}
				result.add(vector);
			}
		}

		return result;
	}

	/*
	 * 从第几张工作表第几行的数据importExcel导入
	 */
	public List readRow(int sheetNumber, int rowIndex, XSSFWorkbook workbook) {
		List result = new ArrayList();
		// 获得指定的sheet
		XSSFSheet sheet = workbook.getSheetAt(sheetNumber);
		// 获得sheet总行数
		int rowCount = sheet.getLastRowNum();
		if (rowCount < 1) {
			return result;
		}
		// 遍历行row
		// for (int rowIndex = rows+2; rowIndex <= rowCount; rowIndex++) {
		// 获得行对象
		XSSFRow row = sheet.getRow(rowIndex);
		if (null != row) {
			// Vector<Object> vector=new Vector<Object>();
			// 获得本行中单元格的个数
			int cellCount = row.getLastCellNum();
			// 遍历列cell
			for (short cellIndex = 0; cellIndex < cellCount; cellIndex++) {
				XSSFCell cell = row.getCell(cellIndex);
				// 获得指定单元格中的数据
				Object cellStr = this.getCellString(cell);
				// vector.add(cellStr);
				result.add(cellStr);
			}
		}
		// }

		return result;
	}

	/**
	 * 获取指定工作表的总行数
	 * 
	 * @param sheetNumber
	 * @param workbook
	 * @return
	 */
	public static int getRowIndex(int sheetNumber, XSSFWorkbook workbook) {
		XSSFSheet sheet = workbook.getSheetAt(sheetNumber);
		// 获得sheet总行数
		int rowCount = sheet.getLastRowNum();
		if (rowCount < 1) {
			return 0;
		}
		return rowCount;
	}

	/**
	 * 从第几张工作表第几行读到第几行
	 * 
	 * @param sheetNumber
	 * @param rows
	 * @param getrows
	 * @param workbook
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static List readCell(int sheetNumber, int rows, int getrows,
			XSSFWorkbook workbook) {
		List<List> result = new ArrayList<List>();

		// 获得指定的sheet
		XSSFSheet sheet = workbook.getSheetAt(sheetNumber);
		// 获得sheet总行数
		int rowCount = getrows;
		if (rowCount < 1) {
			return result;
			//return null;
		}
		
		// HashMap<Integer, Object> map=new HashMap<Integer, Object>();
		// 遍历行row
		for (int rowIndex = rows; rowIndex <= rowCount; rowIndex++) {
			// 获得行对象
			XSSFRow row = sheet.getRow(rowIndex);
			if (null != row) {
				// List<Object> rowData = new ArrayList<Object>();
				Vector<Object> vector = new Vector<Object>();
				// 获得本行中单元格的个数
				int cellCount = row.getLastCellNum();
				// 遍历列cell
				for (short cellIndex = 0; cellIndex < cellCount; cellIndex++) {
					XSSFCell cell = row.getCell(cellIndex);
					// 获得指定单元格中的数据
					Object cellStr = ExeclTools.getCellString(cell);
					// map.put(arg0, arg1)
					vector.add(cellStr);
				}
				//addByHd
				int cellNum = cellCount;
				while(cellNum < 4){//这里写死为模板的4列，需注意后期扩展问题
					vector.add(null);
					cellNum++;
				}
				result.add(vector);
			} else {//addByHd 数据中有非激活的空行
				Vector<Object> vector = new Vector<Object>();
				int cellNum = 0;
				while(cellNum < 4){
					vector.add(null);
					cellNum++;
				}
				result.add(vector);
			}
		}
		
		return result;
	}

	/**
	 * 检查输入表格的表头是否符合要求
	 * @param sheetNumber 表格编号
	 * @param getrows 表格总行数
	 * @param workbook
	 * @return -3:空表格；
	 *         -2:只有表头行被填充;
	 *         -1:表头格式不正确; 
	 *          0:表格基本形式正确
	 */
	public static  int checkSheetHeader(int sheetNumber,int getrows,XSSFWorkbook workbook){
		int result = 0;
		// 获得指定的sheet
		XSSFSheet sheet = workbook.getSheetAt(sheetNumber);
		// 获得sheet总行数
		int rowCount = getrows;

		if (rowCount < 1) {
			result = -3;//空表
		}else if(rowCount == 1){
			result = -2;//只有表头行被填充
		}else{	
			// 获取第一行表头
			XSSFRow row = sheet.getRow(0);
			if (null != row) {
				// 获得第一行中单元格的个数,如果列数不匹配，则格式错误，返回false
				int cellCount = row.getLastCellNum();
				if(cellCount != 4) result = -1;
				
				// 遍历列cell
				for (short cellIndex = 0; cellIndex < cellCount && result==0; cellIndex++) {
					XSSFCell cell = row.getCell(cellIndex);
					// 获得指定单元格中的数据
					Object cellStr = ExeclTools.getCellString(cell);
					// map.put(arg0, arg1)
					String test = cellStr.toString();
					//判断表头的四列是否符合要求
					switch(cellIndex){
					case 0:{
						if(!(test.equals("用户名")))
							result = -1;
						break;
						}
					case 1:{
						if(!(test.equals("登录邮箱")))
							result = -1;
						break;
						}
					case 2:{
						if(!(test.equals("初始密码")))
							result = -1;
						break;
						}
					case 3:{
						if(!(test.equals("用户空间大小（GB）")))
							result = -1;
						break;
						}
					}
					if(0 != result) break;
				}
			}else result = -1;//第一行为空，表头不正确
		}
		
		return result;
	}
	
	/**
	 * 读取第几张工作表的第几列
	 * 
	 * @param sheetNumber
	 * @param cells
	 * @param workbook
	 * @return
	 */
	public static List readColum(int sheetNumber, int cells,
			XSSFWorkbook workbook) {
		List<List> result = new ArrayList<List>();

		// 获得指定的sheet
		XSSFSheet sheet = workbook.getSheetAt(sheetNumber);
		// 获得sheet总行数
		int rowCount = sheet.getLastRowNum();
		if (rowCount < 1) {
			return result;
		}
		// HashMap<Integer, Object> map=new HashMap<Integer, Object>();
		// 遍历行row
		for (int rowIndex = 2; rowIndex <= rowCount; rowIndex++) {
			// 获得行对象
			XSSFRow row = sheet.getRow(rowIndex);
			if (null != row) {
				// List<Object> rowData = new ArrayList<Object>();
				Vector<Object> vector = new Vector<Object>();
				// 获得本行中单元格的个数
				XSSFCell cell = row.getCell(cells);
				Object cellStr = ExeclTools.getCellString(cell);
				vector.add(cellStr);
				result.add(vector);
			}
		}
		return result;
	}

	/**
	 * 获取一个cell的数据类型
	 * 
	 * @param cell
	 * @return
	 */
	private static Object getCellString(XSSFCell cell) {
		Object result = null;
		if (cell != null) {
			// 单元格类型:Numeric:0,String:1,Formula:2,Blank:3,Boolean:4,Error:5
			int cellType = cell.getCellType();
			switch (cellType) {
			case XSSFCell.CELL_TYPE_STRING:
				result = cell.getRichStringCellValue().getString();
				break;
			case XSSFCell.CELL_TYPE_NUMERIC:
				if (HSSFDateUtil.isCellDateFormatted(cell)) {
					result = cell.getDateCellValue();
				} else
					result = cell.getNumericCellValue();
				break;
			case XSSFCell.CELL_TYPE_FORMULA:
				result = cell.getNumericCellValue();
				break;
			case XSSFCell.CELL_TYPE_BOOLEAN:
				result = cell.getBooleanCellValue();
				break;
			case XSSFCell.CELL_TYPE_BLANK:
				result = null;
				break;
			case XSSFCell.CELL_TYPE_ERROR:
				result = null;
				break;
			default:
				System.out.println("枚举了所有类型");
				break;
			}
		}
		return result;
	}

	private static Object getCellString(HSSFCell cell) {
		Object result = null;
		if (cell != null) {
			// 单元格类型:Numeric:0,String:1,Formula:2,Blank:3,Boolean:4,Error:5
			int cellType = cell.getCellType();
			switch (cellType) {
			case XSSFCell.CELL_TYPE_STRING:
				result = cell.getRichStringCellValue().getString();
				break;
			case XSSFCell.CELL_TYPE_NUMERIC:
				if (HSSFDateUtil.isCellDateFormatted(cell)) {
					result = cell.getDateCellValue();
				} else
					result = cell.getNumericCellValue();
				break;
			case XSSFCell.CELL_TYPE_FORMULA:
				result = cell.getNumericCellValue();
				break;
			case XSSFCell.CELL_TYPE_BOOLEAN:
				result = cell.getBooleanCellValue();
				break;
			case XSSFCell.CELL_TYPE_BLANK:
				result = null;
				break;
			case XSSFCell.CELL_TYPE_ERROR:
				result = null;
				break;
			default:
				System.out.println("枚举了所有类型");
				break;
			}
		}
		return result;
	}

	@SuppressWarnings("unchecked")
	public static void main(String[] args) throws Exception {
		File filedata = new File("E:\\用户导入模板.csv");
		// File file = new File("E:\\ss.xls");
		// ExcelRead excel = new ExcelRead();
		// excel.importExcel("E:\\Create.xlsx");
		// XSSFWorkbook importExcel = ExeclTools.importExcel("E:\\Create.xlsx");
		// List<List> readCell = ExeclTools.readCell(0, 0,
		// ExeclTools.getRowIndex(
		// 0, importExcel), importExcel);

		List<List> importCSV = ExeclTools.importCSV(filedata);
		for (List cell : importCSV) {

		}
		// String ids = "1,2,3,4,5";
		// String[] id = new String[ids.length()];
		// String sql = "select * from meeting.mail_info where MAIL_ID in (";
		// id = ids.split(",");
		// for (int i = 0; i < id.length; i++) {
		// if (i != id.length - 1) {
		// sql = sql + "'" + id[i] + "',";
		// } else {
		// sql += "'" + id[i] + "'";
		// }
		// }
		// sql = sql + ")";
		// System.out.println(sql);
	}

	public static HSSFWorkbook importExcelHSSFWorkbook(File file) {
		try {
			HSSFWorkbook workbook = new HSSFWorkbook(new FileInputStream(file));
			return workbook;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	public static List<List> getExeclData(File filedata) {
		Object execl = ExeclTools.importExcel(filedata);
		if (execl == null) {
			execl = ExeclTools.importExcelHSSFWorkbook(filedata);
		}
		int rowIndex = 0;
		List<List> readCells = null;
		if (execl instanceof XSSFWorkbook) {
			XSSFWorkbook ex = (XSSFWorkbook) execl;
			rowIndex = ExeclTools.getRowIndex(0, ex);
			readCells = ExeclTools.readCell(0, 1, rowIndex, ex);
		} else if (execl instanceof HSSFWorkbook) {
			HSSFWorkbook ex = (HSSFWorkbook) execl;
			rowIndex = ExeclTools.getRowIndexHSSFWorkbook(0, ex);
			readCells = ExeclTools.readCellHSSFWorkbook(0, 1, rowIndex, ex);
		}
		return readCells;
	}

	public static int getRowIndexHSSFWorkbook(int i, HSSFWorkbook workbook) {
		HSSFSheet sheet = workbook.getSheetAt(i);
		// 获得sheet总行数
		int rowCount = sheet.getLastRowNum();
		if (rowCount < 1) {
			return 0;
		}
		return rowCount;
	}

	public static List<List> readCellHSSFWorkbook(int sheetNumber, int rows,
			int getrows, HSSFWorkbook workbook) {
		List<List> result = new ArrayList<List>();

		// 获得指定的sheet
		HSSFSheet sheet = workbook.getSheetAt(sheetNumber);
		// 获得sheet总行数
		int rowCount = getrows;
		if (rowCount < 1) {
			return result;
		}
		// HashMap<Integer, Object> map=new HashMap<Integer, Object>();
		// 遍历行row
		for (int rowIndex = rows; rowIndex <= rowCount; rowIndex++) {
			// 获得行对象
			HSSFRow row = sheet.getRow(rowIndex);
			if (null != row) {
				// List<Object> rowData = new ArrayList<Object>();
				Vector<Object> vector = new Vector<Object>();
				// 获得本行中单元格的个数
				int cellCount = row.getLastCellNum();
				// 遍历列cell
				for (short cellIndex = 0; cellIndex < cellCount; cellIndex++) {
					HSSFCell cell = row.getCell(cellIndex);
					// 获得指定单元格中的数据
					Object cellStr = ExeclTools.getCellString(cell);
					// map.put(arg0, arg1)
					vector.add(cellStr);
				}
				result.add(vector);
			}
		}

		return result;
	}

	/**
	 * 读取CSV格式文件，空白行过滤,IEL stands for Ignore Empty Line
	 * @param file
	 * @return
	 */
	public static List<String> importCSVIEL(File file) {
		if (file == null) {
			return null;
		}
		
		String charset = getCharset1(file);
		//无法找到匹配字符时，默认以GBK解码
		if (charset == null) {
			charset = "GBK";
		}
		System.out.println(charset);
		
		BufferedReader fileReader = null;
		try {
			fileReader = new BufferedReader(new InputStreamReader(
					new FileInputStream(file), charset));
			String line = null;
			List<String> lines = new ArrayList<String>();
			while( (line = fileReader.readLine()) != null ) {
				if ( StringUtils.isBlank(line) ) {
					continue;
				}
				lines.add(line);
			}
			return lines;
		} catch (UnsupportedEncodingException e){
			logger.error(e);
			return null;
		} catch (FileNotFoundException e) {
			logger.error(e);
			return null;
		} catch (IOException e) {
			logger.error(e);
			return null;
		}
	}
	
	/**
	 * 检查表头格式是否和标准一致
	 * @param line
	 * @return
	 */
	public static boolean checkHeader(String line) {
		if ( StringUtils.isBlank(line) ) {
			return false;
		} 
		
		String[] properties = line.split(",");
		String[] officalHeader = {"账号邮箱","姓名","所属部门","办公电话"};
		System.out.println(properties.length);
		for (int i = 0; i < officalHeader.length;++i) {
			if (properties[i].equals(officalHeader[i]) == false) {
				return false;
			}
		}
		return true;
	}
	
	public static List<String> csvLineSplit(String line) {
		List<String> splitParams = new ArrayList<String>(); 
		if ( StringUtils.isEmpty(line) ) {
			return null;
		}
		String[] params = line.split(",");
		for (String param : params) {
			splitParams.add(param);
		}
		return splitParams;
	}
	
	@SuppressWarnings( { "unused", "unchecked" })
	public static List<List> importCSV(File file) {
		String charset = getCharset1(file);
		System.out.println("parse coding is :" + charset);
		// logger.debug("parse coding is :" + charset);
		List<List> result = new ArrayList<List>();
		try {
			CharsetDetector tool = new CharsetDetector();
			String[] values = tool.detectChineseCharset(new FileInputStream(
					file));
			// logger.debug("parse coding is :" + charset);
			BufferedReader br = new BufferedReader(new InputStreamReader(
					new FileInputStream(file), charset));
			String s = null;
			br.readLine();
//			System.out.println("parse codinCCC is :" + values[0]);
//			logger.debug("parse coding is :" + values[0]);
			while ((s = br.readLine()) != null) {
				String x = new String(s.getBytes());
//				logger.debug("parse value is :" + x);
//				System.out.println("parse coding is :" + values[0]);
//				System.out.println("parse value is :" + x);
				String[] split = x.split(",|\\s");
				List<String> cells = new ArrayList<String>();
				cells.add(split[0]);
				cells.add(split[1]);
				cells.add(split[2]);
				cells.add(split[3]);
				result.add(cells);
			}
		} catch (IOException e) {
			e.printStackTrace();
			return null;
		}

		// try {
		// LineNumberReader reader = new LineNumberReader(new FileReader(
		// filedata));
		// String s = null;
		// reader.readLine();
		// while ((s = reader.readLine()) != null) {
		// String x = new String(new String(s.getBytes(), charset)
		// .getBytes("UTF-8"), "UTF-8");
		// logger.debug("parse value is :" + x);
		// String[] split = x.split(",|\\s");
		// List<String> cells = new ArrayList<String>();
		// cells.add(split[0]);
		// cells.add(split[1]);
		// cells.add(split[2]);
		// cells.add(split[3]);
		// result.add(cells);
		// }
		// } catch (IOException e) {
		// e.printStackTrace();
		// return null;
		// }
		return result;
	}

	private static String getCharset1(File file) {
		CodepageDetectorProxy detector = CodepageDetectorProxy.getInstance();
		detector.add(new ParsingDetector(false));
		detector.add(JChardetFacade.getInstance());// 用到antlr.jar、chardet.jar
		// ASCIIDetector用于ASCII编码测定
		detector.add(ASCIIDetector.getInstance());
		// UnicodeDetector用于Unicode家族编码的测定
		detector.add(UnicodeDetector.getInstance());
		java.nio.charset.Charset charset = null;
		try {
			charset = detector.detectCodepage(file.toURI().toURL());
		} catch (Exception ex) {
			ex.printStackTrace();
		}
		if (charset != null)
			return charset.name();
		else
			return null;
	}

	public static String getCharset(File file) {
		try {
			LineNumberReader reader = new LineNumberReader(new FileReader(file));
			String readLine = reader.readLine();
			for (String charset : javaname) {
				try {
					new String(readLine.getBytes(), charset);
					return charset;
				} catch (Exception e) {
					return "Unknow";
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			return "Unknow";
		}
		return "Unknow";
	}

	public static String getCharset2(File file) {
		String charset = "GBK";
		byte[] first3Bytes = new byte[3];
		try {
			boolean checked = false;
			BufferedInputStream bis = new BufferedInputStream(
					new FileInputStream(file));
			bis.mark(0);
			int read = bis.read(first3Bytes, 0, 3);
			if (read == -1)
				return charset;
			if (first3Bytes[0] == (byte) 0xFF && first3Bytes[1] == (byte) 0xFE) {
				charset = "UTF-16LE";
				checked = true;
			} else if (first3Bytes[0] == (byte) 0xFE
					&& first3Bytes[1] == (byte) 0xFF) {
				charset = "UTF-16BE";
				checked = true;
			} else if (first3Bytes[0] == (byte) 0xEF
					&& first3Bytes[1] == (byte) 0xBB
					&& first3Bytes[2] == (byte) 0xBF) {
				charset = "UTF-8";
				checked = true;
			}
			bis.reset();
			if (!checked) {
				// int len = 0;
				int loc = 0;

				while ((read = bis.read()) != -1) {
					loc++;
					if (read >= 0xF0)
						break;
					if (0x80 <= read && read <= 0xBF) // 单独出现BF以下的，也算是GBK
						break;
					if (0xC0 <= read && read <= 0xDF) {
						read = bis.read();
						if (0x80 <= read && read <= 0xBF) // 双字节 (0xC0 - 0xDF)
							// (0x80
							// - 0xBF),也可能在GB编码内
							continue;
						else
							break;
					} else if (0xE0 <= read && read <= 0xEF) {// 也有可能出错，但是几率较小
						read = bis.read();
						if (0x80 <= read && read <= 0xBF) {
							read = bis.read();
							if (0x80 <= read && read <= 0xBF) {
								charset = "UTF-8";
								break;
							} else
								break;
						} else
							break;
					}
				}
				// System.out.println( loc + " " + Integer.toHexString( read )
				// );
			}

			bis.close();
		} catch (Exception e) {
			e.printStackTrace();
		}

		return charset;
	}

	// public static List<List> importCSV(File filedata) {
	// CSVReader csvReader = null;
	// List<List> result = new ArrayList<List>();
	// try {
	// csvReader = new CSVReader(new FileReader(filedata), ',');
	// if (csvReader != null) {
	// // first row is title, so past
	// csvReader.readNext();
	// String[] csvRow = null;// row
	// while ((csvRow = csvReader.readNext()) != null) {
	// List<String> cells = new ArrayList<String>();
	// for (int i = 0; i < csvRow.length; i++) {
	// String temp = csvRow[i];
	// System.out.println(temp);
	// cells.add(temp);
	// }
	// result.add(cells);
	// }
	// }
	// } catch (Exception e) {
	// e.printStackTrace();
	// return null;
	// }
	// return result;
	// }
}
