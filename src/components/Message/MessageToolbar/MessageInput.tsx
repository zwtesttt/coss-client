import ToolEditor, { ToolEditorMethods } from '@/Editor'
import { $t, emojiOrMore, msgSendType } from '@/shared'
import { useEffect, useRef } from 'react'
import useMessageStore from '@/stores/new_message'
import Quill from 'quill'

const MessageInput = () => {
	const toolEditorRef = useRef<ToolEditorMethods | null>(null)
	const messageStore = useMessageStore()
	const inputRef = useRef<HTMLDivElement | null>(null)

	const isEmojiFocus = useRef<boolean>(false)

	const handlerChange = (content: string) => {
		if (!toolEditorRef.current) return
		const isEmpty = toolEditorRef.current.quill.getLength() <= 1
		const sendType = isEmpty ? msgSendType.AUDIO : msgSendType.TEXT
		messageStore.update({ content, sendType })
	}

	useEffect(() => {
		if (!toolEditorRef.current || !toolEditorRef.current.quill) return

		const quill = toolEditorRef.current.quill

		const handlerFocus = () => {
			messageStore.update({ toolbarType: emojiOrMore.KEYBOARD })
			// 如果是插入表情触发的聚焦，不做处理
			if (isEmojiFocus.current) return
			messageStore.update({ toolbarType: emojiOrMore.NONE })
		} 

		const handlerBlur = () => {
			messageStore.update({ toolbarType: emojiOrMore.NONE })
		}

		quill.root.addEventListener('focus', handlerFocus)
		quill.root.addEventListener('blur', handlerBlur)

		return () => {
			quill.root.removeEventListener('focus', handlerFocus)
			quill.root.removeEventListener('blur', handlerBlur)
		}
	}, [toolEditorRef.current])

	// 插入表情
	useEffect(() => {
		if (!messageStore.selectedEmojis) return
		const quill = toolEditorRef.current?.quill
		if (!quill) return
		isEmojiFocus.current = true
		quill?.focus()
		quill?.insertText(quill.getSelection()?.index || 0, messageStore.selectedEmojis, Quill.sources.API)
		quill?.blur()
		isEmojiFocus.current = false
		messageStore.update({ selectedEmojis: '' })
	}, [messageStore.selectedEmojis])

	// 清空文本
	useEffect(() => {
		if (!messageStore.isClearContent) return
		const quill = toolEditorRef.current?.quill
		if (!quill) return
		quill.deleteText(0, quill.getLength() - 1)
		if (toolEditorRef.current && !isEmojiFocus.current) quill.focus()
		messageStore.update({ isClearContent: false })
	}, [messageStore.isClearContent])

	// 点击键盘时聚焦输入框
	useEffect(() => {
		if (messageStore.toolbarType !== emojiOrMore.KEYBOARD) return
		const quill = toolEditorRef.current?.quill
		if (!quill) return
		quill.focus()
	}, [messageStore.toolbarType])

	return (
		<div className="flex-1 py-2 bg-bgTertiary min-h-10 rounded max-h-[150px] overflow-y-auto" ref={inputRef}>
			<ToolEditor
				readonly={false}
				placeholder={$t('请输入消息')}
				ref={toolEditorRef}
				defaultValue={messageStore.draft}
				onChange={handlerChange}
			/>
		</div>
	)
}

export default MessageInput
