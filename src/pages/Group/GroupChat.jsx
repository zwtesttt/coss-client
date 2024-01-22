import React, { useState, useEffect, useRef } from 'react'
import {
	Link,
	Message,
	Messagebar,
	MessagebarSheet,
	Messages,
	NavRight,
	NavTitle,
	Navbar,
	Page
} from 'framework7-react'
import Emojis from '@/components/Emojis/Emojis.jsx'
import PropType from 'prop-types'
import { $t } from '@/i18n'
import { useUserStore } from '@/stores/user'
import { dbService } from '@/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { pick, uniqueId } from 'lodash-es'
import { groupInfoApi, groupMemberApi } from '@/api/group'
import { sendToGroup } from '@/api/msg'

GroupChat.propTypes = {
	f7route: PropType.object.isRequired
}
export default function GroupChat({ f7route }) {
	const { user } = useUserStore()
	const ReceiverId = f7route.params.id // 群号 /（TODO：用户ID）
	const DialogId = f7route.query.dialog_id // 会话 ID
	const [chatInfo, setGroupInfo] = useState({}) // 群聊信息
	const [member, setMember] = useState(new Map()) // 成员信息
	// 消息列表
	const messages = useLiveQuery(
		async () => (await dbService.findOneById(dbService.TABLES.MSGS, ReceiverId))?.data || []
	)
	useEffect(() => {
		// 获取群聊信息
		groupInfoApi({ gid: ReceiverId }).then(({ code, data }) => {
			code === 200 && setGroupInfo(data)
		})
		// 获取成员信息
		groupMemberApi({ group_id: ReceiverId }).then(({ code, data }) => {
			if (code === 200) {
				const obj = new Map()
				for (const dataItem of data) {
					if (dataItem.user_id) {
						obj.set(dataItem.user_id, dataItem)
					}
				}
				setMember(obj)
			}
		})
	}, [])
	useEffect(() => {
		console.log('member', member)
		console.log('messages', messages)
	}, [member, messages])

	// 发送消息
	const messagebarRef = useRef(null)
	const [msgText, setMsgText] = useState('')
	const messageTime = (message) => {
		return message?.time
			? Intl.DateTimeFormat('en', { hour: 'numeric', minute: 'numeric' }).format(new Date(message.time))
			: ''
	}
	const isMessageFirst = (message) => {
		const messageIndex = messages.indexOf(message)
		const previousMessage = messages[messageIndex - 1]
		return !previousMessage || previousMessage.type !== message.type
	}
	const isMessageLast = (message) => {
		const messageIndex = messages.indexOf(message)
		const nextMessage = messages[messageIndex + 1]
		return !nextMessage || nextMessage.type !== message.type
	}
	const sendStatusToText = (code) => {
		const status = {
			0: '未发送',
			1: '发送中',
			2: '发送成功',
			3: '发送失败'
		}
		return status[code] ? status[code] : '未知状态'
	}
	/**
	 * 发送消息
	 * @param {*} sandText 内容
	 * @param {*} type 内容类型 1:文本 2:语音 3:图片
	 * @returns
	 */
	const sendMessage = async (sandText = msgText, type = 1) => {
		if (sandText === '') return
		// 发送消息
		const time = Date.now()
		const unique_id = uniqueId(`${time}_`)
		const message = {
			unique_id,
			content: sandText, // 内容
			sender: user.user_id, // 发送人
			dialog_id: parseInt(DialogId), // 会话
			group_id: parseInt(ReceiverId), // 群组(私聊时为receiver_id)
			// receiver_id: parseInt(ReceiverId), // 接收人(群聊时为group_id)
			time, // 时间
			type, // 1:文本 2:语音 3:图片
			send_status: 0 // 0:未发送 1:发送中 2:发送成功 3:发送失败
		}
		const newAllMsg = {
			user_id: ReceiverId,
			data: [...messages, message]
		}
		// 存入本地数据库
		if (messages.length === 0) {
			await dbService.add(dbService.TABLES.MSGS, newAllMsg)
		} else {
			await dbService.update(dbService.TABLES.MSGS, ReceiverId, newAllMsg)
		}
		// 恢复输入框状态
		setMsgText('')
		setTimeout(() => {
			messagebarRef.current.f7Messagebar().focus()
		})
		// 发送
		try {
			// message['send_status'] = 1
			// dbService.update(dbService.TABLES.MSGS, ReceiverId, newAllMsg)
			const { code, data } = await sendToGroup(pick(message, ['content', 'dialog_id', 'group_id', 'type']))
			console.log(code, data)
			message['send_status'] = code === 200 ? 2 : 3
		} catch (error) {
			console.log(error)
			message['send_status'] = 3
		} finally {
			dbService.update(dbService.TABLES.MSGS, ReceiverId, newAllMsg)
		}
	}

	// 图片表情
	const [sheetVisible, setSheetVisible] = useState(false)
	const onEmojiSelect = ({ type, emoji }) => {
		// console.log(type, emoji)
		type === 'emoji' && setMsgText(`${msgText}${emoji}`)
		type === 'img' && sendMessage(emoji, 3)
	}

	return (
		<Page className="chat-group-page messages-page" noToolbar messagesContent>
			<Navbar className="messages-navbar" backLink>
				<NavTitle>
					<span className="">{$t(chatInfo.name)}</span>
				</NavTitle>
				<NavRight>
					<Link href={`/new_group/?id=${ReceiverId}`} iconF7="ellipsis" onClick={() => {}} />
				</NavRight>
			</Navbar>
			{/* 消息输入框 */}
			<Messagebar
				ref={messagebarRef}
				sheetVisible={sheetVisible}
				value={msgText}
				placeholder={$t('请输入消息')}
				onInput={(e) => setMsgText(e.target.value)}
			>
				<Link slot="inner-start" iconF7="plus" />
				<Link
					slot="after-area"
					className="messagebar-sticker-link"
					iconF7="smiley"
					onClick={() => {
						setSheetVisible(!sheetVisible)
					}}
				/>
				{msgText !== '' ? (
					<Link
						slot="inner-end"
						className="messagebar-send-link"
						iconF7="paperplane_fill"
						onClick={() => sendMessage()}
					/>
				) : (
					<>
						<Link slot="inner-end" href="/camera/" iconF7="camera" />
						<Link slot="inner-end" iconF7="mic" />
					</>
				)}
				{/* 表情、图片选择 */}
				<MessagebarSheet>
					<Emojis onEmojiSelect={onEmojiSelect} />
				</MessagebarSheet>
			</Messagebar>
			<Messages>
				{messages?.map((message, index) => (
					<Message
						key={index}
						first={isMessageFirst(message)}
						last={isMessageLast(message)}
						tail={isMessageLast(message)}
						name={member.get(message.sender)?.nickname}
						avatar={member.get(message.sender)?.avatar}
						type={message.sender === user.user_id ? 'sent' : 'received'}
						image={message.type === 3 ? [message.content] : ''}
						text={message.type === 1 ? message.content : ''}
					>
						<span slot="text-footer" className="text-xs text-gray-500">
							<div className="flex flex-row justify-between">
								<span>{sendStatusToText(message?.send_status)}</span>
								<span>{messageTime(message)}</span>
							</div>
						</span>
					</Message>
				))}
			</Messages>
		</Page>
	)
}