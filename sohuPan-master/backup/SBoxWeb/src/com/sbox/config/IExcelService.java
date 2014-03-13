package com.sbox.config;
import java.io.InputStream;
import java.util.List;
import com.sbox.model.SboxLog;
public interface IExcelService {
	InputStream getExcelInputStream(List<SboxLog> sboxLog);
}
