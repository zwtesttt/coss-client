import React, { useState, useEffect, useRef } from 'react'
import $ from 'dom7'
import { f7, Views, View, Toolbar, Link } from 'framework7-react'

// import f7params from '@/config'
// import { clsx } from 'clsx'
// import i18next from 'i18next'
import { $t } from '@/i18n'
// import { useTranslation } from 'react-i18next'
import { useUserStore } from '@/stores'

const AppComponent = () => {
	const [activeTab, setActiveTab] = useState('chats')
	const previousTab = useRef('chats')

	const { isLogin } = useUserStore()

	console.log('isLogin', isLogin,f7)

	if (!isLogin) {
		// 跳转登录页面
		// f7.views.main.router.navigate('/login')
	}

	useEffect(() => {
		// 修复手机上的视口比例
		if ((f7.device.ios || f7.device.android) && f7.device.standalone) {
			const viewEl = document.querySelector('meta[name="viewport"]')
			viewEl.setAttribute('content', `${viewEl.getAttribute('content')}, maximum-scale=1, user-scalable=no`)
		}
	}, [])

	// 按钮切换
	function onTabLinkClick(tab) {
		if (previousTab.current !== activeTab) {
			previousTab.current = activeTab
			return
		}
		if (activeTab === tab) {
			$(`#view-${tab}`)[0].f7View.router.back()
		}
		previousTab.current = tab
	}

	return (
		<Views tabs className="safe-area">
			<Toolbar tabbar icons bottom>
				<Link
					tabLink="#view-chats"
					tabLinkActive
					iconF7="chat_bubble_2"
					text={$t('聊天')}
					onClick={() => onTabLinkClick('chats')}
				/>
				<Link
					tabLink="#view-contacts"
					iconF7="phone"
					text={$t('联系人')}
					onClick={() => onTabLinkClick('contacts')}
				/>
				<Link tabLink="#view-mine" iconF7="person" text={$t('我的')} onClick={() => onTabLinkClick('mine')} />
			</Toolbar>

			<View id="view-chats" onTabShow={() => setActiveTab('chats')} tab tabActive url="/chats/" main />
			<View id="view-contacts" onTabShow={() => setActiveTab('contacts')} tab url="/contacts/" />
			<View id="view-mine" onTabShow={() => setActiveTab('mine')} tab url="/mine/" />
		</Views>
	)
}

export default AppComponent