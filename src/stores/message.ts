import { create } from 'zustand'
import { MESSAGE_MARK, MESSAGE_READ, MESSAGE_SEND, MESSAGE_TYPE, USER_ID, initMessage } from '@/shared'
import UserStore from '@/db/user'
import type { PrivateChats } from '@/types/db/user-db'
import MsgService from '@/api/msg'
import { getCookie } from '@/utils/cookie'
import { updateDatabaseMessage } from '@/shared'
// import CommonStore from '@/db/common'
// import GroupService from '@/api/group'

const user_id = getCookie(USER_ID) || ''

interface Options {
	replay_id?: number
	is_group?: boolean
	receiver_id?: string
	dialog_id?: number
	is_forward?: boolean
	at_all_user?: number
	at_users?: string[]
}

interface MessageStore {
	messages: PrivateChats[]
	all_meesages: PrivateChats[]
	shareKey: Uint8Array | null
	tableName: string
	is_group: boolean
	receiver_id: string
	dialog_id: number
	userInfo: any
	members: any[]
	updateMessage: (msg: any) => Promise<void>
	deleteMessage: (msg_id: number) => Promise<void>
	sendMessage: (type: MESSAGE_TYPE, content: string, options?: Options) => Promise<void>
	editMessage: (msg: any, content: string) => Promise<void>
	markMessage: (msg: PrivateChats) => Promise<boolean>
	readMessage: (msgs: PrivateChats[]) => Promise<void>
	initMessage: (is_group: boolean, dialog_id: number, receiver_id: string) => Promise<void>
}

