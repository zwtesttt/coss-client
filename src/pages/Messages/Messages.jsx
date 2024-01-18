import $ from 'dom7'
import React, { useRef, useState, useEffect } from 'react'
import PropType from 'prop-types'
import { useLiveQuery } from 'dexie-react-hooks'
import { f7, Navbar, Link, Page, Messages, Message, Messagebar, MessagebarSheet, Icon } from 'framework7-react'
import DoubleTickIcon from '@/components/DoubleTickIcon'
import Emojis from './emojis/Emojis.jsx'
import './Messages.less'
import { useUserStore } from '@/stores/user'
import { dbService } from '@/db'
import _ from 'lodash-es'
import { sendToUser } from '@/api/msg'
// import { pgpDecrypt, pgpEncrypt } from '@/utils/utils'

// import { switchE2EKeyApi } from '@/api/relation'
// import WebSocketClient from '@/utils/WebSocketClient'

// TODO: 添加好友时交换双方密钥（地址）
import { toArrayBuffer, encrypt, decrypt } from '@/utils/signal/signal-protocol'
import { SessionCipher, SignalProtocolAddress } from '@privacyresearch/libsignal-protocol-typescript'
import { SignalProtocolStore } from '@/utils/signal/storage-type'
import { reconnectSession } from '@/utils/utils'

MessagesPage.propTypes = {
	f7route: PropType.object.isRequired
}

