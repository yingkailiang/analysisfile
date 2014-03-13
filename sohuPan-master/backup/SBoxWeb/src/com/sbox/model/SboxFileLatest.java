package com.sbox.model;

import java.util.Date;
import java.util.UUID;

import com.sbox.model.inter.Resource;

/**
 * SboxFileLatest00 entity.
 * 
 * @author Jack.wu.xu
 */

public class SboxFileLatest extends Resource implements java.io.Serializable {

	// Fields
	private String id = UUID.randomUUID().toString();
	private String name;
	private Long userId;
	private String belongDir;
	private String note;
	private Long size =0l;
	private Byte lock;
	private Long locker;
	private Date createTime = new Date();
	private Date modifyTime = new Date();
	private String versionNumber;
	private String table;
	private Byte deleted = 0;
	private Date lockTime;  //上锁时间
	private Long operator;  //上锁时间
	public Long getOperator() {
		return operator;
	}
	public void setOperator(Long operator) {
		this.operator = operator;
	}

	private String thumbnailsKey;   //缩略图key
	

	// Constructors

	public Date getLockTime() {
		return lockTime;
	}
	public Byte getDeleted() {
		return deleted;
	}

	public void setDeleted(Byte deleted) {
		this.deleted = deleted;
	}
	public void setLockTime(Date lockTime) {
		this.lockTime = lockTime;
	}

	public String getThumbnailsKey() {
		return thumbnailsKey;
	}

	public void setThumbnailsKey(String thumbnailsKey) {
		this.thumbnailsKey = thumbnailsKey;
	}

	public String getTable() {
		return table;
	}

	public void setTable(String table) {
		this.table = table;
	}

	/** default constructor */
	public SboxFileLatest() {
	}

	/** minimal constructor */
	public SboxFileLatest(String id, String name, Long userId,
			String belongDir, String note, Byte lock, Long locker,
			Date createTime, Date modifyTime, String versionNumber) {
		this.id = id;
		this.name = name;
		this.userId = userId;
		this.belongDir = belongDir;
		this.note = note;
		this.lock = lock;
		this.locker = locker;
		this.createTime = createTime;
		this.modifyTime = modifyTime;
		this.versionNumber = versionNumber;
	}

	/** full constructor */
	public SboxFileLatest(String id, String name, Long userId,
			String belongDir, String note, Long size, Byte lock, Long locker,
			Date createTime, Date modifyTime, String versionNumber) {
		this.id = id;
		this.name = name;
		this.userId = userId;
		this.belongDir = belongDir;
		this.note = note;
		this.size = size;
		this.lock = lock;
		this.locker = locker;
		this.createTime = createTime;
		this.modifyTime = modifyTime;
		this.versionNumber = versionNumber;
	}

	// Property accessors

	public String getId() {
		return this.id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Long getUserId() {
		return this.userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public String getBelongDir() {
		return this.belongDir;
	}

	public void setBelongDir(String belongDir) {
		this.belongDir = belongDir;
	}

	public String getNote() {
		return this.note;
	}

	public void setNote(String note) {
		this.note = note;
	}

	public Long getSize() {
		return this.size;
	}

	public void setSize(Long size) {
		this.size = size;
	}

	public Byte getLock() {
		return this.lock;
	}

	public void setLock(Byte lock) {
		this.lock = lock;
	}

	public Long getLocker() {
		return this.locker;
	}

	public void setLocker(Long locker) {
		this.locker = locker;
	}

	public Date getCreateTime() {
		return this.createTime;
	}

	public void setCreateTime(Date createTime) {
		this.createTime = createTime;
	}

	public Date getModifyTime() {
		return this.modifyTime;
	}

	public void setModifyTime(Date modifyTime) {
		this.modifyTime = modifyTime;
	}

	public String getVersionNumber() {
		return this.versionNumber;
	}

	public void setVersionNumber(String versionNumber) {
		this.versionNumber = versionNumber;
	}

}