import type { PrivateChats } from '@/types/db/user-db'
import clsx from 'clsx'
import { Exclamationmark, Gobackward, Flag } from 'framework7-icons/react'
import { format } from 'timeago.js'
import { RefObject, useRef } from 'react'
import { createRoot } from 'react-dom/client'

import { $t, isMe, MESSAGE_SEND, MESSAGE_TYPE } from '@/shared'
// import ToolEditor from '@/components/Editor/ToolEditor'
import ToolTip from './ToolTip'
import LongPressButton from '@/components/LongPressButton/LongPressButton'
import ToolEditor from '@/Editor'

interface ChatProps {
	msg: PrivateChats
	index: number
	onSelect: (...args: any[]) => void
	className?: string
	isSelected?: boolean
	reply?: any
	ref?: RefObject<HTMLDivElement>
}

const Chat: React.FC<ChatProps> = ({ msg, index, onSelect, className, isSelected, reply, ref }) => {
	const tooltipRef = useRef<HTMLDivElement | null>(null)

	const is_self = isMe(msg?.sender_id)

	const createTooltip = () => {
		if (isSelected) return
		const div = document.createElement('div')
		createRoot(div).render(<ToolTip onSelect={onSelect} el={tooltipRef.current!} />)
		tooltipRef.current!.appendChild(div)
	}

	if (msg?.type === MESSAGE_TYPE.LABEL) {
		return (
			<div className="max-w-[70%] w-fit bg-gray-200 px-2 py-[2px] text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap text-[0.75rem] rounded mx-auto text-center cursor-pointer active:bg-opacity-50">
				{$t(msg?.sender_info?.nickname || msg?.sender_info?.name)}
				&nbsp;
				{msg?.is_label !== 0 ? $t('标注了') : $t('取消标注')}&nbsp;
				{`"${msg?.content}"`}
			</div>
		)
	}

	if (msg?.type === MESSAGE_TYPE.ERROR) {
		return (
			<div className="max-w-[70%] w-fit bg-gray-200 px-2 py-[2px] flex items-center text-red-500 overflow-hidden text-ellipsis whitespace-nowrap text-[0.75rem] rounded mx-auto text-center cursor-pointer active:bg-opacity-50">
				{msg?.content}
			</div>
		)
	}

	return (
		<div
			className={clsx('flex', is_self ? 'justify-end' : 'justify-start', className)}
			id={`msg_${msg?.msg_id}`}
			ref={ref}
		>
			<div className="flex max-w-[85%]">
				<div
					className={clsx(
						'w-10 h-10 rounded-full overflow-hidden',
						is_self ? 'order-last ml-2' : 'order-first mr-2'
					)}
				>
					<img
						src={msg?.sender_info?.avatar}
						alt={msg?.sender_info?.nickname}
						className="w-full h-full rounded-full object-cover"
					/>
				</div>
				<div
					className={clsx(
						'flex flex-col flex-1',
						is_self ? 'order-first items-end' : 'order-last items-start'
					)}
				>
					<div className="mb-1 text-[0.85rem]"></div>

					<LongPressButton callback={() => createTooltip()}>
						<div
							className={clsx(
								'rounded-lg relative py-2 break-all mb-1 select-none',
								is_self
									? 'bg-primary text-white  after:left-full after:border-l-primary rounded-tr-none '
									: 'bg-bgPrimary after:right-full after:border-r-white rounded-tl-none '
							)}
							data-id={msg?.msg_id}
							data-index={index}
							data-label={msg?.is_label}
							ref={tooltipRef}
						>
							{/* <ToolEditor
								readonly
								className="select-none text-[1rem]"
								defaultValue={msg?.content}
								data-id={msg?.msg_id}
								data-index={index}
							/> */}
							<ToolEditor
								className="select-none text-[1rem] h-auto empty:before:text-transparent"
								initValue={msg?.content}
								data-id={msg?.msg_id}
								data-index={index}
							/>
						</div>
					</LongPressButton>

					{/* 发送状态 */}
					<div
						className={clsx('flex text-[0.85rem] items-center', is_self ? 'justify-end' : 'justify-start')}
					>
						<span className="text-[0.85rem] mr-1">{format(msg?.created_at, 'zh_CN')}</span>
						{is_self && (
							<>
								{msg?.msg_send_state === MESSAGE_SEND.SEND_FAILED && (
									<Exclamationmark className="text-red-500" />
								)}

								{msg?.msg_send_state === MESSAGE_SEND.SEND_FAILED && <Gobackward />}
							</>
						)}
						{msg?.is_label !== 0 && <Flag className="text-primary ml-[2px]" />}
					</div>

					{/* 回复消息 */}
					{reply && (
						<div
							className={clsx(
								'mt-2 px-2 bg-gray-200 max-w-[50%] rounded text-[0.75rem] flex items-center text-gray-500 text-ellipsis line-clamp-1 overflow-hidden break-all active:bg-opacity-50"',
								is_self ? 'text-right' : 'text-left'
							)}
						>
							<div className="whitespace-nowrap text-[0.75rem] w-fit text-textTertiary">
								{reply?.sender_info?.nickname}:
							</div>
							{/* <ToolEditor readonly className="reply_editor" defaultValue={reply?.content} /> */}
							<ToolEditor
								className="reply_editor empty:before:text-transparent"
								initValue={reply?.content}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default Chat