export const useMessageStore = create<MessageStore>((set, get) => ({
	messages: [],
	all_meesages: [],
	shareKey: null,
	tableName: UserStore.tables.private_chats,
	is_group: false,
	receiver_id: '',
	dialog_id: 0,
	userInfo: null,
	members: [],
	updateMessage: async (msg: PrivateChats) => {
		const { messages } = get()
		set({ messages: [...messages, msg] })
	},
	deleteMessage: async (msg_id: number) => {
		const { tableName, messages } = get()
		try {
			set({ messages: messages.filter((item) => item.msg_id !== msg_id) })
			await UserStore.delete(tableName, 'msg_id', msg_id)
		} catch (error) {
			console.log('删除消息失败', error)
		}
	},
	/**
	 * 发送消息并处理发送过程，包括更新本地消息状态和数据库。
	 *
	 * @param {MESSAGE_TYPE} type -消息的类型
	 * @param {string} content -消息的内容
	 * @param {number} [replay_id] -正在回复的消息的ID，可选
	 * @return {Promise<void>}
	 */
	sendMessage: async (type: MESSAGE_TYPE, content: string, options = {}) => {
		const { messages, receiver_id, dialog_id } = get()

		// 判断是否是群聊
		let { is_group, tableName } = get()
		if (options?.is_group) {
			is_group = options?.is_group
			tableName = is_group ? UserStore.tables.group_chats : UserStore.tables.private_chats
		}

		const { is_forward = false } = options

		const msg: PrivateChats = {
			msg_id: Date.now(),
			sender_id: user_id,
			receiver_id: options?.receiver_id || receiver_id,
			content,
			type,
			replay_id: options?.replay_id ?? 0,
			is_read: MESSAGE_READ.READ,
			read_at: Date.now(),
			created_at: Date.now(),
			dialog_id: options?.dialog_id || dialog_id,
			is_label: MESSAGE_MARK.NOT_MARK,
			is_burn_after_reading: 0,
			msg_send_state: MESSAGE_SEND.SENDING
		}
		set({ messages: [...messages, msg] })

		try {
			const params: any = {
				type,
				content,
				dialog_id: msg.dialog_id,
				replay_id: msg.replay_id,
				is_burn_after_reading: 0
			}

			if (is_group) {
				params['at_all_user'] = options?.at_all_user || 0
				params['at_users'] = options?.at_users || []
				params['group_id'] = Number(msg.receiver_id)
			} else {
				params['receiver_id'] = msg.receiver_id
			}

			const { code, data } = is_group
				? await MsgService.sendGroupMessageApi(params)
				: await MsgService.sendUserMessageApi(params)

			msg.msg_send_state = code === 200 ? MESSAGE_SEND.SEND_SUCCESS : MESSAGE_SEND.SEND_FAILED
			msg.msg_id = data?.msg_id || Date.now()
		} catch (error) {
			console.error('发送消息失败', error)
			msg.msg_send_state = MESSAGE_SEND.SEND_FAILED
		} finally {
			set((state) => ({ messages: [...state.messages.slice(0, -1), msg] }))
			!is_forward && (await updateDatabaseMessage(tableName, msg.msg_id, msg))
		}
	},
	editMessage: async (msg: PrivateChats, content: string) => {
		const { is_group, messages, tableName } = get()

		// 首次更新内容和发送状态
		msg.content = content
		msg.msg_send_state = MESSAGE_SEND.SENDING
		set({
			messages: messages.map((item) => (item.msg_id === msg.msg_id ? { ...item, ...msg } : item))
		})

		try {
			const params = {
				msg_type: msg?.type,
				content,
				msg_id: msg?.msg_id
			}
			const { code } = is_group
				? await MsgService.editGroupMessageApi(params)
				: await MsgService.editUserMessageApi(params)

			msg.msg_send_state = code === 200 ? MESSAGE_SEND.SEND_SUCCESS : MESSAGE_SEND.SEND_FAILED
		} catch (error) {
			msg.msg_send_state = MESSAGE_SEND.SEND_FAILED
		} finally {
			set((state) => ({
				messages: state.messages.map((item) => (item.msg_id === msg.msg_id ? { ...item, ...msg } : item))
			}))
			await updateDatabaseMessage(tableName, msg.msg_id, msg, true)
		}
	},
	markMessage: async (msg: PrivateChats) => {
		const { is_group, messages, tableName } = get()
		try {
			const params = {
				msg_id: msg?.msg_id,
				is_label: msg?.is_label === MESSAGE_MARK.MARK ? MESSAGE_MARK.NOT_MARK : MESSAGE_MARK.MARK
			}
			const { code } = is_group
				? await MsgService.labelGroupMessageApi(params)
				: await MsgService.labelUserMessageApi(params)

			if (code === 200) {
				msg.is_label = params.is_label
				set({ messages: messages.map((item) => (item.msg_id === msg.msg_id ? { ...item, ...msg } : item)) })
				await updateDatabaseMessage(tableName, msg.msg_id, msg, true)
			}
		} catch (error) {
			console.error('标记消息失败:', error)
			return false
		}
		return true
	},
	readMessage: async (msgs) => {
		// 未读消息
		const unReadMsgs = msgs.filter((item) => item?.is_read === MESSAGE_READ.NOT_READ)
		const msg_ids = unReadMsgs.map((item) => item.msg_id)

		if (!msg_ids.length) return

		const { is_group, dialog_id, tableName } = get()

		const params = { msg_ids, dialog_id }

		const { code } = is_group
			? await MsgService.readGroupMessageApi(params)
			: await MsgService.readUserMessageApi(params)

		// 更新本地数据库
		if (code === 200) {
			unReadMsgs.map((item) => {
				updateDatabaseMessage(tableName, item.msg_id, { ...item, is_read: MESSAGE_READ.READ }, true)
			})
		}
	},
	/**
	 * 初始化消息的函数。
	 *
	 * @param {boolean} is_group -指示对话框是否是一个组
	 * @param {number}dialog_id -对话框的ID
	 * @param {string}receiver_id -消息接收者的id
	 * @return {Promise<void>} 消息初始化时解析的 Promise
	 */
	initMessage: async (is_group: boolean, dialog_id: number, receiver_id: string) => {
		const { shareKey, readMessage } = get()
		const tableName = is_group ? UserStore.tables.group_chats : UserStore.tables.private_chats
		const messages = await initMessage({
			tableName,
			dialog_id,
			shareKey
		})
		const userInfo = await UserStore.findOneById(UserStore.tables.friends, 'user_id', receiver_id)

		// let userInfo: any
		// 获取群成员
		// const members: any[] = []
		// if (is_group) {
			// userInfo = await UserStore.findOneById(UserStore.tables.groups, 'group_id', Number(receiver_id))

		// 	const { data } = await GroupService.groupInfoApi({ group_id: Number(receiver_id) })
		// 	console.log('data', data)
		// 	userInfo = data
		// 	// const group = await CommonStore.findOneById(CommonStore.tables.groups, 'group_id', dialog_id)
		// } else {
		// 	userInfo = await UserStore.findOneById(UserStore.tables.friends, 'user_id', receiver_id)
		// 	const user = await CommonStore.findOneById(CommonStore.tables.users, 'user_id', user_id)
		// 	members.push(userInfo, user?.user_info)

		// 	// 获取远程的信息，如果有更改则更新本地
		// 	dillServerInfo(receiver_id, userInfo).then((res) => res && members.splice(0, 1, res))
		// }

		set({ messages, tableName, is_group, receiver_id, dialog_id, all_meesages: messages, userInfo })

		// 设置已读
		readMessage(messages)
	}
}))
