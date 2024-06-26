import PGP from './PGPUtils'
import { toArrayBuffer, cretaeSession } from './signal/signal-protocol'
import { SignalProtocolAddress, SessionCipher,  } from '@privacyresearch/libsignal-protocol-typescript'
import { Curve } from '@privacyresearch/curve25519-typescript'
import { SignalProtocolStore } from './signal/storage-type'
import { dbService } from '@/db'

import { generateKey } from 'openpgp'

// const KEY = 'COSS'

/**
 * 加密
 * @param {string} content
 * @return {string}
 */
export async function encrypt(content,key) {
	// 生成随机的32字节密钥
	const symmetricKey = Curve.generateKeyPair()

	// 将密钥序列化为字符串（存储或传输）
	const serializedKey = Curve.serialize(symmetricKey)

	// 从字符串反序列化密钥
	const deserializedKey = Curve.deserialize(serializedKey)
}

/**
 * 解密
 * @param {string} content
 * @return {string}
 */
export async function decrypt(content, key) {
	return await PGP.decryptAES256(content, key)
}

// /**
//  * 重连会话
//  *
//  * @param {type} user_id -用户 ID
//  * @return {type} 会话
//  */
// export async function reconnectSession(friend_id, user_id, self = false) {
// 	try {
// 		// 获取对方信息
// 		const reslut = await dbService.findOneById(dbService.TABLES.SESSION, friend_id)
// 		// 查找自己信息
// 		const user = await dbService.findOneById(dbService.TABLES.USERS, user_id)

// 		console.log('查找对方会话信息', reslut, user)

// 		// 如果没有找到对方会话
// 		if (!reslut) {
// 			// TODO: 通知对方发送公钥
// 			console.error('TODO:没有找到对方的会话信息，通知对方发送公钥')
// 			return
// 		}

// 		// if (self) {
// 		// 	// 如果是自己
// 		// 	const store = new SignalProtocolStore(toArrayBuffer(reslut.data?.store))
// 		// 	const address = new SignalProtocolAddress(
// 		// 		reslut.data?.directory.deviceName,
// 		// 		reslut.data?.directory.deviceId
// 		// 	)

// 		// 	const cipher = new SessionCipher(store, address)

// 		// 	await cretaeSession(store, address)

// 		// 	// console.log("ression",ression);
// 		// 	return cipher
// 		// }

// 		// 自己仓库
// 		const store = new SignalProtocolStore(toArrayBuffer(reslut.data?.store))
// 		// 初始化对方地址
// 		const addr = new SignalProtocolAddress(reslut.data?.directory.deviceName, reslut.data?.directory.deviceId)
// 		// 初始化会话
// 		const cipher = new SessionCipher(store, addr)

// 		console.log('重连会话成功', cipher)

// 		// 返回会话
// 		return cipher
// 	} catch (error) {
// 		console.log('重连会话失败', error)
// 		return null
// 	}
// }