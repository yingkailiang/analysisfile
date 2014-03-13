package com.sbox.action;

import org.apache.log4j.Logger;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.Map;
import java.util.Random;

import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletResponse;

import org.apache.struts2.ServletActionContext;

import com.opensymphony.xwork2.ActionContext;
import com.opensymphony.xwork2.ActionSupport;
import com.sbox.action.base.CommonAction;
import com.sbox.tools.SessionName;

/**
 * 验证码生成，存放在Session中的名称为validateCode
 * @author Jack.wu.xu
 * @author wugang, 修改在linux下图片显示不完整。2010-01-05
 */
public class GetCode extends CommonAction {
	/**
	 * Logger for this class
	 */
	private static final Logger logger = Logger.getLogger(GetCode.class);
	
	/**
	 * serialVersionUID of long.
	 */
	private static final long serialVersionUID = -937853337742318360L;
	
	/**
	 * 随机数种子.
	 */
	private static final int RANDOM_SEED = 10;

	/**
	 * 图片高度(像素).
	 */
	private static final int HEIGHT = 20;

	/**
	 * 随机生成的数字个数.
	 */
	private static final int FONT_NUM = 4;

	/**
	 * 字体大小.
	 */
	private static final int FONT_SIZE = 18;

	/**
	 * 数字的宽度.
	 */
	private static final int FONT_WIDTH = 12;
	
	/**
	 * 图片预留的总的间隙.
	 */
	private static final int FONT_GAP = 8;

	/**
	 * 用来表示颜色的最大数字.
	 */
	private static final int MAX_COLOR = 255;

	/**
	 * 开始画图的X坐标.
	 */
	private static final int X_FROM = 6;

	/**
	 * 开始画图的Y坐标.
	 */
	private static final int Y_FROM = 16;

	/**
	 * 背景随机色的开始值.
	 */
	private static final int BACKGROUND_COLOR_FROM = 200;

	/**
	 * 背景随机色的结束值.
	 */
	private static final int BACKGROUND_COLOR_TO = 250;

	/**
	 * 干扰的线条数量.
	 */
	private static final int LINE_COUNT = 155;

	/**
	 * 干扰的线条颜色的开始值.
	 */
	private static final int LINE_COLOR_FROM = 140;

	/**
	 * 干扰的线条颜色的结束值.
	 */
	private static final int LINE_COLOR_TO = 200;

	/**
	 * 文字颜色的基础值.
	 */
	private static final int FONT_COLOR_BASE = 20;

	/**
	 * 文字颜色的随机种子.
	 */
	private static final int FONT_COLOR_RANDOM_SEED = 110;

	/**
	 * 图片宽度.
	 */
	private int width = 0;
	
	/**
	 * 数值越大，得到的颜色越亮
	 * @param fci 颜色起始范围
	 * @param bci 颜色终止范围
	 * @return 颜色
	 */
	private Color getRandColor(int fci, int bci) {
		Random random = new Random();
		int fc = fci;
		int bc = bci;
		if (fc > MAX_COLOR) {
			fc = MAX_COLOR;
		}
		if (bc > MAX_COLOR) {
			bc = MAX_COLOR;
		}
		int r = fc + random.nextInt(bc - fc);
		int g = fc + random.nextInt(bc - fc);
		int b = fc + random.nextInt(bc - fc);
		return new Color(r, g, b);
	}
	
	private void drawRandomLine(Graphics g, Random random) {
		for (int i = 0; i < LINE_COUNT; i++) {
			g.setColor(getRandColor(LINE_COLOR_FROM, LINE_COLOR_TO));
			int x = random.nextInt(width);
			int y = random.nextInt(HEIGHT);
			g.drawLine(x, y, x, y);
		}
	}

	/**
	 * {@inheritDoc}
	 * @see com.opensymphony.xwork2.ActionSupport#execute()
	 */
	public String execute() throws Exception {
		this.width = FONT_WIDTH * FONT_NUM + FONT_GAP;
		BufferedImage image = new BufferedImage(width, HEIGHT, BufferedImage.TYPE_INT_RGB);
		Graphics g = image.getGraphics();
		Random random = new Random();
		g.setColor(getRandColor(BACKGROUND_COLOR_FROM, BACKGROUND_COLOR_TO));
		g.fillRect(0, 0, width, HEIGHT);
		drawRandomLine(g, random);
		g.setFont(new Font("Times New Roman", Font.PLAIN, FONT_SIZE));
		String sRand = "";
		for (int i = 0; i < FONT_NUM; i++) {
			int rand = random.nextInt(RANDOM_SEED);
			sRand = sRand + rand;
			g.setColor(new Color(FONT_COLOR_BASE + random.nextInt(FONT_COLOR_RANDOM_SEED),
				FONT_COLOR_BASE + random.nextInt(FONT_COLOR_RANDOM_SEED), FONT_COLOR_BASE
						+ random.nextInt(FONT_COLOR_RANDOM_SEED)));
			g.drawString(String.valueOf(rand), FONT_WIDTH * i + X_FROM, Y_FROM);
		}
		g.dispose();
		
		ActionContext context = ActionContext.getContext();
		Map<String, Object> session = context.getSession();
		HttpServletResponse response = ServletActionContext.getResponse();
		
		try {
			session.put(SessionName.VALIDATECODE, sRand);
			ImageIO.write(image, "JPEG", response.getOutputStream());
		} catch (IOException e) {
			logger.fatal("write validate image error", e);
		} finally {
			response.getOutputStream().close();
		}
		
		return null;
	}
}