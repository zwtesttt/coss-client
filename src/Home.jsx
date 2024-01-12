import React, { useEffect } from 'react'
import { getDevice } from 'framework7/lite-bundle'
// import './i18n'
// import '@/config'
// import f7params from '@/config'
import cordovaApp from '@/config/cordova-app'

import AppComponent from './pages/App'
import { f7, App, f7ready, Views, View } from 'framework7-react'

import routes from '@/config/routes'
import { useUserStore } from '@/stores/user'
// import { useChatsStore } from '@/stores/chats'
import WebSocketClient from '@/utils/WebSocketClient'
import WebDB from '@/db'
// import { useLiveQuery } from 'dexie-react-hooks'

/**
 * 这里主要做一些全局配置之类的事情
 * @returns
 */
const Home = () => {
	const { isLogin, user } = useUserStore()
	// const { chats, updateChats } = useChatsStore()
	const device = getDevice()

	// Framework7 Parameters
	const f7params = {
		name: '', // App name
		theme: 'auto', // Automatic theme detection

		// App store
		store: [],
		// App routes
		routes: routes,

		// Input settings
		input: {
			scrollIntoViewOnFocus: device.cordova,
			scrollIntoViewCentered: device.cordova
		},
		// Cordova Statusbar settings
		statusbar: {
			iosOverlaysWebView: true,
			androidOverlaysWebView: false
		},

		colors: {
			primary: '#33a854'
		}
	}

	// TODO: 国际化
	// i18next.changeLanguage('zh-CN')

	f7ready(() => {
		// 注册 cordova API
		if (f7.device.cordova) {
			cordovaApp.init(f7)
		}
	})

	// 连接ws并监听消息推送
	useEffect(() => {
		if (!isLogin) return
		console.log(user.nick_name, user.user_id)
		WebSocketClient.closeConnection()
		WebSocketClient.connect()
		WebSocketClient.addListener('onWsMessage', (e) => {
			const data = JSON.parse(e.data)
			// event: 1 => 用户上线，2 => 用户下线，3 => 用户发送消息，4 => 群聊发送消息，5 => 系统推送消息
			if (data.event === 3 || data.event === 4 || data.event === 5) {
				WebSocketClient.triggerEvent('onMessage', data)
			}
		})
		WebSocketClient.addListener('onMessage', (msg) => {
			if (msg.event === 3) {
				console.log(msg)
				const message = {
					// id: '', // msg_id: '', // 消息id
					sender_id: '', // 发送者id
					receiver_id: msg.uid, // 接收者id
					content: msg.data.content,
					content_type: msg.data.msgType, // 消息类型 => 1: 文本消息
					type: 'received', // 接收方
					reply_id: msg.data.reply_id, // 所回复消息的id
					read_at: null, // 接收时间/读取时间
					created_at: msg.data.send_at, // 发送时间
					dialog_id: msg.data.dialog_id, // 会话id
					send_state: 'ok' // 发送成功/接收成功
				}
				console.log(message)
				// 消息持久化
				WebDB.messages.add(message)
				// TODO：检查当前会话是否存在 => 新建会话数据 or 更新会话列表数据
				// const chats = useLiveQuery(() => WebDB.chats.toArray()) || []
				// 检查当前会话是否存在 ? WebDB.chats.add({}) : WebDB.chats.update(msg.data.msg_id, {})
				console.log(msg.data.dialog_id)
				console.log(WebDB.chats.where('dialog_id').equals(msg.data.dialog_id).fiest())
			}
		})
	}, [isLogin])

	return (
		<App {...f7params}>
			<Views tabs className="safe-area">
				{isLogin ? <AppComponent isLogin={isLogin} /> : <View id="view-auth" name="auth" url="/auth/" />}
			</Views>
		</App>
	)
}

export default Home
