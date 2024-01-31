import React, { useState, useEffect, useRef } from 'react'
import { Page, f7 } from 'framework7-react'
import MessageBox from '@/components/Message/Chat'
import PropType from 'prop-types'
import { useUserStore } from '@/stores/user'
import { $t } from '@/i18n'
import { ArrowLeftIcon, MoreIcon } from '@/components/Icon/Icon'
import MsgBar from '@/components/Message/MsgBar'

GroupChat.propTypes = {
	f7route: PropType.object.isRequired,
	f7router: PropType.object.isRequired
}
export default function GroupChat({ f7route, f7router }) {
	// 用户信息
	const { user } = useUserStore()
	// 群号ID
	const receiverId = f7route.params.id
	// 会话ID
	const dialogId = f7route.query.dialog_id
	// 群信息
	const [groupInfo, setGroupInfo] = useState({})
	// 页面显示消息列表
	const [messages, setMessages] = useState([])
	// 是否首次进入
	const [isActive, setIsActive] = useState(true)

	// const message = {
	//     msg_id: null,
	//     mgs_is_self: true,
	//     msg_read_status: msgStatus.NOT_READ,
	//     msg_type: type,
	//     msg_content: sandText,
	//     msg_send_time: Date.now(),
	//     meg_sender_id: user.user_id,
	//     group_id: parseInt(ReceiverId),
	//     dialog_id: parseInt(DialogId),
	//     msg_send_state: sendState.LOADING
	// }
	const sendMessage = async (type, content) => {
		console.log(type, content)
	}

	const handlerMsgLongPress = (type, data) => {
		console.log(type, data)
	}

	return (
		<Page className="messages-page" noToolbar>
			<MessageBox
				messages={messages}
				header={
					<div className="fixed top-0 left-0 right-0 h-14 border-b flex items-center px-4 z-[999] bg-white">
						<div className="flex items-center w-full">
							<ArrowLeftIcon className="w-5 h-5 mr-3" onClick={() => f7router.back()} />
							<div className="flex items-center">
								<img src={groupInfo?.avatar} alt="" className="w-8 h-8 rounded-full mr-2" />
								<span>{groupInfo?.name}</span>
							</div>
							<div className="flex-1 flex justify-end">
								<MoreIcon
									className="w-7 h-7"
									onClick={() => f7router.navigate(`/chatinfo/${'group'}/${receiverId}/`)}
								/>
							</div>
						</div>
					</div>
				}
				footer={<MsgBar send={(content, type = 1) => sendMessage(type, content)} />}
				isFristIn={isActive}
				handlerLongPress={handlerMsgLongPress}
				list={groupInfo?.members || []}
			/>
		</Page>
	)
}
