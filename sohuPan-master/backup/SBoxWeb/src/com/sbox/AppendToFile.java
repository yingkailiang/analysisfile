package com.sbox;

import java.io.File;
import java.io.FileOutputStream;
import java.io.FileWriter; 
import java.io.IOException; 
import java.io.InputStream;
import java.io.OutputStream;
import java.io.RandomAccessFile; 
import java.net.HttpURLConnection;
import java.util.Date;
import java.util.Enumeration;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
/** 
* 将内容追加到文件尾部 
*/ 
public class AppendToFile { 
	
	/** 
	* A方法追加文件：使用RandomAccessFile 
	* @param fileName 文件名 
	* @param content 追加的内容 
	*/ 
	public static void appendMethodA(String fileName, String content){ 
		try { 
			// 打开一个随机访问文件流，按读写方式 
			RandomAccessFile randomFile = new RandomAccessFile(fileName, "rw"); 
			// 文件长度，字节数 
			long fileLength = randomFile.length(); 
			//将写文件指针移到文件尾。 
			randomFile.seek(fileLength); 
			randomFile.writeBytes(content); 
			randomFile.close(); 
		} catch (IOException e){ 
			e.printStackTrace(); 
		} 
	} 
	/** 
	* B方法追加文件：使用FileWriter 
	* @param fileName 存储文件名
	* @param contentName 存储内容名称
	* @param content 存储内容
	*/ 
	public static void appendMethodB(String fileName, String contentName, String content){
		try { 
				//打开一个写文件器，构造函数中的第二个参数true表示以追加形式写文件 
				FileWriter writer = new FileWriter(fileName, true); 
				writer.write(contentName+" : "+content+"\n");
				writer.close(); 
			} catch (IOException e) { 
				e.printStackTrace(); 
			} 
	} 
	
	
	public static void appendInputStream(String fileName,InputStream is){
		File file=new File(fileName);
		OutputStream os=null;
		try {
			os=new FileOutputStream(file);
			byte buffer[]=new byte[4*1024];
			int len = 0;
			while((len = is.read(buffer))!=-1){
				os.write(buffer,0,len);
			}
			os.flush();
		} catch (Exception e){
			e.printStackTrace();
		} finally {
			try{
				os.close();
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}
	
	public static void appendRequest(String fileName, HttpServletRequest request){
		Enumeration headersEnum = request.getHeaderNames();//获取头部信息集
		appendMethodB(fileName,"\n request","");
		while(headersEnum.hasMoreElements()){
			String name = (String)headersEnum.nextElement();
			String value = request.getHeader(name);	
			appendMethodB(fileName,name,value);
		} 
	}
	
	public static void appendResponse(String fileName,HttpServletResponse response){
		/*Enumeration headersEnum = response.*/
	}
}