export default function MessagesPage({ f7route }) {
	// 会话信息
	const dialogId = f7route.query.dialog_id
	// 用户信息
	const { user } = useUserStore()
	// 用户 id
	// const UserId = user?.UserId
	// 会话 session
	const [sessionCipher, setSessionCipher] = useState()
	const [slefSessionCipher, setSessionSlefCipher] = useState()

	// 好友id/群聊id
	const ReceiverId = f7route.params.id
	// 好友信息
	const [contact, setContact] = useState({})
	// 消息
	const allMsg = useLiveQuery(() => dbService.findAll(dbService.TABLES.MSGS)) || []
	const [messages, setMessages] = useState([])

	const [isActive, setIsActive] = useState(true)

	// 联系人头像信息等
	// useEffect(() => {
	// 	if (!ReceiverId) return
	// 	;(async () => {
	// 		const contact = await WebDB.contacts.where('user_id').equals(ReceiverId).first()

	// 		console.log('contact', contact)
	// 		setContact(contact || {})
	// 	})()
	// }, [ReceiverId])

	// 初始化
	async function init() {
		try {
			console.log('ReceiverId', ReceiverId, user?.user_id)
			// 重连会话
			const cipher = await reconnectSession(ReceiverId, user?.user_id)
			setSessionCipher(cipher)

			const selfCipher = await reconnectSession(ReceiverId, user?.user_id, true)
			setSessionSlefCipher(selfCipher)
		} catch (error) {
			console.log('消息初始化失败', error)
		}
	}
	useEffect(() => {
		init()
	}, [])

	useEffect(() => {
		;(async () => {
			const allMsg = await dbService.findOneById(dbService.TABLES.MSGS, ReceiverId)
			if (!allMsg) return

			console.log('有消息')

			let cipher = sessionCipher
			let slefCipher = slefSessionCipher

			if (!cipher) cipher = await reconnectSession(ReceiverId, user?.user_id)
			console.log('sessionCipher', cipher)

			if (!slefCipher) slefCipher = await reconnectSession(ReceiverId, user?.user_id, true)
			console.log('slefCipher', slefCipher)

			let arr = allMsg.data || []
			for (let i = 0; i < arr.length; i++) {
				const item = arr[i]
				try {
					if (['sent', 'sending'].includes(item.type)) {
						item.content = await decrypt(JSON.parse(item.content), slefCipher)
					} else {
						item.content = await decrypt(JSON.parse(item.content), cipher)
					}
				} catch (error) {
					console.error('解密失败', error)
					continue
				}
			}

			setMessages(arr)
		})()
	}, [])

	// 初始化后执行
	useEffect(() => {
		const messagesContent = document.getElementsByClassName('page-content messages-content')[0]
		// 滚动到顶部加载更多
		messagesContent?.addEventListener(
			'scroll',
			_.throttle(async () => {
				if (messagesContent.scrollTop === 0) {
					console.log('触顶')
				}
			}, 1000)
		)
		return () => {
			messagesContent?.removeEventListener('scroll', () => {})
		}
	}, [])

	// 消息渲染处理
	const messageTime = (message) => {
		return message?.created_at
			? Intl.DateTimeFormat('en', { hour: 'numeric', minute: 'numeric' }).format(new Date(message.created_at))
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
	const messageType = (message) => {
		return message.receiver_id === ReceiverId ? 'sent' : 'received'
	}

	// 发送消息
	const messagebarRef = useRef(null)
	const [messageText, setMessageText] = useState('')
	const dbMsgToReqMsg = (obj) => {
		return {
			..._.mapKeys(_.pick(obj, ['content', 'receiver_id', 'content_type']), (value, key) => {
				if (key === 'content_type') return 'type'
				return key
			}),
			dialog_id: parseInt(dialogId)
		}
	}

	// useEffect(() => {
	// 	;(async () => {
	// 		if(isActive) return
	// 		const lastMsg = allMsg[0]?.data?.at(-1)

	// 		if (!lastMsg) return

	// 		// 解密
	// 		// lastMsg.content = await pgpDecrypt(lastMsg.content)

	// 		messages.push(lastMsg)

	// 		setMessages([...messages])
	// 	})()
	// }, [allMsg])

	const sendMessage = async (type, content) => {
		try {
			let encrypted = ''

			try {
				encrypted = await encrypt(content, sessionCipher)
				encrypted = JSON.stringify(encrypted)
				console.log('发送加密消息', encrypted)
			} catch (error) {
				console.log('发送加密消息失败', error)
				encrypted = content
			}

			let send_state = 'sending'
			const dbMsg = {
				sender_id: user.user_id,
				receiver_id: ReceiverId,
				// 发送方
				type: 'sent',
				content: encrypted,
				// 1: 文本, 2: 语音, 3: 图片
				content_type: type,
				date: new Date(),
				send_state,
				is_read: true
			}

			console.log('megs', dbMsg)

			// 发送消息接口
			try {
				const { code } = await sendToUser(dbMsgToReqMsg(dbMsg))
				dbMsg.send_state = code === 200 ? 'ok' : 'error'
			} catch (error) {
				console.error('发送失败', error)
			}

			// TODO: 现在是明文存储，后续希望可以使用密文
			// 查找本地消息记录
			const result = await dbService.findOneById(dbService.TABLES.MSGS, ReceiverId)

			// const text = await pgpEncrypt(content)
			const text = encrypted

			result
				? await dbService.update(dbService.TABLES.MSGS, ReceiverId, {
						user_id: ReceiverId,
						data: [...result.data, { ...dbMsg, content: text }]
					})
				: await dbService.add(dbService.TABLES.MSGS, {
						user_id: ReceiverId,
						data: [{ ...dbMsg, content: text }]
					})

			setMessages([...messages, { ...dbMsg, content }])
		} catch (error) {
			console.error('发送消息失败：', error)
			// throw error
		}
	}

	const sendTextMessage = async () => {
		sendMessage(1, messageText)
		// 恢复输入框状态
		setMessageText('')
		setTimeout(() => {
			messagebarRef.current.f7Messagebar().focus()
		})
	}

	// 图片表情
	const [sheetVisible, setSheetVisible] = useState(false)
	const onEmojiSelect = ({ type, emoji }) => {
		console.log(type, emoji)
		type === 'emoji' && setMessageText(`${messageText}${emoji}`)
		type === 'img' && sendMessage(3, emoji)
	}

	// Fix for iOS web app scroll body when
	const resizeTimeout = useRef(null)
	const onViewportResize = () => {
		$('html, body').css('height', `${visualViewport.height}px`)
		$('html, body').scrollTop(0)
	}
	const onMessagebarFocus = () => {
		const { device } = f7
		if (!device.ios || device.cordova || device.capacitor) return
		clearTimeout(resizeTimeout.current)
		visualViewport.addEventListener('resize', onViewportResize)
	}
	const onMessagebarBlur = () => {
		const { device } = f7
		if (!device.ios || device.cordova || device.capacitor) return
		resizeTimeout.current = setTimeout(() => {
			visualViewport.removeEventListener('resize', onViewportResize)
			$('html, body').css('height', '')
			$('html, body').scrollTop(0)
		}, 100)
	}

	return (
		<Page className="messages-page" noToolbar messagesContent>
			<Navbar className="messages-navbar" backLink backLinkShowText={false}>
				<Link slot="right" iconF7="videocam" />
				<Link slot="right" iconF7="phone" />
				<Link slot="title" href={`/profile/${ReceiverId}/`} className="title-profile-link">
					<img src={contact?.avatar} loading="lazy" />
					<div>
						<div>{contact?.name}</div>
						<div className="subtitle">online</div>
					</div>
				</Link>
			</Navbar>
			<Messagebar
				ref={messagebarRef}
				placeholder=""
				value={messageText}
				sheetVisible={sheetVisible}
				onInput={(e) => setMessageText(e.target.value)}
				onFocus={onMessagebarFocus}
				onBlur={onMessagebarBlur}
			>
				<Link slot="inner-start" iconF7="plus" />
				<Link
					className="messagebar-sticker-link"
					slot="after-area"
					iconF7="smiley"
					onClick={() => {
						setSheetVisible(!sheetVisible)
					}}
				/>
				{messageText.trim().length ? (
					<Link
						slot="inner-end"
						className="messagebar-send-link"
						iconF7="paperplane_fill"
						onClick={sendTextMessage}
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
				{messages.map((message, index) => (
					<Message
						key={index}
						className="message-appear-from-bottom"
						data-key={index}
						first={isMessageFirst(message)}
						last={isMessageLast(message)}
						tail={isMessageLast(message)}
						image={message.content_type === 3 ? [message.content] : []}
						type={messageType(message)}
						text={message.content_type === 3 ? '' : message.content}
					>
						<span slot="text-footer">
							{messageTime(message)}
							{/* 发送状态 */}
							{message?.send_state && message.type === 'sent' ? (
								message.send_state === 'ok' ? (
									<DoubleTickIcon />
								) : (
									// message.send_state
									<Icon
										className="text-base"
										f7={message.send_state === 'sending' ? 'slowmo' : 'wifi_slash'}
										color="primary"
									/>
								)
							) : (
								''
							)}
						</span>
					</Message>
				))}
			</Messages>
		</Page>
	)
}
